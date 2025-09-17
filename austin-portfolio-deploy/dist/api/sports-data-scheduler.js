#!/usr/bin/env node

/**
 * Blaze Intelligence Sports Data Scheduler
 * Automated updates based on optimal windows for each sport
 *
 * Update Schedule:
 * - MLB: Every 10 minutes during games, hourly otherwise
 * - NFL: Every 15 minutes on game days, daily otherwise
 * - NBA: Every 5 minutes during games, twice daily otherwise
 * - NCAA: Weekly for football, daily during March Madness
 * - High School: Weekly during season, monthly off-season
 * - Perfect Game: After each tournament completion
 */

import { compileAllData } from './sports-data-updater.js';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Schedule configuration
const SCHEDULES = {
  MLB: {
    season: { start: '03-28', end: '11-05' },
    gameDay: { interval: 10 * 60 * 1000 }, // 10 minutes
    offDay: { interval: 60 * 60 * 1000 }   // 1 hour
  },
  NFL: {
    season: { start: '09-05', end: '02-09' },
    gameDay: { interval: 15 * 60 * 1000 }, // 15 minutes
    offDay: { interval: 24 * 60 * 60 * 1000 } // Daily
  },
  NBA: {
    season: { start: '10-22', end: '06-20' },
    gameDay: { interval: 5 * 60 * 1000 },  // 5 minutes
    offDay: { interval: 12 * 60 * 60 * 1000 } // Twice daily
  },
  NCAA_FOOTBALL: {
    season: { start: '08-24', end: '01-20' },
    interval: 7 * 24 * 60 * 60 * 1000 // Weekly
  },
  NCAA_BASKETBALL: {
    marchMadness: { start: '03-14', end: '04-08' },
    regularInterval: 24 * 60 * 60 * 1000, // Daily during March Madness
    offSeasonInterval: 7 * 24 * 60 * 60 * 1000 // Weekly otherwise
  },
  HIGH_SCHOOL: {
    season: { start: '08-15', end: '12-21' },
    inSeasonInterval: 7 * 24 * 60 * 60 * 1000, // Weekly
    offSeasonInterval: 30 * 24 * 60 * 60 * 1000 // Monthly
  },
  PERFECT_GAME: {
    interval: 24 * 60 * 60 * 1000 // Daily check for tournament updates
  }
};

// Track update status
let updateStatus = {
  lastUpdate: null,
  nextScheduled: null,
  updatesPerformed: 0,
  errors: [],
  running: false
};

// Log file for scheduler activity
const LOG_FILE = path.join(__dirname, '../logs/scheduler.log');

