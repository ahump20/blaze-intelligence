import express from 'express';
import { setupAuth, isAuthenticated, storage } from '../replitAuth.js';

const router = express.Router();

// This will be integrated into the main server setup
export async function registerReplitAuthRoutes(app) {
  // Setup Replit Auth middleware
  await setupAuth(app);

  // Auth status endpoint
  app.get('/api/auth/user', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Return user data in consistent format
      res.json({
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        fullName: user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim(),
        profileImageUrl: user.profile_image_url,
        role: user.role,
        organization: user.organization,
        primarySport: user.primary_sport,
        emailVerified: user.email_verified,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Protected route example
  app.get("/api/protected", isAuthenticated, async (req, res) => {
    const userId = req.user?.claims?.sub;
    res.json({ 
      message: "Access granted", 
      userId,
      timestamp: new Date().toISOString()
    });
  });

  // Legacy compatibility - redirect old auth routes to Replit Auth
  app.get('/api/auth/login', (req, res) => {
    res.redirect('/api/login');
  });

  app.get('/api/auth/logout', (req, res) => {
    res.redirect('/api/logout');
  });
}

export default router;