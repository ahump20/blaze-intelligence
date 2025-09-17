import passport from 'passport';
import session from 'express-session';
import connectPg from 'connect-pg-simple';
import { Strategy } from 'openid-client/passport';
import * as client from 'openid-client';
import pool from '../db.js';

// Simple Replit Auth integration for Blaze Intelligence
export class ReplitAuthManager {
  constructor(app) {
    this.app = app;
    this.isSetup = false;
  }

  async initialize() {
    try {
      // Skip if no required environment variables
      if (!process.env.REPL_ID) {
        console.log('🔐 Replit Auth: REPL_ID not found, skipping integration');
        this.setupFallbackRoutes();
        return false;
      }

      console.log('🔐 Setting up Replit Auth integration...');
      
      // Configure session storage
      const pgStore = connectPg(session);
      const sessionStore = new pgStore({
        conString: process.env.DATABASE_URL,
        createTableIfMissing: false,
        ttl: 7 * 24 * 60 * 60, // 7 days
        tableName: "replit_sessions",
      });

      // Setup session middleware with secure secret requirement
      if (!process.env.SESSION_SECRET) {
        throw new Error('SESSION_SECRET environment variable is required for secure session handling');
      }
      
      this.app.use(session({
        secret: process.env.SESSION_SECRET,
        store: sessionStore,
        resave: false,
        saveUninitialized: false,
        cookie: {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        },
      }));

      // Setup passport
      this.app.use(passport.initialize());
      this.app.use(passport.session());

      // Configure OIDC
      const config = await client.discovery(
        new URL("https://replit.com/oidc"),
        process.env.REPL_ID
      );

      // Setup Replit Auth strategy
      const strategy = new Strategy({
        config,
        scope: "openid email profile",
        callbackURL: "/api/auth/replit/callback",
      }, async (tokens, done) => {
        try {
          const claims = tokens.claims();
          const user = await this.upsertUser(claims);
          done(null, { user, tokens });
        } catch (error) {
          done(error);
        }
      });

      passport.use('replit', strategy);
      
      passport.serializeUser((data, done) => {
        done(null, data.user.id);
      });

      passport.deserializeUser(async (userId, done) => {
        try {
          const user = await this.getUser(userId);
          done(null, user);
        } catch (error) {
          done(error);
        }
      });

      // Setup routes
      this.setupAuthRoutes();
      this.isSetup = true;
      
      console.log('✅ Replit Auth integration ready');
      return true;
    } catch (error) {
      console.error('❌ Replit Auth setup failed:', error.message);
      this.setupFallbackRoutes();
      return false;
    }
  }

  setupAuthRoutes() {
    // Login route
    this.app.get('/api/login', (req, res, next) => {
      passport.authenticate('replit', {
        prompt: 'consent'
      })(req, res, next);
    });

    // Callback route
    this.app.get('/api/auth/replit/callback', 
      passport.authenticate('replit', { 
        failureRedirect: '/?error=auth_failed' 
      }),
      (req, res) => {
        res.redirect('/');
      }
    );

    // Logout route
    this.app.get('/api/logout', (req, res) => {
      req.logout(() => {
        req.session.destroy(() => {
          res.redirect('/');
        });
      });
    });

    // User info route (replaces existing /api/auth/user)
    this.app.get('/api/auth/user', this.requireAuth.bind(this), async (req, res) => {
      try {
        const user = await this.getUser(req.user.id);
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }

        res.json({
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          fullName: user.full_name,
          profileImageUrl: user.profile_image_url,
          role: user.role,
          organization: user.organization,
          primarySport: user.primary_sport,
          createdAt: user.created_at,
          updatedAt: user.updated_at
        });
      } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Failed to fetch user' });
      }
    });
  }

  setupFallbackRoutes() {
    // Fallback routes that redirect to existing auth
    this.app.get('/api/login', (req, res) => {
      res.redirect('/login.html');
    });

    this.app.get('/api/logout', (req, res) => {
      res.redirect('/');
    });

    console.log('🔐 Replit Auth fallback routes configured');
  }

  requireAuth(req, res, next) {
    if (req.isAuthenticated && req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: 'Authentication required' });
  }

  async upsertUser(claims) {
    try {
      const userId = claims.sub;
      const userData = {
        id: userId,
        email: claims.email,
        first_name: claims.first_name,
        last_name: claims.last_name,
        full_name: `${claims.first_name || ''} ${claims.last_name || ''}`.trim(),
        profile_image_url: claims.profile_image_url,
        role: 'free_user',
        email_verified: true
      };

      // Check if user exists
      const existing = await pool.query('SELECT id FROM users WHERE id = $1', [userId]);
      
      if (existing.rows.length > 0) {
        // Update existing user
        const result = await pool.query(`
          UPDATE users SET 
            email = $2, first_name = $3, last_name = $4, 
            full_name = $5, profile_image_url = $6, updated_at = CURRENT_TIMESTAMP
          WHERE id = $1 RETURNING *
        `, [userId, userData.email, userData.first_name, userData.last_name, 
            userData.full_name, userData.profile_image_url]);
        return result.rows[0];
      } else {
        // Create new user
        const result = await pool.query(`
          INSERT INTO users (id, email, first_name, last_name, full_name, 
                           profile_image_url, role, email_verified)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
        `, [userId, userData.email, userData.first_name, userData.last_name,
            userData.full_name, userData.profile_image_url, userData.role, userData.email_verified]);
            
        const user = result.rows[0];
        
        // Create default subscription
        await pool.query(`
          INSERT INTO subscriptions (user_id, plan_type, status, trial_ends_at)
          VALUES ($1, 'free', 'active', $2)
        `, [user.id, new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)]);
        
        return user;
      }
    } catch (error) {
      console.error('Error upserting user:', error);
      throw error;
    }
  }

  async getUser(userId) {
    try {
      const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
      return result.rows[0];
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }
}

export default ReplitAuthManager;