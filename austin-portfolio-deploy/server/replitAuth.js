import * as client from "openid-client";
import { Strategy, VerifyFunction } from "openid-client/passport";
import passport from "passport";
import session from "express-session";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import pool from "./db.js";

if (!process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user,
  tokens
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(claims) {
  try {
    // Check if user exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE id = $1',
      [claims["sub"]]
    );

    if (existingUser.rows.length > 0) {
      // Update existing user
      const result = await pool.query(
        `UPDATE users SET 
         email = $2, 
         first_name = $3, 
         last_name = $4, 
         profile_image_url = $5, 
         updated_at = CURRENT_TIMESTAMP
         WHERE id = $1 
         RETURNING *`,
        [
          claims["sub"],
          claims["email"],
          claims["first_name"],
          claims["last_name"],
          claims["profile_image_url"]
        ]
      );
      return result.rows[0];
    } else {
      // Create new user with Replit ID
      const result = await pool.query(
        `INSERT INTO users (id, email, first_name, last_name, profile_image_url, role, email_verified)
         VALUES ($1, $2, $3, $4, $5, 'free_user', true)
         RETURNING *`,
        [
          claims["sub"],
          claims["email"],
          claims["first_name"],
          claims["last_name"],
          claims["profile_image_url"]
        ]
      );
      
      const user = result.rows[0];
      
      // Create default subscription for new users
      await pool.query(
        `INSERT INTO subscriptions (user_id, plan_type, status, trial_ends_at)
         VALUES ($1, 'free', 'active', $2)`,
        [user.id, new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)] // 14 day trial
      );
      
      return user;
    }
  } catch (error) {
    console.error('Error upserting user:', error);
    throw error;
  }
}

export async function setupAuth(app) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const config = await getOidcConfig();

  const verify = async (tokens, verified) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };

  for (const domain of process.env.REPLIT_DOMAINS.split(",")) {
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `https://${domain}/api/callback`,
      },
      verify,
    );
    passport.use(strategy);
  }

  passport.serializeUser((user, cb) => cb(null, user));
  passport.deserializeUser((user, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login",
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
        }).href
      );
    });
  });
}

export const isAuthenticated = async (req, res, next) => {
  const user = req.user;

  if (!req.isAuthenticated() || !user?.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};

// Storage interface for Replit Auth compatibility
export const storage = {
  async getUser(id) {
    try {
      const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error getting user:', error);
      return undefined;
    }
  },

  async upsertUser(userData) {
    return await upsertUser({
      sub: userData.id,
      email: userData.email,
      first_name: userData.firstName,
      last_name: userData.lastName,
      profile_image_url: userData.profileImageUrl
    });
  }
};