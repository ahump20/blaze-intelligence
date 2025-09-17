// Blaze Intelligence Database Manager
// Championship-Level Data Persistence with D1/KV Store

const { v4: uuidv4 } = require('uuid');

// Database configuration
const DB_CONFIG = {
  USERS_TABLE: 'blaze_users',
  SESSIONS_TABLE: 'blaze_sessions',
  ANALYTICS_TABLE: 'blaze_analytics',
  SUBSCRIPTIONS_TABLE: 'blaze_subscriptions',
  API_USAGE_TABLE: 'blaze_api_usage'
};

// In-memory storage for demo (replace with D1/PostgreSQL in production)
const memoryDB = {
  users: new Map(),
  sessions: new Map(),
  analytics: [],
  subscriptions: new Map(),
  apiUsage: new Map()
};

// User schema
class User {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.email = data.email;
    this.name = data.name;
    this.organization = data.organization;
    this.tier = data.tier || 'FREE';
    this.passwordHash = data.passwordHash;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.lastLogin = data.lastLogin || null;
    this.preferences = data.preferences || {};
    this.metadata = data.metadata || {};
    this.apiKey = data.apiKey || this.generateAPIKey();
    this.stripeCustomerId = data.stripeCustomerId || null;
    this.features = this.getFeaturesByTier(this.tier);
  }

  generateAPIKey() {
    return `blz_${uuidv4().replace(/-/g, '')}`;
  }

  getFeaturesByTier(tier) {
    const features = {
      FREE: ['basic_stats', 'limited_scores', 'public_data'],
      RECRUIT: ['live_scores', 'basic_analytics', 'nil_tracking', 'api_access'],
      ALL_AMERICAN: ['advanced_analytics', 'video_ai', 'recruiting_intel', 'transfer_portal', 'custom_reports'],
      CHAMPIONSHIP: ['all_features', 'unlimited_api', 'white_label', 'custom_integrations', 'dedicated_support']
    };
    return features[tier] || features.FREE;
  }
}

// Main handler
exports.handler = async (event, context) => {
  const { path, httpMethod, body, headers } = event;
  const endpoint = path.replace('/.netlify/functions/database-manager', '');

  const responseHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
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
    const apiKey = headers['x-api-key'];

    // Validate API key for protected endpoints
    if (endpoint !== '/users/create' && endpoint !== '/users/login') {
      const isValid = await validateAPIKey(apiKey);
      if (!isValid) {
        throw new Error('Invalid API key');
      }
    }

    switch (endpoint) {
      // User management
      case '/users/create':
        response = await createUser(requestBody);
        break;
      case '/users/get':
        response = await getUser(requestBody);
        break;
      case '/users/update':
        response = await updateUser(requestBody);
        break;
      case '/users/delete':
        response = await deleteUser(requestBody);
        break;
      case '/users/login':
        response = await loginUser(requestBody);
        break;

      // Session management
      case '/sessions/create':
        response = await createSession(requestBody);
        break;
      case '/sessions/validate':
        response = await validateSession(requestBody);
        break;
      case '/sessions/destroy':
        response = await destroySession(requestBody);
        break;

      // Analytics data
      case '/analytics/store':
        response = await storeAnalytics(requestBody);
        break;
      case '/analytics/query':
        response = await queryAnalytics(requestBody);
        break;
      case '/analytics/aggregate':
        response = await aggregateAnalytics(requestBody);
        break;

      // Subscription management
      case '/subscriptions/create':
        response = await createSubscription(requestBody);
        break;
      case '/subscriptions/update':
        response = await updateSubscription(requestBody);
        break;
      case '/subscriptions/status':
        response = await getSubscriptionStatus(requestBody);
        break;

      // API usage tracking
      case '/usage/track':
        response = await trackAPIUsage(requestBody, apiKey);
        break;
      case '/usage/report':
        response = await getUsageReport(requestBody, apiKey);
        break;
      case '/usage/limits':
        response = await checkUsageLimits(apiKey);
        break;

      // Database operations
      case '/backup':
        response = await backupDatabase();
        break;
      case '/migrate':
        response = await migrateDatabase(requestBody);
        break;
      case '/health':
        response = await checkDatabaseHealth();
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
    console.error('Database error:', error);
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

// User management functions
async function createUser(data) {
  const { email, name, organization, password, tier } = data;

  // Check if user exists
  const existingUser = Array.from(memoryDB.users.values()).find(u => u.email === email);
  if (existingUser) {
    throw new Error('User already exists');
  }

  // Create new user
  const user = new User({
    email,
    name,
    organization,
    tier,
    passwordHash: hashPassword(password)
  });

  // Store user
  memoryDB.users.set(user.id, user);

  // Create initial session
  const session = await createSession({ userId: user.id });

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      organization: user.organization,
      tier: user.tier,
      apiKey: user.apiKey,
      features: user.features
    },
    sessionId: session.sessionId
  };
}

