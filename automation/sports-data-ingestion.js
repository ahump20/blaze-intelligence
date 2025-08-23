#!/usr/bin/env node

/**
 * Blaze Intelligence Automated Sports Data Ingestion System
 * Comprehensive data collection across MLB, NFL, NBA, College sports with real-time processing
 */

import EventEmitter from 'events';
import cron from 'node-cron';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { performance } from 'perf_hooks';

// Data Source Configuration
const DATA_SOURCES = {
    MLB: {
        name: 'Major League Baseball',
        endpoints: [
            {
                name: 'MLB Stats API',
                url: 'https://statsapi.mlb.com/api/v1',
                rateLimitPerHour: 1000,
                dataTypes: ['games', 'teams', 'players', 'stats', 'standings']
            },
            {
                name: 'Baseball Savant',
                url: 'https://baseballsavant.mlb.com',
                rateLimitPerHour: 500,
                dataTypes: ['statcast', 'pitch_data', 'exit_velocity', 'launch_angle']
            }
        ],
        teams: [
            'STL', 'CHC', 'MIL', 'CIN', 'PIT', // NL Central
            'NYY', 'BOS', 'TOR', 'TB', 'BAL',  // AL East
            'HOU', 'LAA', 'TEX', 'SEA', 'OAK', // AL West
            'LAD', 'SD', 'SF', 'COL', 'ARI',   // NL West
            'ATL', 'NYM', 'PHI', 'MIA', 'WAS', // NL East
            'CWS', 'MIN', 'DET', 'KC', 'CLE'   // AL Central
        ],
        priority: {
            'STL': 10, // Cardinals - highest priority
            'CHC': 8,  // Division rivals
            'MIL': 8,
            'CIN': 7,
            'PIT': 7
        }
    },
    NFL: {
        name: 'National Football League',
        endpoints: [
            {
                name: 'NFL API',
                url: 'https://api.nfl.com/v1',
                rateLimitPerHour: 500,
                dataTypes: ['games', 'teams', 'players', 'stats', 'standings']
            },
            {
                name: 'ESPN NFL',
                url: 'https://site.api.espn.com/apis/site/v2/sports/football/nfl',
                rateLimitPerHour: 1000,
                dataTypes: ['scores', 'news', 'standings', 'teams']
            }
        ],
        teams: [
            'TEN', 'IND', 'HOU', 'JAX',        // AFC South
            'KC', 'LAC', 'DEN', 'LV',          // AFC West
            'BUF', 'MIA', 'NE', 'NYJ',         // AFC East
            'BAL', 'CIN', 'CLE', 'PIT',        // AFC North
            'DAL', 'NYG', 'PHI', 'WAS',        // NFC East
            'GB', 'MIN', 'CHI', 'DET',         // NFC North
            'NO', 'TB', 'ATL', 'CAR',          // NFC South
            'LAR', 'SF', 'SEA', 'ARI'          // NFC West
        ],
        priority: {
            'TEN': 10, // Titans - highest priority
            'HOU': 8,  // Division rivals
            'IND': 8,
            'JAX': 7
        }
    },
    NBA: {
        name: 'National Basketball Association',
        endpoints: [
            {
                name: 'NBA Stats API',
                url: 'https://stats.nba.com/stats',
                rateLimitPerHour: 2000,
                dataTypes: ['games', 'teams', 'players', 'stats', 'standings']
            },
            {
                name: 'ESPN NBA',
                url: 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba',
                rateLimitPerHour: 1000,
                dataTypes: ['scores', 'standings', 'teams', 'playoffs']
            }
        ],
        teams: [
            'MEM', 'LAL', 'GSW', 'PHX', 'SAC', // Western Conference
            'DAL', 'DEN', 'MIN', 'OKC', 'POR',
            'UTA', 'LAC', 'NO', 'SAS', 'HOU',
            'BOS', 'MIA', 'NYK', 'BKN', 'PHI', // Eastern Conference
            'CLE', 'ATL', 'TOR', 'CHI', 'IND',
            'WAS', 'ORL', 'CHA', 'DET', 'MIL'
        ],
        priority: {
            'MEM': 10, // Grizzlies - highest priority
            'LAL': 8,  // High-profile teams
            'GSW': 8,
            'BOS': 8
        }
    },
    COLLEGE: {
        name: 'College Sports',
        endpoints: [
            {
                name: 'College Football Data',
                url: 'https://api.collegefootballdata.com',
                rateLimitPerHour: 500,
                dataTypes: ['games', 'teams', 'recruiting', 'betting']
            },
            {
                name: 'ESPN College',
                url: 'https://site.api.espn.com/apis/site/v2/sports/football/college-football',
                rateLimitPerHour: 1000,
                dataTypes: ['scores', 'rankings', 'conferences']
            }
        ],
        teams: [
            'TEX', 'OU', 'USC', 'UCLA', 'ORE', // Big 12 / Pac-12
            'ALA', 'GA', 'LSU', 'FLA', 'AUB',  // SEC
            'OSU', 'MICH', 'PSU', 'WIS', 'IA', // Big Ten
            'CLEM', 'FSU', 'MIAMI', 'NC', 'UVA' // ACC
        ],
        priority: {
            'TEX': 10, // Longhorns - highest priority
            'OU': 8,   // Rivalry
            'ALA': 9,  // Championship contenders
            'GA': 9,
            'OSU': 8
        }
    }
};

