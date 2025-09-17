import pool from './db.js';

// Interface for storage operations compatible with Replit Auth
export class DatabaseStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  
  async getUser(id) {
    try {
      const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error getting user:', error);
      return undefined;
    }
  }

  async upsertUser(userData) {
    try {
      // Check if user exists
      const existingUser = await pool.query(
        'SELECT id FROM users WHERE id = $1',
        [userData.id]
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
            userData.id,
            userData.email,
            userData.firstName,
            userData.lastName,
            userData.profileImageUrl
          ]
        );
        return result.rows[0];
      } else {
        // Create new user
        const result = await pool.query(
          `INSERT INTO users (id, email, first_name, last_name, profile_image_url, role, email_verified)
           VALUES ($1, $2, $3, $4, $5, 'free_user', true)
           RETURNING *`,
          [
            userData.id,
            userData.email,
            userData.firstName,
            userData.lastName,
            userData.profileImageUrl
          ]
        );
        
        const user = result.rows[0];
        
        // Create default subscription for new users
        await pool.query(
          `INSERT INTO subscriptions (user_id, plan_type, status, trial_ends_at)
           VALUES ($1, 'free', 'active', $2)`,
          [user.id, new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)]
        );
        
        return user;
      }
    } catch (error) {
      console.error('Error upserting user:', error);
      throw error;
    }
  }

  // Other storage operations for existing functionality
  async getUserSubscription(userId) {
    try {
      const result = await pool.query(
        'SELECT * FROM subscriptions WHERE user_id = $1',
        [userId]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error getting user subscription:', error);
      return undefined;
    }
  }

  async updateSubscription(userId, subscriptionData) {
    try {
      const result = await pool.query(
        `UPDATE subscriptions SET 
         stripe_customer_id = $2,
         stripe_subscription_id = $3,
         plan_type = $4,
         status = $5,
         current_period_start = $6,
         current_period_end = $7,
         cancel_at_period_end = $8,
         updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $1
         RETURNING *`,
        [
          userId,
          subscriptionData.stripeCustomerId,
          subscriptionData.stripeSubscriptionId,
          subscriptionData.planType,
          subscriptionData.status,
          subscriptionData.currentPeriodStart,
          subscriptionData.currentPeriodEnd,
          subscriptionData.cancelAtPeriodEnd
        ]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();