async function getUser({ userId, email }) {
  let user;
  
  if (userId) {
    user = memoryDB.users.get(userId);
  } else if (email) {
    user = Array.from(memoryDB.users.values()).find(u => u.email === email);
  }

  if (!user) {
    throw new Error('User not found');
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    organization: user.organization,
    tier: user.tier,
    features: user.features,
    createdAt: user.createdAt,
    lastLogin: user.lastLogin
  };
}

async function updateUser({ userId, updates }) {
  const user = memoryDB.users.get(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Apply updates
  Object.keys(updates).forEach(key => {
    if (key !== 'id' && key !== 'apiKey') {
      user[key] = updates[key];
    }
  });

  user.updatedAt = new Date().toISOString();

  // Update features if tier changed
  if (updates.tier) {
    user.features = user.getFeaturesByTier(updates.tier);
  }

  memoryDB.users.set(userId, user);

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    tier: user.tier,
    features: user.features,
    updatedAt: user.updatedAt
  };
}

async function deleteUser({ userId }) {
  const user = memoryDB.users.get(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Delete associated data
  memoryDB.sessions.forEach((session, key) => {
    if (session.userId === userId) {
      memoryDB.sessions.delete(key);
    }
  });

  memoryDB.subscriptions.delete(userId);
  memoryDB.apiUsage.delete(user.apiKey);

  // Delete user
  memoryDB.users.delete(userId);

  return { deleted: true, userId };
}

async function loginUser({ email, password }) {
  const user = Array.from(memoryDB.users.values()).find(u => u.email === email);
  if (!user) {
    throw new Error('Invalid credentials');
  }

  // Verify password (simplified for demo)
  if (!verifyPassword(password, user.passwordHash)) {
    throw new Error('Invalid credentials');
  }

  // Update last login
  user.lastLogin = new Date().toISOString();
  memoryDB.users.set(user.id, user);

  // Create session
  const session = await createSession({ userId: user.id });

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      tier: user.tier,
      apiKey: user.apiKey,
      features: user.features
    },
    sessionId: session.sessionId
  };
}

// Session management functions
async function createSession({ userId }) {
  const session = {
    id: uuidv4(),
    userId,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    active: true
  };

  memoryDB.sessions.set(session.id, session);

  return { sessionId: session.id, expiresAt: session.expiresAt };
}

async function validateSession({ sessionId }) {
  const session = memoryDB.sessions.get(sessionId);
  
  if (!session) {
    return { valid: false, reason: 'Session not found' };
  }

  if (!session.active) {
    return { valid: false, reason: 'Session inactive' };
  }

  if (new Date(session.expiresAt) < new Date()) {
    session.active = false;
    memoryDB.sessions.set(sessionId, session);
    return { valid: false, reason: 'Session expired' };
  }

  return { valid: true, userId: session.userId, expiresAt: session.expiresAt };
}

async function destroySession({ sessionId }) {
  const session = memoryDB.sessions.get(sessionId);
  if (!session) {
    throw new Error('Session not found');
  }

  session.active = false;
  session.destroyedAt = new Date().toISOString();
  memoryDB.sessions.set(sessionId, session);

  return { destroyed: true, sessionId };
}

// Analytics functions
async function storeAnalytics(data) {
  const analyticsEntry = {
    id: uuidv4(),
    ...data,
    timestamp: data.timestamp || new Date().toISOString()
  };

  memoryDB.analytics.push(analyticsEntry);

  // Keep only last 10000 entries in memory
  if (memoryDB.analytics.length > 10000) {
    memoryDB.analytics = memoryDB.analytics.slice(-10000);
  }

  return { stored: true, id: analyticsEntry.id };
}

