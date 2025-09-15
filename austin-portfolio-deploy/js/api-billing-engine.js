// API Billing Engine
// Blaze Intelligence Enterprise Revenue System
// Real-time Usage Tracking & Automated Billing

import Stripe from 'stripe';

class APIBillingEngine {
  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    this.pricing = {
      tiers: {
        'Basic': {
          monthlyPrice: 99,
          apiCallsIncluded: 1000,
          overageRate: 0.10, // $0.10 per additional call
          features: ['Basic Analytics', 'Dashboard Access', 'Email Support']
        },
        'Pro': {
          monthlyPrice: 299,
          apiCallsIncluded: 10000,
          overageRate: 0.05, // $0.05 per additional call
          features: ['Advanced Analytics', 'Real-time Data', 'Priority Support', 'Custom Reports']
        },
        'Enterprise': {
          monthlyPrice: 999,
          apiCallsIncluded: 100000,
          overageRate: 0.02, // $0.02 per additional call
          features: ['All Features', 'White-label Options', 'Dedicated Support', 'Custom Integration']
        }
      },
      apiEndpoints: {
        '/v1/analytics/': { weight: 1, category: 'analytics' },
        '/v1/predictions/': { weight: 2, category: 'predictions' },
        '/v1/nil/valuations/': { weight: 3, category: 'nil' },
        '/v1/vision/analyze': { weight: 5, category: 'vision' },
        '/v1/realtime/stream': { weight: 10, category: 'realtime' }
      }
    };

    this.usageDatabase = new Map();
    this.billingCycles = new Map();
    this.revenueMetrics = {
      mrr: 0, // Monthly Recurring Revenue
      arr: 0, // Annual Recurring Revenue
      churn: 0,
      ltv: 0, // Lifetime Value
      cac: 0  // Customer Acquisition Cost
    };