async function logActivity(message) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${message}\n`;

  try {
    await fs.mkdir(path.dirname(LOG_FILE), { recursive: true });
    await fs.appendFile(LOG_FILE, logEntry);
    console.log(logEntry.trim());
  } catch (error) {
    console.error('Failed to write log:', error);
  }
}

// Check if we're in season for a sport
function isInSeason(sport) {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentDay = now.getDate();
  const currentDate = `${String(currentMonth).padStart(2, '0')}-${String(currentDay).padStart(2, '0')}`;

  const schedule = SCHEDULES[sport];
  if (!schedule || !schedule.season) return false;

  const { start, end } = schedule.season;

  // Handle seasons that cross year boundaries
  if (start > end) {
    return currentDate >= start || currentDate <= end;
  } else {
    return currentDate >= start && currentDate <= end;
  }
}

// Check if today is a game day (simplified - would need actual game schedule API)
function isGameDay(sport) {
  const now = new Date();
  const dayOfWeek = now.getDay();

  switch(sport) {
    case 'NFL':
      // NFL games typically Thursday, Sunday, Monday
      return [0, 1, 4].includes(dayOfWeek);
    case 'NBA':
      // NBA games throughout the week, less on Monday
      return dayOfWeek !== 1;
    case 'MLB':
      // MLB games almost daily during season
      return true;
    default:
      return false;
  }
}

// Calculate next update interval
function getNextUpdateInterval() {
  const now = new Date();
  const intervals = [];

  // MLB Schedule
  if (isInSeason('MLB')) {
    if (isGameDay('MLB')) {
      intervals.push(SCHEDULES.MLB.gameDay.interval);
    } else {
      intervals.push(SCHEDULES.MLB.offDay.interval);
    }
  }

  // NFL Schedule
  if (isInSeason('NFL')) {
    if (isGameDay('NFL')) {
      intervals.push(SCHEDULES.NFL.gameDay.interval);
    } else {
      intervals.push(SCHEDULES.NFL.offDay.interval);
    }
  }

  // NBA Schedule
  if (isInSeason('NBA')) {
    if (isGameDay('NBA')) {
      intervals.push(SCHEDULES.NBA.gameDay.interval);
    } else {
      intervals.push(SCHEDULES.NBA.offDay.interval);
    }
  }

  // NCAA Football
  if (isInSeason('NCAA_FOOTBALL')) {
    intervals.push(SCHEDULES.NCAA_FOOTBALL.interval);
  }

  // NCAA Basketball
  const isMarchMadness =
    now.getMonth() === 2 && now.getDate() >= 14 ||
    now.getMonth() === 3 && now.getDate() <= 8;

  if (isMarchMadness) {
    intervals.push(SCHEDULES.NCAA_BASKETBALL.regularInterval);
  } else {
    intervals.push(SCHEDULES.NCAA_BASKETBALL.offSeasonInterval);
  }

  // High School
  if (isInSeason('HIGH_SCHOOL')) {
    intervals.push(SCHEDULES.HIGH_SCHOOL.inSeasonInterval);
  } else {
    intervals.push(SCHEDULES.HIGH_SCHOOL.offSeasonInterval);
  }

  // Perfect Game
  intervals.push(SCHEDULES.PERFECT_GAME.interval);

  // Return the minimum interval (most frequent update needed)
  return Math.min(...intervals);
}

// Perform scheduled update
async function performScheduledUpdate() {
  if (updateStatus.running) {
    await logActivity('Update already in progress, skipping...');
    return;
  }

  updateStatus.running = true;

  try {
    await logActivity('Starting scheduled data update...');

    const startTime = Date.now();
    const data = await compileAllData();
    const duration = Date.now() - startTime;

    updateStatus.lastUpdate = new Date().toISOString();
    updateStatus.updatesPerformed++;

    await logActivity(`Update completed in ${duration}ms. Total updates: ${updateStatus.updatesPerformed}`);

    // Save status
    const statusFile = path.join(__dirname, '../data/update-status.json');
    await fs.writeFile(statusFile, JSON.stringify(updateStatus, null, 2));

  } catch (error) {
    const errorMsg = `Update failed: ${error.message}`;
    await logActivity(errorMsg);
    updateStatus.errors.push({
      timestamp: new Date().toISOString(),
      error: error.message
    });
  } finally {
    updateStatus.running = false;
  }
}

// Main scheduler loop
async function startScheduler() {
  await logActivity('🚀 Blaze Intelligence Sports Data Scheduler Starting...');
  await logActivity(`Platform: ${process.platform}`);
  await logActivity(`Node Version: ${process.version}`);

  // Initial update
  await performScheduledUpdate();

  // Set up recurring updates
  const scheduleNextUpdate = async () => {
    const interval = getNextUpdateInterval();
    const nextUpdate = new Date(Date.now() + interval);
    updateStatus.nextScheduled = nextUpdate.toISOString();

    await logActivity(`Next update scheduled for: ${nextUpdate.toLocaleString()} (${interval / 1000 / 60} minutes)`);

    setTimeout(async () => {
      await performScheduledUpdate();
      scheduleNextUpdate(); // Schedule the next update
    }, interval);
  };

  scheduleNextUpdate();

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    await logActivity('Scheduler shutting down gracefully...');
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await logActivity('Scheduler terminated...');
    process.exit(0);
  });
}

// Health check endpoint (for monitoring)
async function getSchedulerHealth() {
  return {
    status: updateStatus.running ? 'updating' : 'idle',
    lastUpdate: updateStatus.lastUpdate,
    nextScheduled: updateStatus.nextScheduled,
    totalUpdates: updateStatus.updatesPerformed,
    recentErrors: updateStatus.errors.slice(-5),
    uptime: process.uptime()
  };
}

// Start the scheduler
if (import.meta.url === `file://${process.argv[1]}`) {
  startScheduler().catch(async error => {
    await logActivity(`Fatal error: ${error.message}`);
    process.exit(1);
  });
}

export { startScheduler, getSchedulerHealth, performScheduledUpdate };