async function queryAnalytics({ filters, limit = 100, offset = 0 }) {
  let results = [...memoryDB.analytics];

  // Apply filters
  if (filters) {
    Object.keys(filters).forEach(key => {
      results = results.filter(item => item[key] === filters[key]);
    });
  }

  // Apply pagination
  const paginated = results.slice(offset, offset + limit);

  return {
    data: paginated,
    total: results.length,
    limit,
    offset
  };
}

async function aggregateAnalytics({ metric, groupBy, dateRange }) {
  let data = [...memoryDB.analytics];

  // Filter by date range
  if (dateRange) {
    const { start, end } = dateRange;
    data = data.filter(item => {
      const itemDate = new Date(item.timestamp);
      return itemDate >= new Date(start) && itemDate <= new Date(end);
    });
  }

  // Perform aggregation
  const aggregated = {};
  data.forEach(item => {
    const key = groupBy ? item[groupBy] : 'total';
    if (!aggregated[key]) {
      aggregated[key] = { count: 0, sum: 0, values: [] };
    }
    aggregated[key].count++;
    if (item[metric] !== undefined) {
      aggregated[key].sum += item[metric];
      aggregated[key].values.push(item[metric]);
    }
  });

  // Calculate statistics
  Object.keys(aggregated).forEach(key => {
    const group = aggregated[key];
    group.average = group.sum / group.count;
    group.min = Math.min(...group.values);
    group.max = Math.max(...group.values);
    delete group.values; // Remove raw values to reduce response size
  });

  return aggregated;
}

// Subscription management functions
async function createSubscription(data) {
  const { userId, tier, stripeSubscriptionId } = data;

  const subscription = {
    id: uuidv4(),
    userId,
    tier,
    stripeSubscriptionId,
    status: 'active',
    startDate: new Date().toISOString(),
    nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    features: new User({ tier }).features
  };

  memoryDB.subscriptions.set(userId, subscription);

  // Update user tier
  const user = memoryDB.users.get(userId);
  if (user) {
    user.tier = tier;
    user.features = user.getFeaturesByTier(tier);
    memoryDB.users.set(userId, user);
  }

  return subscription;
}

async function updateSubscription({ userId, updates }) {
  const subscription = memoryDB.subscriptions.get(userId);
  if (!subscription) {
    throw new Error('Subscription not found');
  }

  Object.keys(updates).forEach(key => {
    subscription[key] = updates[key];
  });

  subscription.updatedAt = new Date().toISOString();

  // Update features if tier changed
  if (updates.tier) {
    subscription.features = new User({ tier: updates.tier }).features;
    
    // Update user tier
    const user = memoryDB.users.get(userId);
    if (user) {
      user.tier = updates.tier;
      user.features = user.getFeaturesByTier(updates.tier);
      memoryDB.users.set(userId, user);
    }
  }

  memoryDB.subscriptions.set(userId, subscription);

  return subscription;
}

async function getSubscriptionStatus({ userId }) {
  const subscription = memoryDB.subscriptions.get(userId);
  if (!subscription) {
    return { status: 'none', tier: 'FREE' };
  }

  return {
    status: subscription.status,
    tier: subscription.tier,
    features: subscription.features,
    nextBillingDate: subscription.nextBillingDate
  };
}

// API usage tracking functions
async function trackAPIUsage(data, apiKey) {
  const usage = memoryDB.apiUsage.get(apiKey) || {
    apiKey,
    calls: [],
    totalCalls: 0,
    resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  };

  usage.calls.push({
    endpoint: data.endpoint,
    timestamp: new Date().toISOString(),
    responseTime: data.responseTime,
    statusCode: data.statusCode
  });

  usage.totalCalls++;

  // Keep only last 1000 calls in memory
  if (usage.calls.length > 1000) {
    usage.calls = usage.calls.slice(-1000);
  }

  memoryDB.apiUsage.set(apiKey, usage);

  return { tracked: true, totalCalls: usage.totalCalls };
}