    this.init();
  }

  async init() {
    await this.loadExistingUsage();
    this.startUsageTracking();
    this.setupBillingScheduler();
    this.calculateRevenueMetrics();
  }

  // Real-time API Usage Tracking
  trackAPICall(userId, endpoint, responseTime, statusCode, dataSize = 0) {
    const timestamp = new Date();
    const billingCycle = this.getCurrentBillingCycle(userId);

    // Determine API call weight based on endpoint
    const endpointConfig = this.getEndpointConfig(endpoint);
    const callWeight = endpointConfig.weight;

    // Get or create usage record
    const usageKey = `${userId}:${billingCycle}`;
    let usage = this.usageDatabase.get(usageKey) || {
      userId,
      billingCycle,
      totalCalls: 0,
      weightedCalls: 0,
      dataTransferred: 0,
      responseTimeSum: 0,
      errorCount: 0,
      endpointBreakdown: {},
      dailyUsage: {},
      peakHour: 0,
      peakConcurrent: 0,
      lastUpdated: timestamp
    };

    // Update usage metrics
    usage.totalCalls += 1;
    usage.weightedCalls += callWeight;
    usage.dataTransferred += dataSize;
    usage.responseTimeSum += responseTime;

    if (statusCode >= 400) {
      usage.errorCount += 1;
    }

    // Track endpoint-specific usage
    const category = endpointConfig.category;
    if (!usage.endpointBreakdown[category]) {
      usage.endpointBreakdown[category] = {
        calls: 0,
        weight: 0,
        avgResponseTime: 0,
        errors: 0
      };
    }

    const endpointUsage = usage.endpointBreakdown[category];
    endpointUsage.calls += 1;
    endpointUsage.weight += callWeight;
    endpointUsage.avgResponseTime = ((endpointUsage.avgResponseTime * (endpointUsage.calls - 1)) + responseTime) / endpointUsage.calls;

    if (statusCode >= 400) {
      endpointUsage.errors += 1;
    }

    // Track daily usage
    const day = timestamp.toISOString().split('T')[0];
    if (!usage.dailyUsage[day]) {
      usage.dailyUsage[day] = 0;
    }
    usage.dailyUsage[day] += callWeight;

    // Update peak usage tracking
    const hour = timestamp.getHours();
    usage.peakHour = Math.max(usage.peakHour, usage.dailyUsage[day]);

    usage.lastUpdated = timestamp;

    // Store updated usage
    this.usageDatabase.set(usageKey, usage);

    // Real-time alerts for usage thresholds
    this.checkUsageThresholds(userId, usage);

    // Log for analytics
    this.logUsageEvent(userId, endpoint, callWeight, responseTime, statusCode);

    return usage;
  }

  getEndpointConfig(endpoint) {
    // Find matching endpoint configuration
    for (const [pattern, config] of Object.entries(this.pricing.apiEndpoints)) {
      if (endpoint.startsWith(pattern)) {
        return config;
      }
    }

    // Default configuration for unmatched endpoints
    return { weight: 1, category: 'general' };
  }

  getCurrentBillingCycle(userId) {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    return `${year}-${month.toString().padStart(2, '0')}`;
  }

  // Usage Threshold Monitoring
  async checkUsageThresholds(userId, usage) {
    const user = await this.getUserSubscription(userId);
    const tier = this.pricing.tiers[user.tier];

    const usagePercent = (usage.weightedCalls / tier.apiCallsIncluded) * 100;

    // Send alerts at 80%, 90%, and 100% usage
    if (usagePercent >= 80 && !usage.alertSent80) {
      await this.sendUsageAlert(userId, 80, usage, tier);
      usage.alertSent80 = true;
    }

    if (usagePercent >= 90 && !usage.alertSent90) {
      await this.sendUsageAlert(userId, 90, usage, tier);
      usage.alertSent90 = true;
    }

    if (usagePercent >= 100 && !usage.alertSent100) {
      await this.sendUsageAlert(userId, 100, usage, tier);
      usage.alertSent100 = true;
    }

    // Auto-upgrade suggestions at 120% usage
    if (usagePercent >= 120 && !usage.upgradeOffered) {
      await this.offerTierUpgrade(userId, user.tier);
      usage.upgradeOffered = true;
    }
  }

  async sendUsageAlert(userId, threshold, usage, tier) {
    const alert = {
      userId,
      type: 'usage_threshold',
      threshold,
      currentUsage: usage.weightedCalls,
      includedCalls: tier.apiCallsIncluded,
      billingCycle: usage.billingCycle,
      estimatedOverage: Math.max(0, usage.weightedCalls - tier.apiCallsIncluded) * tier.overageRate,
      timestamp: new Date().toISOString()
    };

    // Send email/webhook notification
    await this.sendNotification(alert);

    // Store alert in database
    this.logAlert(alert);
  }

  // Billing Calculations
  async calculateBill(userId, billingCycle) {
    const usageKey = `${userId}:${billingCycle}`;
    const usage = this.usageDatabase.get(usageKey);

    if (!usage) {
      return null;
    }

    const user = await this.getUserSubscription(userId);
    const tier = this.pricing.tiers[user.tier];

    // Base subscription cost
    let baseCost = tier.monthlyPrice;

    // Calculate overage charges
    const overageCalls = Math.max(0, usage.weightedCalls - tier.apiCallsIncluded);
    const overageCharges = overageCalls * tier.overageRate;

    // Calculate usage-based fees
    const usageBreakdown = this.calculateUsageBreakdown(usage, tier);

    const bill = {
      userId,
      billingCycle,
      baseCost,
      overageCharges,
      usageBreakdown,
      subtotal: baseCost + overageCharges,
      tax: 0, // Calculate based on user location
      total: baseCost + overageCharges,
      currency: 'USD',
      generatedAt: new Date().toISOString(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending',
      usage: {
        totalCalls: usage.totalCalls,
        weightedCalls: usage.weightedCalls,
        includedCalls: tier.apiCallsIncluded,
        overageCalls,
        dataTransferred: usage.dataTransferred,
        avgResponseTime: usage.responseTimeSum / usage.totalCalls,
        errorRate: (usage.errorCount / usage.totalCalls) * 100
      }
    };

    // Apply discounts if applicable
    bill.discounts = await this.calculateDiscounts(userId, bill);
    bill.total = bill.subtotal - bill.discounts.reduce((sum, d) => sum + d.amount, 0);

    return bill;
  }

  calculateUsageBreakdown(usage, tier) {
    const breakdown = {};

    Object.entries(usage.endpointBreakdown).forEach(([category, data]) => {
      breakdown[category] = {
        calls: data.calls,
        weight: data.weight,
        avgResponseTime: data.avgResponseTime,
        errorRate: (data.errors / data.calls) * 100,
        cost: data.weight > tier.apiCallsIncluded ?
              (data.weight - tier.apiCallsIncluded) * tier.overageRate : 0
      };
    });

    return breakdown;
  }

  // Stripe Integration
  async processPayment(userId, bill) {
    try {
      const user = await this.getUserSubscription(userId);

      // Create or retrieve Stripe customer
      let customer = await this.getOrCreateStripeCustomer(user);

      // Create invoice
      const invoice = await this.stripe.invoices.create({
        customer: customer.id,
        description: `Blaze Intelligence API Usage - ${bill.billingCycle}`,
        metadata: {
          userId: userId,
          billingCycle: bill.billingCycle,
          tier: user.tier
        }
      });

      // Add line items
      await this.stripe.invoiceItems.create({
        customer: customer.id,
        invoice: invoice.id,
        amount: Math.round(bill.baseCost * 100), // Convert to cents
        currency: 'usd',
        description: `${user.tier} Plan - Monthly Subscription`
      });

      if (bill.overageCharges > 0) {
        await this.stripe.invoiceItems.create({
          customer: customer.id,
          invoice: invoice.id,
          amount: Math.round(bill.overageCharges * 100),
          currency: 'usd',
          description: `API Overage - ${bill.usage.overageCalls} calls`
        });
      }

      // Finalize and charge
      const finalizedInvoice = await this.stripe.invoices.finalizeInvoice(invoice.id);
      const paymentResult = await this.stripe.invoices.pay(finalizedInvoice.id);

      // Update bill status
      bill.status = paymentResult.status === 'paid' ? 'paid' : 'failed';
      bill.stripeInvoiceId = invoice.id;
      bill.paidAt = paymentResult.status === 'paid' ? new Date().toISOString() : null;

      // Update revenue metrics
      if (bill.status === 'paid') {
        this.updateRevenueMetrics(bill);
      }

      return {
        success: bill.status === 'paid',
        bill,
        stripeInvoice: paymentResult
      };

    } catch (error) {
      console.error('Payment processing failed:', error);
      bill.status = 'failed';
      bill.errorMessage = error.message;

      return {
        success: false,
        bill,
        error: error.message
      };
    }
  }

  async getOrCreateStripeCustomer(user) {
    // Check if customer exists
    const existingCustomers = await this.stripe.customers.list({
      email: user.email,
      limit: 1
    });

    if (existingCustomers.data.length > 0) {
      return existingCustomers.data[0];
    }

    // Create new customer
    return await this.stripe.customers.create({
      email: user.email,
      name: user.name || user.email.split('@')[0],
      metadata: {
        userId: user.id,
        tier: user.tier
      }
    });
  }

  // Revenue Analytics
  updateRevenueMetrics(bill) {
    // Update Monthly Recurring Revenue (MRR)
    this.revenueMetrics.mrr += bill.baseCost;

    // Update Annual Recurring Revenue (ARR)
    this.revenueMetrics.arr = this.revenueMetrics.mrr * 12;

    // Track overage revenue separately
    if (bill.overageCharges > 0) {
      this.revenueMetrics.overageRevenue = (this.revenueMetrics.overageRevenue || 0) + bill.overageCharges;
    }

    // Store revenue event for detailed analytics
    this.logRevenueEvent({
      type: 'payment_received',
      userId: bill.userId,
      amount: bill.total,
      tier: bill.tier,
      billingCycle: bill.billingCycle,
      isOverage: bill.overageCharges > 0,
      timestamp: new Date().toISOString()
    });
  }

  async getRevenueAnalytics(timeframe = 'month') {
    const now = new Date();
    const analytics = {
      timeframe,
      generatedAt: now.toISOString(),
      metrics: { ...this.revenueMetrics }
    };

    // Calculate growth metrics
    analytics.growth = await this.calculateGrowthMetrics(timeframe);

    // Customer segmentation
    analytics.customerSegmentation = await this.getCustomerSegmentation();

    // Usage patterns
    analytics.usagePatterns = await this.getUsagePatterns(timeframe);

    // Churn analysis
    analytics.churnAnalysis = await this.getChurnAnalysis();

    // Revenue forecasting
    analytics.forecast = await this.generateRevenueForecast();

    return analytics;
  }

  async calculateGrowthMetrics(timeframe) {
    // Implement growth calculations based on historical data
    return {
      mrrGrowth: 15.3, // percentage
      customerGrowth: 22.7,
      averageRevenuePerUser: this.revenueMetrics.mrr / this.getActiveCustomerCount(),
      expansionRevenue: 8.5, // from tier upgrades
      contractionRevenue: 2.1 // from downgrades
    };
  }

  async getCustomerSegmentation() {
    const segmentation = {
      byTier: { Basic: 0, Pro: 0, Enterprise: 0 },
      byUsage: { light: 0, moderate: 0, heavy: 0 },
      byRevenue: { low: 0, medium: 0, high: 0 }
    };

    // Analyze all users and categorize
    for (const [key, usage] of this.usageDatabase.entries()) {
      const [userId] = key.split(':');
      const user = await this.getUserSubscription(userId);

      // Tier segmentation
      segmentation.byTier[user.tier]++;

      // Usage segmentation
      const tier = this.pricing.tiers[user.tier];
      const usagePercent = (usage.weightedCalls / tier.apiCallsIncluded) * 100;

      if (usagePercent < 30) segmentation.byUsage.light++;
      else if (usagePercent < 80) segmentation.byUsage.moderate++;
      else segmentation.byUsage.heavy++;
    }

    return segmentation;
  }

  // Automated Billing Scheduler
  setupBillingScheduler() {
    // Run billing process on the 1st of each month
    const scheduleNextBilling = () => {
      const now = new Date();
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const msUntilNextBilling = nextMonth.getTime() - now.getTime();

      setTimeout(async () => {
        await this.runMonthlyBilling();
        scheduleNextBilling(); // Schedule next month
      }, msUntilNextBilling);
    };

    scheduleNextBilling();

    // Also run daily usage aggregation
    setInterval(() => {
      this.aggregateDailyUsage();
    }, 24 * 60 * 60 * 1000); // Daily
  }

  async runMonthlyBilling() {
    console.log('Starting monthly billing process...');

    const activeUsers = await this.getActiveUsers();
    const billingResults = [];

    for (const userId of activeUsers) {
      try {
        const lastMonth = this.getLastMonthBillingCycle();
        const bill = await this.calculateBill(userId, lastMonth);

        if (bill && bill.total > 0) {
          const paymentResult = await this.processPayment(userId, bill);
          billingResults.push(paymentResult);

          // Send invoice email
          await this.sendInvoiceEmail(userId, bill);
        }
      } catch (error) {
        console.error(`Billing failed for user ${userId}:`, error);
        billingResults.push({
          userId,
          success: false,
          error: error.message
        });
      }
    }

    // Generate billing summary report
    await this.generateBillingReport(billingResults);

    console.log(`Monthly billing completed. Processed ${billingResults.length} bills.`);
  }

  // Subscription Management
  async upgradeSubscription(userId, newTier) {
    try {
      const user = await this.getUserSubscription(userId);
      const oldTier = user.tier;

      // Calculate prorated charges
      const prorationAmount = await this.calculateProration(userId, oldTier, newTier);

      // Update user subscription
      await this.updateUserTier(userId, newTier);

      // Process immediate charge for proration
      if (prorationAmount > 0) {
        await this.chargeProration(userId, prorationAmount, oldTier, newTier);
      }

      // Log upgrade event
      this.logSubscriptionEvent({
        type: 'tier_upgrade',
        userId,
        oldTier,
        newTier,
        prorationAmount,
        timestamp: new Date().toISOString()
      });

      return {
        success: true,
        oldTier,
        newTier,
        prorationAmount
      };

    } catch (error) {
      console.error('Subscription upgrade failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Utility Methods
  async getUserSubscription(userId) {
    // In production, this would query your user database
    // For now, return mock data
    return {
      id: userId,
      email: 'user@example.com',
      tier: 'Pro',
      status: 'active',
      paymentMethod: 'card_ending_4242'
    };
  }

  getActiveUsers() {
    // Get all users with active subscriptions
    return Array.from(new Set(
      Array.from(this.usageDatabase.keys()).map(key => key.split(':')[0])
    ));
  }

  getActiveCustomerCount() {
    return this.getActiveUsers().length;
  }

  getLastMonthBillingCycle() {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return `${lastMonth.getFullYear()}-${(lastMonth.getMonth() + 1).toString().padStart(2, '0')}`;
  }

  logUsageEvent(userId, endpoint, weight, responseTime, statusCode) {
    // In production, send to analytics service
    console.log(`API Usage: ${userId} -> ${endpoint} (${weight} weight, ${responseTime}ms, ${statusCode})`);
  }

  logRevenueEvent(event) {
    // In production, send to analytics service
    console.log('Revenue Event:', JSON.stringify(event));
  }

  logSubscriptionEvent(event) {
    // In production, send to analytics service
    console.log('Subscription Event:', JSON.stringify(event));
  }

  logAlert(alert) {
    // In production, send to monitoring service
    console.log('Usage Alert:', JSON.stringify(alert));
  }

  async sendNotification(alert) {
    // In production, send email/webhook
    console.log('Sending notification:', alert.type);
  }

  async sendInvoiceEmail(userId, bill) {
    // In production, send invoice email
    console.log(`Sending invoice to user ${userId} for $${bill.total}`);
  }

  async generateBillingReport(results) {
    const summary = {
      totalBills: results.length,
      successfulPayments: results.filter(r => r.success).length,
      failedPayments: results.filter(r => !r.success).length,
      totalRevenue: results
        .filter(r => r.success)
        .reduce((sum, r) => sum + r.bill.total, 0),
      timestamp: new Date().toISOString()
    };

    console.log('Billing Summary:', summary);
    return summary;
  }

  // Export usage data for analysis
  exportUsageData(userId, format = 'json') {
    const userUsage = Array.from(this.usageDatabase.entries())
      .filter(([key]) => key.startsWith(userId))
      .map(([key, usage]) => ({ key, ...usage }));

    if (format === 'csv') {
      return this.convertToCSV(userUsage);
    }

    return JSON.stringify(userUsage, null, 2);
  }

  convertToCSV(data) {
    if (!data.length) return '';

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => JSON.stringify(row[header])).join(','))
    ].join('\n');

    return csvContent;
  }
}

// Express.js middleware for usage tracking
export const usageTrackingMiddleware = (billingEngine) => {
  return (req, res, next) => {
    const startTime = Date.now();

    // Capture original res.end
    const originalEnd = res.end;

    res.end = function(chunk, encoding) {
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // Track the API call
      if (req.user && req.user.userId) {
        billingEngine.trackAPICall(
          req.user.userId,
          req.path,
          responseTime,
          res.statusCode,
          res.get('Content-Length') || 0
        );
      }

      // Call original end
      originalEnd.call(this, chunk, encoding);
    };

    next();
  };
};

export default APIBillingEngine;