// Data Processing Pipeline
class DataProcessor {
    constructor() {
        this.processors = new Map([
            ['games', this.processGameData.bind(this)],
            ['teams', this.processTeamData.bind(this)],
            ['players', this.processPlayerData.bind(this)],
            ['stats', this.processStatsData.bind(this)],
            ['standings', this.processStandingsData.bind(this)],
            ['statcast', this.processStatcastData.bind(this)],
            ['scores', this.processScoreData.bind(this)],
            ['rankings', this.processRankingData.bind(this)]
        ]);
    }

    async process(dataType, rawData, source) {
        const processor = this.processors.get(dataType);
        if (!processor) {
            throw new Error(`No processor found for data type: ${dataType}`);
        }

        const startTime = performance.now();
        
        try {
            const processed = await processor(rawData, source);
            const processingTime = performance.now() - startTime;
            
            return {
                success: true,
                dataType,
                source,
                recordCount: Array.isArray(processed) ? processed.length : 1,
                processingTime,
                data: processed
            };
        } catch (error) {
            return {
                success: false,
                dataType,
                source,
                error: error.message,
                processingTime: performance.now() - startTime
            };
        }
    }

    async processGameData(rawData, source) {
        if (!rawData) return [];
        
        const games = Array.isArray(rawData) ? rawData : [rawData];
        
        return games.map(game => ({
            id: game.gamePk || game.id || crypto.randomUUID(),
            date: game.gameDate || game.date,
            homeTeam: {
                name: game.teams?.home?.team?.name || game.homeTeam,
                score: game.teams?.home?.score || game.homeScore,
                abbreviation: game.teams?.home?.team?.abbreviation
            },
            awayTeam: {
                name: game.teams?.away?.team?.name || game.awayTeam,
                score: game.teams?.away?.score || game.awayScore,
                abbreviation: game.teams?.away?.team?.abbreviation
            },
            status: game.status?.abstractGameState || game.status,
            venue: game.venue?.name,
            weather: game.weather,
            processed_at: Date.now(),
            source: source
        }));
    }

    async processTeamData(rawData, source) {
        if (!rawData) return [];
        
        const teams = Array.isArray(rawData) ? rawData : [rawData];
        
        return teams.map(team => ({
            id: team.id,
            name: team.name || team.teamName,
            abbreviation: team.abbreviation || team.teamCode,
            division: team.division?.name,
            conference: team.conference?.name,
            league: team.league?.name,
            venue: team.venue?.name,
            record: {
                wins: team.record?.wins,
                losses: team.record?.losses,
                winPercentage: team.record?.winPercentage
            },
            processed_at: Date.now(),
            source: source
        }));
    }

    async processPlayerData(rawData, source) {
        if (!rawData) return [];
        
        const players = Array.isArray(rawData) ? rawData : [rawData];
        
        return players.map(player => ({
            id: player.id,
            name: player.fullName || `${player.firstName} ${player.lastName}`,
            position: player.primaryPosition?.abbreviation || player.position,
            team: {
                name: player.currentTeam?.name,
                abbreviation: player.currentTeam?.abbreviation
            },
            jersey_number: player.primaryNumber,
            age: player.currentAge,
            height: player.height,
            weight: player.weight,
            birthCountry: player.birthCountry,
            processed_at: Date.now(),
            source: source
        }));
    }

