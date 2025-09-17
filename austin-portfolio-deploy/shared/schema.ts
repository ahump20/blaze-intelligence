// TypeScript interfaces for database entities
// Compatible with existing PostgreSQL schema

// User interface compatible with both existing system and Replit Auth
export interface User {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  
  // Existing fields for backward compatibility
  password_hash?: string;
  full_name?: string;
  organization?: string;
  primary_sport?: string;
  role?: string;
  email_verified?: boolean;
  verification_token?: string;
  reset_token?: string;
  reset_token_expires?: Date;
  
  created_at?: Date;
  updated_at?: Date;
}

// Upsert user type for Replit Auth compatibility
export interface UpsertUser {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
}

// Subscription interface (existing)
export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  plan_type: string;
  status: string;
  trial_ends_at?: Date;
  current_period_start?: Date;
  current_period_end?: Date;
  cancel_at_period_end?: boolean;
  created_at?: Date;
  updated_at?: Date;
}