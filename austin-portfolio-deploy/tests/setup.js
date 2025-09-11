/**
 * Jest Test Setup Configuration
 * Global test environment setup for Blaze Intelligence
 */

// Mock DOM environment for Node.js tests
const { JSDOM } = require('jsdom');

// Mock global browser APIs
global.performance = {
  now: jest.fn(() => Date.now()),
  timing: {
    navigationStart: Date.now() - 1000,
    loadEventEnd: Date.now()
  }
};

global.localStorage = {
  data: {},
  getItem: jest.fn((key) => global.localStorage.data[key] || null),
  setItem: jest.fn((key, value) => {
    global.localStorage.data[key] = value;
  }),
  removeItem: jest.fn((key) => {
    delete global.localStorage.data[key];
  }),
  clear: jest.fn(() => {
    global.localStorage.data = {};
  })
};

// Mock fetch for API calls
global.fetch = jest.fn();

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Comment out the next line if you want to see console logs during tests
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

// Mock browser APIs
global.navigator = {
  userAgent: 'Jest Test Environment',
  sendBeacon: jest.fn()
};

global.document = {
  title: 'Blaze Intelligence',
  referrer: '',
  hidden: false,
  visibilityState: 'visible',
  addEventListener: jest.fn(),
  createElement: jest.fn(() => ({
    setAttribute: jest.fn(),
    getAttribute: jest.fn(),
    addEventListener: jest.fn()
  }))
};

global.window = {
  location: {
    href: 'https://blaze-intelligence.netlify.app',
    pathname: '/',
    search: '',
    hash: ''
  },
  innerWidth: 1920,
  innerHeight: 1080,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn()
};

// Mock Three.js for UI tests
jest.mock('three', () => ({
  WebGLRenderer: jest.fn(() => ({
    setSize: jest.fn(),
    render: jest.fn(),
    dispose: jest.fn()
  })),
  Scene: jest.fn(),
  PerspectiveCamera: jest.fn(),
  BoxGeometry: jest.fn(),
  MeshBasicMaterial: jest.fn(),
  Mesh: jest.fn()
}));

// Test utilities
global.testUtils = {
  createMockCardinalsData: () => ({
    readiness: 86.65,
    trend: 'positive',
    performance: {
      overall: 87.3,
      batting: { average: 0.284, homeRuns: 12 },
      pitching: { era: 3.45, strikeouts: 145 },
      fielding: { errors: 8, percentage: 0.987 }
    },
    lastUpdate: new Date().toISOString()
  }),
  
  createMockNILData: () => ({
    sport: 'baseball',
    position: 'pitcher',
    stats: { era: 2.45, strikeouts: 95, wins: 8 },
    socialMedia: { followers: 5000, engagementRate: 0.035 },
    marketValue: { local: true, regional: false, national: false }
  }),
  
  waitFor: (ms) => new Promise(resolve => setTimeout(resolve, ms))
};

// Jest configuration
jest.setTimeout(10000); // 10 second timeout for tests

beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
  
  // Reset localStorage
  global.localStorage.clear();
  
  // Reset fetch mock
  global.fetch.mockClear();
});

afterEach(() => {
  // Clean up after each test
  jest.restoreAllMocks();
});