    async processStatsData(rawData, source) {
        if (!rawData) return [];
        
        const stats = Array.isArray(rawData) ? rawData : [rawData];
        
        return stats.map(stat => ({
            player_id: stat.player?.id,
            team_id: stat.team?.id,
            season: stat.season,
            stats: stat.stats || stat,
            splits: stat.splits,
            processed_at: Date.now(),
            source: source
        }));
    }

    async processStandingsData(rawData, source) {
        if (!rawData) return [];
        
        const standings = rawData.records || rawData.standings || [rawData];
        
        return standings.map(standing => ({
            team: {
                id: standing.team?.id,
                name: standing.team?.name,
                abbreviation: standing.team?.abbreviation
            },
            division: standing.division?.name,
            conference: standing.conference?.name,
            wins: standing.wins,
            losses: standing.losses,
            win_percentage: standing.winPercentage,
            games_back: standing.gamesBack,
            streak: standing.streak,
            processed_at: Date.now(),
            source: source
        }));
    }

    async processStatcastData(rawData, source) {
        if (!rawData) return [];
        
        const statcast = Array.isArray(rawData) ? rawData : [rawData];
        
        return statcast.map(data => ({
            game_id: data.game_pk,
            pitch_id: data.pitch_number,
            batter_id: data.batter,
            pitcher_id: data.pitcher,
            exit_velocity: data.launch_speed,
            launch_angle: data.launch_angle,
            hit_distance: data.hit_distance_sc,
            hit_coordinate_x: data.hc_x,
            hit_coordinate_y: data.hc_y,
            pitch_type: data.pitch_type,
            pitch_velocity: data.release_speed,
            spin_rate: data.release_spin_rate,
            processed_at: Date.now(),
            source: source
        }));
    }

    async processScoreData(rawData, source) {
        return this.processGameData(rawData, source);
    }

    async processRankingData(rawData, source) {
        if (!rawData) return [];
        
        const rankings = rawData.rankings || [rawData];
        
        return rankings.map(rank => ({
            team_id: rank.team?.id,
            team_name: rank.team?.name,
            rank: rank.current_rank || rank.rank,
            previous_rank: rank.previous_rank,
            points: rank.points,
            first_place_votes: rank.first_place_votes,
            poll: rank.poll,
            week: rank.week,
            season: rank.season,
            processed_at: Date.now(),
            source: source
        }));
    }
}

// Rate Limiter
class RateLimiter {
    constructor() {
        this.requests = new Map(); // endpoint -> [timestamps]
    }

    async checkRateLimit(endpoint, limitPerHour) {
        const now = Date.now();
        const oneHourAgo = now - (60 * 60 * 1000);
        
        if (!this.requests.has(endpoint)) {
            this.requests.set(endpoint, []);
        }
        
        const requests = this.requests.get(endpoint);
        
        // Remove requests older than 1 hour
        const recentRequests = requests.filter(timestamp => timestamp > oneHourAgo);
        this.requests.set(endpoint, recentRequests);
        
        if (recentRequests.length >= limitPerHour) {
            const oldestRequest = Math.min(...recentRequests);
            const waitTime = (oldestRequest + (60 * 60 * 1000)) - now;
            throw new Error(`Rate limit exceeded. Wait ${Math.ceil(waitTime / 1000)} seconds.`);
        }
        
        // Record this request
        recentRequests.push(now);
        return true;
    }
}

// Main Sports Data Ingestion System
class SportsDataIngestionSystem extends EventEmitter {
    constructor() {
        super();
        
        this.processor = new DataProcessor();
        this.rateLimiter = new RateLimiter();
        this.ingestionMetrics = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            totalRecords: 0,
            avgProcessingTime: 0,
            startTime: Date.now()
        };
        
        this.cache = new Map(); // Simple in-memory cache
        this.scheduledJobs = new Map();
        this.isRunning = false;
        