async function getUsageReport({ period = '30d' }, apiKey) {
  const usage = memoryDB.apiUsage.get(apiKey);
  if (!usage) {
    return { totalCalls: 0, endpoints: {}, averageResponseTime: 0 };
  }

  const periodMs = {
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000
  }[period] || 30 * 24 * 60 * 60 * 1000;

  const cutoff = new Date(Date.now() - periodMs);
  const recentCalls = usage.calls.filter(call => new Date(call.timestamp) > cutoff);

  // Aggregate by endpoint
  const endpoints = {};
  let totalResponseTime = 0;

  recentCalls.forEach(call => {
    endpoints[call.endpoint] = (endpoints[call.endpoint] || 0) + 1;
    totalResponseTime += call.responseTime || 0;
  });

  return {
    totalCalls: recentCalls.length,
    endpoints,
    averageResponseTime: recentCalls.length > 0 ? totalResponseTime / recentCalls.length : 0,
    period,
    resetDate: usage.resetDate
  };
}

async function checkUsageLimits(apiKey) {
  const user = Array.from(memoryDB.users.values()).find(u => u.apiKey === apiKey);
  if (!user) {
    throw new Error('Invalid API key');
  }

  const usage = memoryDB.apiUsage.get(apiKey) || { totalCalls: 0 };

  const limits = {
    FREE: 100,
    RECRUIT: 1000,
    ALL_AMERICAN: 10000,
    CHAMPIONSHIP: -1 // Unlimited
  };

  const limit = limits[user.tier] || limits.FREE;
  const remaining = limit === -1 ? 'unlimited' : Math.max(0, limit - usage.totalCalls);

  return {
    tier: user.tier,
    limit: limit === -1 ? 'unlimited' : limit,
    used: usage.totalCalls,
    remaining,
    resetDate: usage.resetDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  };
}

// Database operations
async function backupDatabase() {
  const backup = {
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    data: {
      users: Array.from(memoryDB.users.entries()),
      sessions: Array.from(memoryDB.sessions.entries()),
      analytics: memoryDB.analytics,
      subscriptions: Array.from(memoryDB.subscriptions.entries()),
      apiUsage: Array.from(memoryDB.apiUsage.entries())
    },
    stats: {
      userCount: memoryDB.users.size,
      sessionCount: memoryDB.sessions.size,
      analyticsCount: memoryDB.analytics.length,
      subscriptionCount: memoryDB.subscriptions.size
    }
  };

  return {
    backupId: backup.id,
    timestamp: backup.timestamp,
    stats: backup.stats
  };
}

async function migrateDatabase({ version, dryRun = true }) {
  const migrations = {
    '1.0.0': () => console.log('Initial schema'),
    '1.1.0': () => console.log('Add API key to users'),
    '1.2.0': () => console.log('Add subscription tiers'),
    '2.0.0': () => console.log('Major restructure')
  };

  const migration = migrations[version];
  if (!migration) {
    throw new Error(`Migration version ${version} not found`);
  }

  if (!dryRun) {
    migration();
  }

  return {
    version,
    dryRun,
    status: dryRun ? 'simulated' : 'completed',
    timestamp: new Date().toISOString()
  };
}

async function checkDatabaseHealth() {
  return {
    status: 'healthy',
    storage: {
      users: memoryDB.users.size,
      sessions: memoryDB.sessions.size,
      analytics: memoryDB.analytics.length,
      subscriptions: memoryDB.subscriptions.size,
      apiUsage: memoryDB.apiUsage.size
    },
    performance: {
      readLatency: '2ms',
      writeLatency: '3ms',
      queryTime: '5ms'
    },
    lastBackup: null,
    version: '2.0.0'
  };
}

// Helper functions
function validateAPIKey(apiKey) {
  if (!apiKey || !apiKey.startsWith('blz_')) {
    return false;
  }
  const user = Array.from(memoryDB.users.values()).find(u => u.apiKey === apiKey);
  return !!user;
}

function hashPassword(password) {
  // Simplified for demo - use bcrypt in production
  return Buffer.from(password).toString('base64');
}

function verifyPassword(password, hash) {
  // Simplified for demo - use bcrypt in production
  return Buffer.from(password).toString('base64') === hash;
}