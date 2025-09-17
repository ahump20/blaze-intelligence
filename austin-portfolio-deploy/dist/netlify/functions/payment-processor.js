// Blaze Intelligence Payment Processing System
// Championship-Level Subscription Management with Stripe

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_demo');

// Subscription products configuration
const PRODUCTS = {
  SCOUT: {
    productId: process.env.STRIPE_SCOUT_PRODUCT || 'prod_scout',
    priceId: process.env.STRIPE_SCOUT_PRICE || 'price_scout',
    name: 'Scout Plan',
    price: 0,
    interval: 'month',
    features: [
      'Basic stats access',
      'Limited live scores',
      'Public data only',
      '100 API calls/month'
    ]
  },
  RECRUIT: {
    productId: process.env.STRIPE_RECRUIT_PRODUCT || 'prod_recruit',
    priceId: process.env.STRIPE_RECRUIT_PRICE || 'price_recruit',
    name: 'Recruit Plan',
    price: 29,
    interval: 'month',
    features: [
      'Live scores & updates',
      'Basic analytics',
      'NIL tracking',
      '1,000 API calls/month',
      'Email support'
    ]
  },
  ALL_AMERICAN: {
    productId: process.env.STRIPE_ALLAMERICAN_PRODUCT || 'prod_allamerican',
    priceId: process.env.STRIPE_ALLAMERICAN_PRICE || 'price_allamerican',
    name: 'All-American Plan',
    price: 99,
    interval: 'month',
    features: [
      'Advanced analytics',
      'Video AI analysis',
      'Recruiting intelligence',
      'Transfer portal data',
      '10,000 API calls/month',
      'Priority support',
      'Custom reports'
    ]
  },
  CHAMPIONSHIP: {
    productId: process.env.STRIPE_CHAMPIONSHIP_PRODUCT || 'prod_championship',
    priceId: process.env.STRIPE_CHAMPIONSHIP_PRICE || 'price_championship',
    name: 'Championship Plan',
    price: 499,
    interval: 'month',
    features: [
      'All features included',
      'Unlimited API access',
      'White-label options',
      'Custom integrations',
      'Dedicated support',
      'SLA guarantee',
      'Early access to features',
      'Team collaboration tools'
    ]
  },
  ANNUAL_SPECIAL: {
    productId: process.env.STRIPE_ANNUAL_PRODUCT || 'prod_annual',
    priceId: process.env.STRIPE_ANNUAL_PRICE || 'price_annual',
    name: 'Annual Championship',
    price: 1188,
    interval: 'year',
    features: [
      'All Championship features',
      '67-80% savings vs competitors',
      'Annual price lock',
      'Bonus data packages',
      'Executive briefings'
    ]
  }
};

// Main handler
exports.handler = async (event, context) => {
  const { path, httpMethod, body, headers } = event;
  const endpoint = path.replace('/.netlify/functions/payment-processor', '');

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
      case '/create-checkout':
        response = await handleCreateCheckout(requestBody);
        break;

      case '/create-subscription':
        response = await handleCreateSubscription(requestBody);
        break;

      case '/products':
        response = await handleGetProducts();
        break;

      case '/webhook':
        response = await handleWebhook(event);
        break;

      case '/health':
        response = { status: 'healthy', timestamp: new Date().toISOString() };
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
    console.error('Payment processor error:', error);
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

// Handle checkout session creation
async function handleCreateCheckout({ tier, email, successUrl, cancelUrl }) {
  const product = PRODUCTS[tier];
  if (!product) {
    throw new Error('Invalid subscription tier');
  }

  // Mock checkout for demo purposes
  const mockSession = {
    id: `cs_demo_${Date.now()}`,
    url: `https://checkout.stripe.com/demo/${tier}`,
    tier,
    product: product.name,
    price: product.price
  };

  return {
    sessionId: mockSession.id,
    url: mockSession.url,
    tier,
    price: product.price
  };
}

// Handle direct subscription creation
async function handleCreateSubscription({ email, name, tier }) {
  const product = PRODUCTS[tier];
  if (!product) {
    throw new Error('Invalid subscription tier');
  }

  // Mock subscription for demo
  const mockSubscription = {
    id: `sub_demo_${Date.now()}`,
    customer: `cus_demo_${Date.now()}`,
    status: 'active',
    tier,
    features: product.features,
    price: product.price
  };

  return {
    subscriptionId: mockSubscription.id,
    customerId: mockSubscription.customer,
    status: mockSubscription.status,
    tier,
    features: product.features,
    price: product.price
  };
}

// Handle get products
async function handleGetProducts() {
  return Object.entries(PRODUCTS).map(([key, product]) => ({
    tier: key,
    ...product
  }));
}

// Handle Stripe webhooks
async function handleWebhook(event) {
  // Mock webhook handling
  console.log('Webhook received:', event.headers);

  return {
    received: true,
    processed: true,
    timestamp: new Date().toISOString()
  };
}