        this.setupEventHandlers();
    }

    setupEventHandlers() {
        this.on('ingestion:start', (source, dataType) => {
            console.log(`📥 Starting ingestion: ${source} - ${dataType}`);
        });

        this.on('ingestion:complete', (source, dataType, result) => {
            console.log(`✅ Ingestion complete: ${source} - ${dataType} (${result.recordCount} records, ${result.processingTime.toFixed(0)}ms)`);
        });

        this.on('ingestion:error', (source, dataType, error) => {
            console.error(`❌ Ingestion failed: ${source} - ${dataType}`, error);
        });

        this.on('rate:limit:exceeded', (endpoint, waitTime) => {
            console.warn(`⚠️ Rate limit exceeded for ${endpoint}, waiting ${waitTime}s`);
        });
    }

    async fetchData(url, options = {}) {
        try {
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Blaze-Intelligence-Data-Ingestion/1.0',
                    'Accept': 'application/json',
                    ...options.headers
                },
                timeout: options.timeout || 30000
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            throw new Error(`Data fetch failed: ${error.message}`);
        }
    }

    async ingestFromSource(sport, endpoint, dataType, teamFilter = null) {
        const startTime = performance.now();
        this.emit('ingestion:start', sport, dataType);
        
        try {
            // Rate limiting
            await this.rateLimiter.checkRateLimit(endpoint.url, endpoint.rateLimitPerHour);
            
            // Build URL for specific data type
            let requestUrl = this.buildRequestUrl(sport, endpoint, dataType, teamFilter);
            
            // Check cache first
            const cacheKey = `${sport}:${dataType}:${teamFilter || 'all'}`;
            const cached = this.cache.get(cacheKey);
            if (cached && (Date.now() - cached.timestamp < 300000)) { // 5 minute cache
                this.emit('ingestion:complete', sport, dataType, {
                    recordCount: cached.data.length,
                    processingTime: 0,
                    cached: true
                });
                return cached.data;
            }
            
            // Fetch fresh data
            const rawData = await this.fetchData(requestUrl);
            
            // Process data
            const result = await this.processor.process(dataType, rawData, `${sport}:${endpoint.name}`);
            
            if (result.success) {
                // Cache the result
                this.cache.set(cacheKey, {
                    data: result.data,
                    timestamp: Date.now()
                });
                
                // Save to file
                await this.saveProcessedData(sport, dataType, result.data);
                
                // Update metrics
                this.ingestionMetrics.successfulRequests++;
                this.ingestionMetrics.totalRecords += result.recordCount;
                this.updateAverageProcessingTime(result.processingTime);
                
                this.emit('ingestion:complete', sport, dataType, result);
                return result.data;
            } else {
                throw new Error(result.error);
            }
            
        } catch (error) {
            this.ingestionMetrics.failedRequests++;
            this.emit('ingestion:error', sport, dataType, error.message);
            throw error;
        } finally {
            this.ingestionMetrics.totalRequests++;
        }
    }

    buildRequestUrl(sport, endpoint, dataType, teamFilter) {
        let baseUrl = endpoint.url;
        
        // Sport-specific URL building
        switch (sport) {
            case 'MLB':
                return this.buildMLBUrl(baseUrl, dataType, teamFilter);
            case 'NFL':
                return this.buildNFLUrl(baseUrl, dataType, teamFilter);
            case 'NBA':
                return this.buildNBAUrl(baseUrl, dataType, teamFilter);
            case 'COLLEGE':
                return this.buildCollegeUrl(baseUrl, dataType, teamFilter);
            default:
                return baseUrl;
        }
    }

    buildMLBUrl(baseUrl, dataType, teamFilter) {
        const today = new Date().toISOString().split('T')[0];
        
        switch (dataType) {
            case 'games':
                return `${baseUrl}/schedule?sportId=1&date=${today}`;
            case 'teams':
                return `${baseUrl}/teams?sportId=1`;
            case 'players':
                return teamFilter 
                    ? `${baseUrl}/teams/${teamFilter}/roster` 
                    : `${baseUrl}/sports/1/players`;
            case 'standings':
                return `${baseUrl}/standings?leagueId=103,104`;
            case 'stats':
                return `${baseUrl}/stats?stats=season&sportId=1`;
            default:
                return baseUrl;
        }
    }

    buildNFLUrl(baseUrl, dataType, teamFilter) {
        const currentWeek = Math.ceil((Date.now() - new Date(new Date().getFullYear(), 8, 1)) / (7 * 24 * 60 * 60 * 1000));
        
        switch (dataType) {
            case 'games':
                return `${baseUrl}/scoreboard`;
            case 'teams':
                return `${baseUrl}/teams`;
            case 'standings':
                return `${baseUrl}/standings`;
            case 'scores':
                return `${baseUrl}/scoreboard`;
            default:
                return baseUrl;
        }
    }

    buildNBAUrl(baseUrl, dataType, teamFilter) {
        const currentSeason = `${new Date().getFullYear() - 1}-${new Date().getFullYear().toString().slice(-2)}`;
        
        switch (dataType) {
            case 'games':
                return `${baseUrl}/scoreboard`;
            case 'teams':
                return `${baseUrl}/teams`;
            case 'standings':
                return `${baseUrl}/standings`;
            case 'stats':
                return `${baseUrl}/leaguedashteamstats?Season=${currentSeason}&SeasonType=Regular+Season`;
            default:
                return baseUrl;
        }
    }

    buildCollegeUrl(baseUrl, dataType, teamFilter) {
        const currentYear = new Date().getFullYear();
        
        switch (dataType) {
            case 'games':
                return `${baseUrl}/games?year=${currentYear}`;
            case 'teams':
                return `${baseUrl}/teams`;
            case 'rankings':
                return `${baseUrl}/rankings?year=${currentYear}`;
            default:
                return baseUrl;
        }
    }

    async saveProcessedData(sport, dataType, data) {
        try {
            const dataDir = path.join(process.cwd(), 'data', sport.toLowerCase());
            await fs.mkdir(dataDir, { recursive: true });
            
            const filename = `${dataType}-${Date.now()}.json`;
            const filepath = path.join(dataDir, filename);
            
            await fs.writeFile(filepath, JSON.stringify({
                sport,
                dataType,
                timestamp: Date.now(),
                recordCount: Array.isArray(data) ? data.length : 1,
                data
            }, null, 2));
            
            // Also save latest data
            const latestPath = path.join(dataDir, `${dataType}-latest.json`);
            await fs.writeFile(latestPath, JSON.stringify({
                sport,
                dataType,
                timestamp: Date.now(),
                recordCount: Array.isArray(data) ? data.length : 1,
                data
            }, null, 2));
            
        } catch (error) {
            console.error(`Failed to save data for ${sport}:${dataType}`, error);
        }
    }

    async ingestAllSports() {
        console.log('🚀 Starting comprehensive sports data ingestion...');
        const results = [];
        
        for (const [sportCode, sportConfig] of Object.entries(DATA_SOURCES)) {
            for (const endpoint of sportConfig.endpoints) {
                for (const dataType of endpoint.dataTypes) {
                    try {
                        // Prioritize high-priority teams
                        const priorityTeams = Object.keys(sportConfig.priority || {}).slice(0, 5);
                        
                        if (priorityTeams.length > 0 && dataType === 'games') {
                            // Ingest games for priority teams first
                            for (const team of priorityTeams) {
                                const data = await this.ingestFromSource(sportCode, endpoint, dataType, team);
                                results.push({ sport: sportCode, dataType, team, recordCount: data.length });
                            }
                        } else {
                            // General ingestion
                            const data = await this.ingestFromSource(sportCode, endpoint, dataType);
                            results.push({ sport: sportCode, dataType, recordCount: data.length });
                        }
                        
                        // Small delay to prevent overwhelming APIs
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        
                    } catch (error) {
                        console.error(`Failed to ingest ${sportCode}:${dataType}`, error.message);
                        results.push({ sport: sportCode, dataType, error: error.message });
                    }
                }
            }
        }
        
        console.log(`✅ Sports data ingestion complete. Processed ${results.length} data sources.`);
        return results;
    }

    async ingestPriorityData() {
        console.log('⚡ Starting priority data ingestion...');
        const results = [];
        
        // Cardinals (MLB)
        try {
            const cardinals = await this.ingestFromSource('MLB', DATA_SOURCES.MLB.endpoints[0], 'games', 'STL');
            results.push({ sport: 'MLB', team: 'Cardinals', recordCount: cardinals.length });
        } catch (error) {
            console.error('Cardinals data ingestion failed:', error.message);
        }
        
        // Titans (NFL)  
        try {
            const titans = await this.ingestFromSource('NFL', DATA_SOURCES.NFL.endpoints[0], 'games', 'TEN');
            results.push({ sport: 'NFL', team: 'Titans', recordCount: titans.length });
        } catch (error) {
            console.error('Titans data ingestion failed:', error.message);
        }
        
        // Grizzlies (NBA)
        try {
            const grizzlies = await this.ingestFromSource('NBA', DATA_SOURCES.NBA.endpoints[0], 'games', 'MEM');
            results.push({ sport: 'NBA', team: 'Grizzlies', recordCount: grizzlies.length });
        } catch (error) {
            console.error('Grizzlies data ingestion failed:', error.message);
        }
        
        // Longhorns (College)
        try {
            const longhorns = await this.ingestFromSource('COLLEGE', DATA_SOURCES.COLLEGE.endpoints[0], 'games', 'TEX');
            results.push({ sport: 'COLLEGE', team: 'Longhorns', recordCount: longhorns.length });
        } catch (error) {
            console.error('Longhorns data ingestion failed:', error.message);
        }
        
        console.log(`✅ Priority data ingestion complete. Processed ${results.length} priority teams.`);
        return results;
    }

    scheduleIngestion() {
        // Every 15 minutes - Priority data (Cardinals, Titans, Grizzlies, Longhorns)
        this.scheduledJobs.set('priority', cron.schedule('*/15 * * * *', async () => {
            try {
                await this.ingestPriorityData();
            } catch (error) {
                console.error('Priority data ingestion failed:', error);
            }
        }));
        
        // Every hour - All games and standings
        this.scheduledJobs.set('games', cron.schedule('0 * * * *', async () => {
            try {
                const sports = ['MLB', 'NFL', 'NBA', 'COLLEGE'];
                for (const sport of sports) {
                    for (const endpoint of DATA_SOURCES[sport].endpoints) {
                        if (endpoint.dataTypes.includes('games')) {
                            await this.ingestFromSource(sport, endpoint, 'games');
                        }
                        if (endpoint.dataTypes.includes('standings')) {
                            await this.ingestFromSource(sport, endpoint, 'standings');
                        }
                    }
                    await new Promise(resolve => setTimeout(resolve, 5000)); // 5 second delay between sports
                }
            } catch (error) {
                console.error('Scheduled games ingestion failed:', error);
            }
        }));
        
        // Every 4 hours - Team and player data
        this.scheduledJobs.set('teams-players', cron.schedule('0 */4 * * *', async () => {
            try {
                const sports = ['MLB', 'NFL', 'NBA', 'COLLEGE'];
                for (const sport of sports) {
                    for (const endpoint of DATA_SOURCES[sport].endpoints) {
                        for (const dataType of ['teams', 'players']) {
                            if (endpoint.dataTypes.includes(dataType)) {
                                await this.ingestFromSource(sport, endpoint, dataType);
                            }
                        }
                    }
                }
            } catch (error) {
                console.error('Scheduled teams/players ingestion failed:', error);
            }
        }));
        
        // Daily at 6 AM - Full comprehensive ingestion
        this.scheduledJobs.set('comprehensive', cron.schedule('0 6 * * *', async () => {
            try {
                await this.ingestAllSports();
            } catch (error) {
                console.error('Comprehensive daily ingestion failed:', error);
            }
        }));
        
        console.log('📅 Data ingestion scheduling configured:');
        console.log('  • Priority data: Every 15 minutes');
        console.log('  • Games & standings: Every hour');  
        console.log('  • Teams & players: Every 4 hours');
        console.log('  • Comprehensive: Daily at 6 AM');
    }

    updateAverageProcessingTime(newTime) {
        const totalRequests = this.ingestionMetrics.successfulRequests;
        this.ingestionMetrics.avgProcessingTime = 
            (this.ingestionMetrics.avgProcessingTime * (totalRequests - 1) + newTime) / totalRequests;
    }

    start() {
        if (this.isRunning) {
            console.log('⚠️ Data ingestion system is already running');
            return;
        }
        
        console.log('🚀 Starting Sports Data Ingestion System...');
        this.isRunning = true;
        
        // Schedule automated ingestion
        this.scheduleIngestion();
        
        // Initial priority data ingestion
        setTimeout(() => this.ingestPriorityData(), 5000);
        
        console.log('✅ Sports Data Ingestion System started successfully');
    }

    stop() {
        if (!this.isRunning) {
            console.log('⚠️ Data ingestion system is not running');
            return;
        }
        
        console.log('🛑 Stopping Sports Data Ingestion System...');
        
        // Stop all scheduled jobs
        for (const [name, job] of this.scheduledJobs) {
            job.destroy();
            console.log(`  Stopped ${name} schedule`);
        }
        
        this.scheduledJobs.clear();
        this.isRunning = false;
        
        console.log('✅ Sports Data Ingestion System stopped');
    }

    getMetrics() {
        const runtime = Date.now() - this.ingestionMetrics.startTime;
        const successRate = this.ingestionMetrics.totalRequests > 0 
            ? this.ingestionMetrics.successfulRequests / this.ingestionMetrics.totalRequests 
            : 0;
        
        return {
            ...this.ingestionMetrics,
            runtime: runtime,
            successRate: successRate,
            requestsPerHour: this.ingestionMetrics.totalRequests / (runtime / (60 * 60 * 1000)),
            cacheSize: this.cache.size,
            scheduledJobs: this.scheduledJobs.size
        };
    }

    async generateIngestionReport() {
        const metrics = this.getMetrics();
        
        const report = {
            timestamp: Date.now(),
            metrics,
            data_sources: Object.keys(DATA_SOURCES),
            priority_teams: {
                MLB: 'STL Cardinals',
                NFL: 'TEN Titans',
                NBA: 'MEM Grizzlies', 
                COLLEGE: 'TEX Longhorns'
            },
            recent_ingestions: Array.from(this.cache.keys()).slice(-20)
        };
        
        try {
            const reportPath = path.join(process.cwd(), 'reports', `ingestion-report-${Date.now()}.json`);
            await fs.mkdir(path.dirname(reportPath), { recursive: true });
            await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
            console.log(`📊 Ingestion report saved: ${reportPath}`);
        } catch (error) {
            console.error('Failed to save ingestion report:', error);
        }
        
        return report;
    }
}

