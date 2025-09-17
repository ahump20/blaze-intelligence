// Blaze Intelligence Authentication Handler
// Premium Feature Access Control

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// JWT Secret (use environment variable in production)
const JWT_SECRET = process.env.JWT_SECRET || 'blaze-championship-secret-2025';

// Premium feature tiers
const SUBSCRIPTION_TIERS = {
  FREE: {
    name: 'Scout',
    features: ['basic_stats', 'limited_scores', 'public_data'],
    apiCalls: 100,
    price: 0
  },
  RECRUIT: {
    name: 'Recruit',
    features: ['live_scores', 'basic_analytics', 'nil_tracking'],
    apiCalls: 1000,
    price: 29
  },
  ALL_AMERICAN: {
    name: 'All-American',
    features: ['advanced_analytics', 'video_ai', 'recruiting_intel', 'transfer_portal'],
    apiCalls: 10000,
    price: 99
  },
  CHAMPIONSHIP: {
    name: 'Championship',
    features: ['all_features', 'api_access', 'custom_reports', 'white_label', 'dedicated_support'],
    apiCalls: -1, // Unlimited
    price: 499
  }
};

// In-memory user storage (replace with database in production)
const users = new Map();

// Demo user for testing
users.set('demo@blazeintelligence.com', {
  userId: 'demo_user_123',
  email: 'demo@blazeintelligence.com',
  name: 'Demo User',
  password: '$2a$10$demo.hash.placeholder',
  tier: 'CHAMPIONSHIP',
  created: new Date().toISOString()
});

// Helper function to generate JWT
function generateToken(userId, email, tier) {
  return jwt.sign(
    {
      userId,
      email,
      tier,
      features: SUBSCRIPTION_TIERS[tier].features,
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
    },
    JWT_SECRET
  );
}

// Helper function to verify JWT
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Main handler
exports.handler = async (event, context) => {
  const { path, httpMethod, body, headers } = event;
  const endpoint = path.replace('/.netlify/functions/auth-handler', '');

  const responseHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  };

  // Handle preflight requests
  if (httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: responseHeaders,
      body: ''
    };
  }

  try {
    let response = {};
    const requestBody = body ? JSON.parse(body) : {};

    switch (endpoint) {
      case '/register':
        if (httpMethod !== 'POST') {
          throw new Error('Method not allowed');
        }
        response = await handleRegister(requestBody);
        break;

      case '/login':
        if (httpMethod !== 'POST') {
          throw new Error('Method not allowed');
        }
        response = await handleLogin(requestBody);
        break;

      case '/verify':
        response = await handleVerify(headers.authorization);
        break;

      case '/profile':
        response = await handleProfile(headers.authorization);
        break;

      case '/demo':
        response = await handleDemoLogin();
        break;

      case '/health':
        response = {
          status: 'healthy',
          users: users.size,
          timestamp: new Date().toISOString()
        };
        break;

      default:
        throw new Error('Endpoint not found');
    }

    return {
      statusCode: 200,
      headers: responseHeaders,
      body: JSON.stringify({
        success: true,
        data: response,
        timestamp: new Date().toISOString()
      })
    };
  } catch (error) {
    return {
      statusCode: error.statusCode || 400,
      headers: responseHeaders,
      body: JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
};

// Handle user registration
async function handleRegister({ email, password, name, organization }) {
  // Validate input
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  // Check if user exists
  if (users.has(email)) {
    throw new Error('User already exists');
  }

  // Create user (simplified for demo)
  const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const user = {
    userId,
    email,
    name: name || email.split('@')[0],
    organization: organization || 'Individual',
    tier: 'FREE',
    created: new Date().toISOString(),
    password: 'hashed_password_placeholder' // In production, hash with bcrypt
  };

  users.set(email, user);

  // Generate token
  const token = generateToken(userId, email, 'FREE');

  return {
    token,
    user: {
      userId: user.userId,
      email: user.email,
      name: user.name,
      organization: user.organization,
      tier: user.tier
    },
    subscription: SUBSCRIPTION_TIERS.FREE
  };
}

// Handle user login
async function handleLogin({ email, password }) {
  // Validate input
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  // Demo user login
  if (email === 'demo@blazeintelligence.com' && password === 'championship2025') {
    const token = generateToken('demo_user_123', email, 'CHAMPIONSHIP');
    return {
      token,
      user: {
        userId: 'demo_user_123',
        email: 'demo@blazeintelligence.com',
        name: 'Demo User',
        organization: 'Blaze Intelligence',
        tier: 'CHAMPIONSHIP'
      },
      subscription: SUBSCRIPTION_TIERS.CHAMPIONSHIP
    };
  }

  // Check user exists
  const user = users.get(email);
  if (!user) {
    throw new Error('Invalid credentials');
  }

  // In production, verify password with bcrypt
  // For demo, accept any password for existing users
  const token = generateToken(user.userId, user.email, user.tier);

  return {
    token,
    user: {
      userId: user.userId,
      email: user.email,
      name: user.name,
      organization: user.organization,
      tier: user.tier
    },
    subscription: SUBSCRIPTION_TIERS[user.tier]
  };
}

// Handle token verification
async function handleVerify(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No token provided');
  }

  const token = authHeader.substring(7);
  const decoded = verifyToken(token);

  if (!decoded) {
    throw new Error('Invalid token');
  }

  return {
    valid: true,
    userId: decoded.userId,
    email: decoded.email,
    tier: decoded.tier,
    features: decoded.features,
    expiresAt: new Date(decoded.exp * 1000).toISOString()
  };
}

// Handle user profile
async function handleProfile(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No token provided');
  }

  const token = authHeader.substring(7);
  const decoded = verifyToken(token);

  if (!decoded) {
    throw new Error('Invalid token');
  }

  // Get user details
  const user = Array.from(users.values()).find(u => u.userId === decoded.userId);

  if (!user) {
    throw new Error('User not found');
  }

  return {
    userId: user.userId,
    email: user.email,
    name: user.name,
    organization: user.organization,
    tier: user.tier,
    created: user.created,
    features: SUBSCRIPTION_TIERS[user.tier].features,
    apiLimit: SUBSCRIPTION_TIERS[user.tier].apiCalls
  };
}

// Handle demo login (no credentials required)
async function handleDemoLogin() {
  const token = generateToken('demo_user_123', 'demo@blazeintelligence.com', 'CHAMPIONSHIP');

  return {
    token,
    user: {
      userId: 'demo_user_123',
      email: 'demo@blazeintelligence.com',
      name: 'Demo User',
      organization: 'Blaze Intelligence',
      tier: 'CHAMPIONSHIP'
    },
    subscription: SUBSCRIPTION_TIERS.CHAMPIONSHIP,
    message: 'Demo access granted - full Championship features available'
  };
}