// CLI Interface
if (import.meta.url === `file://${process.argv[1]}`) {
    const system = new SportsDataIngestionSystem();
    const command = process.argv[2] || 'start';
    
    switch (command) {
        case 'start':
            system.start();
            
            process.on('SIGINT', () => {
                console.log('\nReceived SIGINT, shutting down gracefully...');
                system.stop();
                process.exit(0);
            });
            
            process.on('SIGTERM', () => {
                console.log('\nReceived SIGTERM, shutting down gracefully...');
                system.stop();
                process.exit(0);
            });
            
            break;
            
        case 'priority':
            system.ingestPriorityData().then(results => {
                console.log('\nPriority Data Ingestion Results:');
                for (const result of results) {
                    console.log(`${result.sport} ${result.team}: ${result.recordCount} records`);
                }
                process.exit(0);
            }).catch(error => {
                console.error('Priority ingestion failed:', error);
                process.exit(1);
            });
            break;
            
        case 'all':
            system.ingestAllSports().then(results => {
                console.log('\nComprehensive Data Ingestion Results:');
                const successful = results.filter(r => !r.error);
                const failed = results.filter(r => r.error);
                
                console.log(`✅ Successful: ${successful.length}`);
                console.log(`❌ Failed: ${failed.length}`);
                
                if (failed.length > 0) {
                    console.log('\nFailed ingestions:');
                    failed.forEach(f => console.log(`  ${f.sport}:${f.dataType} - ${f.error}`));
                }
                
                process.exit(0);
            }).catch(error => {
                console.error('Comprehensive ingestion failed:', error);
                process.exit(1);
            });
            break;
            
        case 'metrics':
            const metrics = system.getMetrics();
            console.log('\nIngestion Metrics:');
            console.log(`Total Requests: ${metrics.totalRequests}`);
            console.log(`Success Rate: ${(metrics.successRate * 100).toFixed(1)}%`);
            console.log(`Total Records: ${metrics.totalRecords.toLocaleString()}`);
            console.log(`Avg Processing Time: ${metrics.avgProcessingTime.toFixed(0)}ms`);
            console.log(`Cache Size: ${metrics.cacheSize}`);
            console.log(`Runtime: ${(metrics.runtime / 60000).toFixed(1)} minutes`);
            process.exit(0);
            break;
            
        default:
            console.log('Usage: node sports-data-ingestion.js [start|priority|all|metrics]');
            console.log('  start    - Start continuous ingestion with scheduling');
            console.log('  priority - Ingest priority teams data once');
            console.log('  all      - Run comprehensive data ingestion once');
            console.log('  metrics  - Show ingestion metrics');
            process.exit(1);
    }
}

export { SportsDataIngestionSystem, DataProcessor, DATA_SOURCES };