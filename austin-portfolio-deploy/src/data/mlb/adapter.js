// MLB Championship Data Adapter - Real SportsDataIO and MLB Stats API Integration
// By Austin Humphrey - Deep South Sports Authority
// Production-ready real-time MLB data with enterprise fallback systems

import axios from 'axios';
import cache from '../cache.js';

class MLBChampionshipAdapter {
    constructor() {
        this.source = 'MLB Championship Intelligence';
        this.apiKeys = {
            sportsdata: process.env.SPORTSDATA_IO_API_KEY,
            mlbstats: null // MLB Stats API is public, no key needed
        };
        
        this.baseUrls = {
            sportsdata: 'https://api.sportsdata.io/v3/mlb',
            mlbstats: 'https://statsapi.mlb.com/api/v1'
        };
        
        // Rate limiting configuration
        this.rateLimits = {
            sportsdata: { requests: 90, interval: 3600000 }, // 90 per hour
            mlbstats: { requests: 500, interval: 3600000 }    // Conservative limit for public API
        };
        
        this.requestCounts = new Map();
        this.isInitialized = false;
        this.apiStatus = { sportsdata: false, mlbstats: false };
        
        console.log('🏆 Austin Humphrey MLB Championship Data Adapter - Real API Integration');
        this.initialize();
    }
    
    async initialize() {
        try {
            console.log('🔄 Testing MLB championship API connectivity...');
            
            // Test SportsDataIO MLB API
            if (this.apiKeys.sportsdata) {
                const sportsDataTest = await this.makeAPIRequest('sportsdata', '/teams', {});
                if (sportsDataTest && sportsDataTest.length > 0) {
                    console.log('✅ SportsDataIO MLB API operational');
                    this.apiStatus.sportsdata = true;
                }
            }
            
            // Test MLB Stats API (public)
            const mlbStatsTest = await this.makeAPIRequest('mlbstats', '/teams', { sportId: 1 });
            if (mlbStatsTest && mlbStatsTest.teams) {
                console.log('✅ MLB Stats API operational');
                this.apiStatus.mlbstats = true;
            }
            
            this.isInitialized = true;
            const activeAPIs = Object.values(this.apiStatus).filter(Boolean).length;
            console.log(`🏆 MLB Championship data adapter ready with ${activeAPIs}/2 live APIs`);
            
        } catch (error) {
            console.warn('⚠️ MLB API connectivity issues:', error.message);
            this.isInitialized = true;
        }
    }
    
    async makeAPIRequest(provider, endpoint, params = {}) {
        try {
            // Check rate limits
            if (!this.checkRateLimit(provider)) {
                console.warn(`⚠️ Rate limit exceeded for ${provider}, using cache/fallback`);
                return null;
            }
            
            const baseUrl = this.baseUrls[provider];
            let headers = {};
            
            if (provider === 'sportsdata' && this.apiKeys.sportsdata) {
                headers['Ocp-Apim-Subscription-Key'] = this.apiKeys.sportsdata;
            }
            
            const config = {
                url: `${baseUrl}${endpoint}`,
                method: 'GET',
                headers,
                params,
                timeout: 15000
            };
            
            const response = await axios(config);
            
            // Update rate limit counter
            this.updateRateLimit(provider);
            
            return response.data;
            
        } catch (error) {
            console.error(`❌ MLB API request failed for ${provider}:`, error.message);
            return null;
        }
    }
    
    checkRateLimit(provider) {
        const now = Date.now();
        const limit = this.rateLimits[provider];
        const key = `${provider}_${Math.floor(now / limit.interval)}`;
        
        const count = this.requestCounts.get(key) || 0;
        return count < limit.requests;
    }
    
    updateRateLimit(provider) {
        const now = Date.now();
        const limit = this.rateLimits[provider];
        const key = `${provider}_${Math.floor(now / limit.interval)}`;
        
        const count = this.requestCounts.get(key) || 0;
        this.requestCounts.set(key, count + 1);
    }
    
    async getTeamSummary(teamAbbr) {
        const cacheKey = `mlb_team_${teamAbbr}`;
        
        return cache.getOrFetch(cacheKey, async () => {
            try {
                // Try SportsDataIO first for comprehensive data
                if (this.apiStatus.sportsdata) {
                    const teamData = await this.makeAPIRequest('sportsdata', `/teams/${teamAbbr}`, {});
                    if (teamData) {
                        console.log(`✅ MLB team ${teamAbbr} from SportsDataIO`);
                        return this.formatSportsDataTeam(teamData);
                    }
                }
                
                // Fallback to MLB Stats API
                if (this.apiStatus.mlbstats) {
                    const teamId = this.getMLBTeamId(teamAbbr);
                    if (teamId) {
                        const teamData = await this.makeAPIRequest('mlbstats', `/teams/${teamId}`, {});
                        if (teamData && teamData.teams && teamData.teams[0]) {
                            console.log(`✅ MLB team ${teamAbbr} from MLB Stats API`);
                            return await this.formatMLBStatsTeam(teamData.teams[0]);
                        }
                    }
                }
                
                // Championship fallback
                console.log(`🔄 Using championship fallback for ${teamAbbr}`);
                return this.getChampionshipTeamFallback(teamAbbr);
                
            } catch (error) {
                console.error(`❌ MLB team ${teamAbbr} fetch failed:`, error);
                return this.getChampionshipTeamFallback(teamAbbr);
            }
        }, { ttl: 1800000 }); // 30 minute cache
    }
    
    async getLiveGames() {
        const cacheKey = 'mlb_live_games';
        
        return cache.getOrFetch(cacheKey, async () => {
            try {
                // Try SportsDataIO for live games
                if (this.apiStatus.sportsdata) {
                    const today = new Date().toISOString().split('T')[0];
                    const liveData = await this.makeAPIRequest('sportsdata', 
                        `/scores/json/GamesByDate/${today}`, {});
                    
                    if (liveData && liveData.length > 0) {
                        console.log('✅ MLB live games from SportsDataIO');
                        return this.formatSportsDataLiveGames(liveData);
                    }
                }
                
                // Fallback to MLB Stats API
                if (this.apiStatus.mlbstats) {
                    const today = new Date().toISOString().split('T')[0];
                    const liveData = await this.makeAPIRequest('mlbstats', '/schedule', {
                        sportId: 1,
                        date: today
                    });
                    
                    if (liveData && liveData.dates && liveData.dates[0]) {
                        console.log('✅ MLB live games from MLB Stats API');
                        return this.formatMLBStatsLiveGames(liveData.dates[0].games);
                    }
                }
                
                // Championship enhanced fallback
                console.log('🔄 Using championship live games fallback');
                return this.getChampionshipLiveGamesFallback();
                
            } catch (error) {
                console.error('❌ MLB live games fetch failed:', error);
                return this.getChampionshipLiveGamesFallback();
            }
        }, { ttl: 30000 }); // 30 second cache for live data
    }
    
    async getPlayerStats(playerName) {
        const cacheKey = `mlb_player_${playerName.replace(/\s/g, '_')}`;
        
        return cache.getOrFetch(cacheKey, async () => {
            try {
                // Try SportsDataIO for comprehensive player stats
                if (this.apiStatus.sportsdata) {
                    const playerData = await this.makeAPIRequest('sportsdata', 
                        '/players/json/PlayerSeasonStats/2024', {});
                    
                    if (playerData && playerData.length > 0) {
                        const player = playerData.find(p => 
                            p.Name && p.Name.toLowerCase().includes(playerName.toLowerCase())
                        );
                        if (player) {
                            console.log(`✅ MLB player ${playerName} from SportsDataIO`);
                            return this.formatSportsDataPlayer(player);
                        }
                    }
                }
                
                // Championship enhanced fallback
                console.log(`🔄 Using championship player fallback for ${playerName}`);
                return this.getChampionshipPlayerFallback(playerName);
                
            } catch (error) {
                console.error(`❌ MLB player ${playerName} fetch failed:`, error);
                return this.getChampionshipPlayerFallback(playerName);
            }
        }, { ttl: 900000 }); // 15 minute cache
    }
    
    async getStandings(league = 'AL') {
        const cacheKey = `mlb_standings_${league}`;
        
        return cache.getOrFetch(cacheKey, async () => {
            try {
                // Try SportsDataIO for standings
                if (this.apiStatus.sportsdata) {
                    const standingsData = await this.makeAPIRequest('sportsdata', 
                        '/standings/json/Standings/2024', {});
                    
                    if (standingsData && standingsData.length > 0) {
                        console.log(`✅ MLB ${league} standings from SportsDataIO`);
                        return this.formatSportsDataStandings(standingsData, league);
                    }
                }
                
                // Fallback to MLB Stats API
                if (this.apiStatus.mlbstats) {
                    const leagueId = league === 'AL' ? 103 : 104;
                    const standingsData = await this.makeAPIRequest('mlbstats', '/standings', {
                        leagueId,
                        season: 2024,
                        standingTypes: 'regularSeason'
                    });
                    
                    if (standingsData && standingsData.records) {
                        console.log(`✅ MLB ${league} standings from MLB Stats API`);
                        return this.formatMLBStatsStandings(standingsData.records, league);
                    }
                }
                
                // Championship enhanced fallback
                console.log(`🔄 Using championship standings fallback for ${league}`);
                return this.getChampionshipStandingsFallback(league);
                
            } catch (error) {
                console.error(`❌ MLB ${league} standings fetch failed:`, error);
                return this.getChampionshipStandingsFallback(league);
            }
        }, { ttl: 3600000 }); // 1 hour cache
    }
    
    // Data formatting methods for SportsDataIO
    formatSportsDataTeam(teamData) {
        return {
            id: teamData.TeamID,
            abbreviation: teamData.Key,
            name: teamData.Name,
            fullName: teamData.FullName,
            city: teamData.City,
            wins: teamData.Wins || 0,
            losses: teamData.Losses || 0,
            winPct: teamData.Percentage ? teamData.Percentage.toFixed(3) : '0.000',
            gamesBack: teamData.GamesBack || '-',
            streak: teamData.StreakDescription || 'N/A',
            division: teamData.Division,
            league: teamData.League,
            runsScored: teamData.RunsScored || 0,
            runsAllowed: teamData.RunsAllowed || 0,
            differential: (teamData.RunsScored || 0) - (teamData.RunsAllowed || 0),
            lastUpdated: new Date().toISOString(),
            source: 'SportsDataIO',
            season: '2024',
            dataType: 'live'
        };
    }
    
    async formatMLBStatsTeam(teamData) {
        // Get current standings for this team
        const currentYear = new Date().getFullYear();
        const standingsData = await this.makeAPIRequest('mlbstats', '/standings', {
            leagueId: teamData.league.id,
            season: currentYear,
            standingTypes: 'regularSeason'
        });
        
        let teamRecord = null;
        if (standingsData && standingsData.records) {
            for (const record of standingsData.records) {
                const found = record.teamRecords.find(t => t.team.id === teamData.id);
                if (found) {
                    teamRecord = found;
                    break;
                }
            }
        }
        
        return {
            id: teamData.id,
            abbreviation: teamData.abbreviation,
            name: teamData.teamName,
            fullName: teamData.name,
            city: teamData.locationName,
            wins: teamRecord?.wins || 0,
            losses: teamRecord?.losses || 0,
            winPct: teamRecord?.winningPercentage || '0.000',
            gamesBack: teamRecord?.gamesBack || '-',
            streak: teamRecord?.streak?.streakCode || 'N/A',
            division: teamData.division?.name,
            league: teamData.league?.name,
            runsScored: teamRecord?.runsScored || 0,
            runsAllowed: teamRecord?.runsAllowed || 0,
            differential: (teamRecord?.runsScored || 0) - (teamRecord?.runsAllowed || 0),
            lastUpdated: new Date().toISOString(),
            source: 'MLB Stats API',
            season: currentYear.toString(),
            dataType: 'live'
        };
    }
    
    formatSportsDataLiveGames(gamesData) {
        return gamesData.map(game => ({
            id: game.GameID,
            homeTeam: game.HomeTeam,
            awayTeam: game.AwayTeam,
            homeScore: game.HomeTeamRuns || 0,
            awayScore: game.AwayTeamRuns || 0,
            inning: game.Inning || 1,
            inningHalf: game.InningHalf || 'Top',
            status: this.normalizeGameStatus(game.Status),
            attendance: game.Attendance,
            weather: game.Weather,
            temperature: game.Temperature,
            lastPlay: game.LastPlay || 'Game in progress',
            winProbability: this.calculateMLBWinProbability(game),
            lastUpdated: new Date().toISOString(),
            source: 'SportsDataIO',
            dataType: 'live'
        }));
    }
    
    formatMLBStatsLiveGames(gamesData) {
        return gamesData.map(game => ({
            id: game.gamePk,
            homeTeam: game.teams.home.team.abbreviation,
            awayTeam: game.teams.away.team.abbreviation,
            homeScore: game.teams.home.score || 0,
            awayScore: game.teams.away.score || 0,
            inning: game.linescore?.currentInning || 1,
            inningHalf: game.linescore?.inningState || 'Top',
            status: this.normalizeGameStatus(game.status.detailedState),
            attendance: game.venue?.name,
            weather: game.weather?.condition,
            temperature: game.weather?.temp,
            lastPlay: 'Game in progress',
            winProbability: this.calculateMLBWinProbability({
                HomeTeamRuns: game.teams.home.score,
                AwayTeamRuns: game.teams.away.score,
                Inning: game.linescore?.currentInning
            }),
            lastUpdated: new Date().toISOString(),
            source: 'MLB Stats API',
            dataType: 'live'
        }));
    }
    
    formatSportsDataPlayer(playerData) {
        return {
            name: playerData.Name,
            team: playerData.Team,
            position: playerData.Position,
            stats: {
                // Hitting stats
                avg: playerData.BattingAverage ? playerData.BattingAverage.toFixed(3) : '.000',
                hr: playerData.HomeRuns || 0,
                rbi: playerData.RunsBattedIn || 0,
                sb: playerData.StolenBases || 0,
                ops: playerData.OnBasePlusSlugging ? playerData.OnBasePlusSlugging.toFixed(3) : '.000',
                hits: playerData.Hits || 0,
                runs: playerData.Runs || 0,
                doubles: playerData.Doubles || 0,
                triples: playerData.Triples || 0,
                // Pitching stats
                era: playerData.EarnedRunAverage ? playerData.EarnedRunAverage.toFixed(2) : '0.00',
                wins: playerData.Wins || 0,
                losses: playerData.Losses || 0,
                strikeouts: playerData.Strikeouts || 0,
                whip: playerData.WalksHitsPerInningsPitched ? playerData.WalksHitsPerInningsPitched.toFixed(2) : '0.00',
                saves: playerData.Saves || 0
            },
            salary: playerData.Salary,
            fantasyPoints: playerData.FantasyPoints || 0,
            lastUpdated: new Date().toISOString(),
            source: 'SportsDataIO',
            season: '2024',
            dataType: 'live'
        };
    }
    
    formatSportsDataStandings(standingsData, league) {
        const leagueTeams = standingsData.filter(team => team.League === league);
        const divisions = {};
        
        leagueTeams.forEach(team => {
            if (!divisions[team.Division]) {
                divisions[team.Division] = [];
            }
            divisions[team.Division].push({
                team: team.Name,
                abbreviation: team.Key,
                wins: team.Wins || 0,
                losses: team.Losses || 0,
                winPct: team.Percentage ? team.Percentage.toFixed(3) : '0.000',
                gamesBack: team.GamesBack || '-',
                streak: team.StreakDescription || 'N/A',
                runsScored: team.RunsScored || 0,
                runsAllowed: team.RunsAllowed || 0,
                differential: (team.RunsScored || 0) - (team.RunsAllowed || 0),
                division: team.Division,
                league: team.League
            });
        });
        
        // Sort each division by win percentage
        Object.keys(divisions).forEach(division => {
            divisions[division].sort((a, b) => parseFloat(b.winPct) - parseFloat(a.winPct));
        });
        
        return {
            league,
            divisions,
            lastUpdated: new Date().toISOString(),
            source: 'SportsDataIO',
            season: '2024',
            dataType: 'live'
        };
    }
    
    formatMLBStatsStandings(recordsData, league) {
        const divisions = {};
        
        recordsData.forEach(record => {
            const divisionName = record.division.name;
            divisions[divisionName] = record.teamRecords.map(team => ({
                team: team.team.name,
                abbreviation: team.team.abbreviation,
                wins: team.wins,
                losses: team.losses,
                winPct: team.winningPercentage,
                gamesBack: team.gamesBack,
                streak: team.streak?.streakCode || 'N/A',
                runsScored: team.runsScored || 0,
                runsAllowed: team.runsAllowed || 0,
                differential: (team.runsScored || 0) - (team.runsAllowed || 0),
                division: divisionName,
                league: league
            }));
        });
        
        return {
            league,
            divisions,
            lastUpdated: new Date().toISOString(),
            source: 'MLB Stats API',
            season: '2024',
            dataType: 'live'
        };
    }
    
    // Championship-level fallback data
    getChampionshipTeamFallback(teamAbbr) {
        const championshipTeams = {
            'HOU': {
                abbreviation: 'HOU',
                name: 'Houston Astros',
                fullName: 'Houston Astros',
                city: 'Houston',
                wins: 88, losses: 74,
                winPct: '0.543',
                gamesBack: '5.0',
                streak: 'W2',
                division: 'AL West',
                league: 'AL',
                runsScored: 708,
                runsAllowed: 676,
                differential: 32
            },
            'TEX': {
                abbreviation: 'TEX',
                name: 'Texas Rangers',
                fullName: 'Texas Rangers',
                city: 'Arlington',
                wins: 78, losses: 84,
                winPct: '0.481',
                gamesBack: '15.0',
                streak: 'L1',
                division: 'AL West',
                league: 'AL',
                runsScored: 687,
                runsAllowed: 745,
                differential: -58
            },
            'ATL': {
                abbreviation: 'ATL',
                name: 'Atlanta Braves',
                fullName: 'Atlanta Braves',
                city: 'Atlanta',
                wins: 89, losses: 73,
                winPct: '0.549',
                gamesBack: '1.0',
                streak: 'W3',
                division: 'NL East',
                league: 'NL',
                runsScored: 724,
                runsAllowed: 648,
                differential: 76
            }
        };
        
        const team = championshipTeams[teamAbbr] || {
            abbreviation: teamAbbr,
            name: `${teamAbbr} Team`,
            fullName: `${teamAbbr} Baseball Club`,
            city: 'Unknown',
            wins: 81, losses: 81,
            winPct: '0.500',
            gamesBack: '10.0',
            streak: 'N/A',
            division: 'Unknown',
            league: 'Unknown',
            runsScored: 650,
            runsAllowed: 650,
            differential: 0
        };
        
        return {
            ...team,
            lastUpdated: new Date().toISOString(),
            source: this.source,
            season: '2024',
            dataType: 'championship_fallback'
        };
    }
    
    getChampionshipLiveGamesFallback() {
        return [
            {
                id: 'mlb_championship_1',
                homeTeam: 'HOU',
                awayTeam: 'TEX',
                homeScore: 6,
                awayScore: 4,
                inning: 8,
                inningHalf: 'Bottom',
                status: 'LIVE',
                attendance: 'Minute Maid Park',
                weather: 'Dome',
                temperature: 72,
                lastPlay: 'José Altuve singles to center field, scoring Alex Bregman',
                winProbability: 72.8,
                lastUpdated: new Date().toISOString(),
                source: this.source,
                dataType: 'championship_fallback'
            },
            {
                id: 'mlb_championship_2',
                homeTeam: 'ATL',
                awayTeam: 'NYM',
                homeScore: 3,
                awayScore: 2,
                inning: 7,
                inningHalf: 'Top',
                status: 'LIVE',
                attendance: 'Truist Park',
                weather: 'Clear',
                temperature: 75,
                lastPlay: 'Ronald Acuña Jr. steals second base',
                winProbability: 64.2,
                lastUpdated: new Date().toISOString(),
                source: this.source,
                dataType: 'championship_fallback'
            }
        ];
    }
    
    getChampionshipPlayerFallback(playerName) {
        const championshipPlayers = {
            'José Altuve': {
                name: 'José Altuve',
                team: 'HOU',
                position: '2B',
                stats: {
                    avg: '.295',
                    hr: 13,
                    rbi: 65,
                    sb: 18,
                    ops: '.794',
                    hits: 147,
                    runs: 73,
                    doubles: 24,
                    triples: 1
                },
                salary: 29000000,
                fantasyPoints: 234.5
            },
            'Ronald Acuña Jr.': {
                name: 'Ronald Acuña Jr.',
                team: 'ATL',
                position: 'OF',
                stats: {
                    avg: '.337',
                    hr: 41,
                    rbi: 106,
                    sb: 73,
                    ops: '1.012',
                    hits: 172,
                    runs: 149,
                    doubles: 28,
                    triples: 4
                },
                salary: 17000000,
                fantasyPoints: 387.2
            },
            'Corey Seager': {
                name: 'Corey Seager',
                team: 'TEX',
                position: 'SS',
                stats: {
                    avg: '.327',
                    hr: 33,
                    rbi: 96,
                    sb: 9,
                    ops: '.923',
                    hits: 163,
                    runs: 95,
                    doubles: 31,
                    triples: 2
                },
                salary: 32500000,
                fantasyPoints: 298.7
            }
        };
        
        const player = championshipPlayers[playerName] || {
            name: playerName,
            team: 'UNK',
            position: 'Unknown',
            stats: {
                avg: '.000',
                hr: 0,
                rbi: 0,
                sb: 0,
                ops: '.000',
                hits: 0,
                runs: 0
            },
            salary: 0,
            fantasyPoints: 0
        };
        
        return {
            ...player,
            lastUpdated: new Date().toISOString(),
            source: this.source,
            season: '2024',
            dataType: 'championship_fallback'
        };
    }
    
    getChampionshipStandingsFallback(league) {
        const standings = {
            AL: {
                'AL West': [
                    { team: 'Houston Astros', abbreviation: 'HOU', wins: 90, losses: 72, winPct: '0.556', gamesBack: '-', streak: 'W2', runsScored: 708, runsAllowed: 676, differential: 32 },
                    { team: 'Texas Rangers', abbreviation: 'TEX', wins: 90, losses: 72, winPct: '0.556', gamesBack: '-', streak: 'W1', runsScored: 833, runsAllowed: 740, differential: 93 },
                    { team: 'Seattle Mariners', abbreviation: 'SEA', wins: 88, losses: 74, winPct: '0.543', gamesBack: '2.0', streak: 'L1', runsScored: 679, runsAllowed: 662, differential: 17 },
                    { team: 'Los Angeles Angels', abbreviation: 'LAA', wins: 73, losses: 89, winPct: '0.451', gamesBack: '17.0', streak: 'L2', runsScored: 617, runsAllowed: 694, differential: -77 }
                ],
                'AL East': [
                    { team: 'Baltimore Orioles', abbreviation: 'BAL', wins: 101, losses: 61, winPct: '0.623', gamesBack: '-', streak: 'W1', runsScored: 807, runsAllowed: 622, differential: 185 },
                    { team: 'Tampa Bay Rays', abbreviation: 'TB', wins: 99, losses: 63, winPct: '0.611', gamesBack: '2.0', streak: 'W2', runsScored: 795, runsAllowed: 614, differential: 181 },
                    { team: 'Toronto Blue Jays', abbreviation: 'TOR', wins: 89, losses: 73, winPct: '0.549', gamesBack: '12.0', streak: 'L1', runsScored: 764, runsAllowed: 691, differential: 73 },
                    { team: 'New York Yankees', abbreviation: 'NYY', wins: 82, losses: 80, winPct: '0.506', gamesBack: '19.0', streak: 'W1', runsScored: 701, runsAllowed: 669, differential: 32 }
                ]
            },
            NL: {
                'NL East': [
                    { team: 'Atlanta Braves', abbreviation: 'ATL', wins: 104, losses: 58, winPct: '0.642', gamesBack: '-', streak: 'W3', runsScored: 947, runsAllowed: 668, differential: 279 },
                    { team: 'Philadelphia Phillies', abbreviation: 'PHI', wins: 90, losses: 72, winPct: '0.556', gamesBack: '14.0', streak: 'W1', runsScored: 745, runsAllowed: 659, differential: 86 },
                    { team: 'Miami Marlins', abbreviation: 'MIA', wins: 84, losses: 78, winPct: '0.519', gamesBack: '20.0', streak: 'L2', runsScored: 675, runsAllowed: 672, differential: 3 },
                    { team: 'New York Mets', abbreviation: 'NYM', wins: 75, losses: 87, winPct: '0.463', gamesBack: '29.0', streak: 'L1', runsScored: 738, runsAllowed: 804, differential: -66 }
                ]
            }
        };
        
        return {
            league,
            divisions: standings[league] || {},
            lastUpdated: new Date().toISOString(),
            source: this.source,
            season: '2024',
            dataType: 'championship_fallback'
        };
    }
    
    // Utility methods
    getMLBTeamId(teamAbbr) {
        const teamIds = {
            'HOU': 117, 'TEX': 140, 'ATL': 144, 'NYM': 121,
            'LAD': 119, 'SD': 135, 'NYY': 147, 'BOS': 111,
            'SF': 137, 'COL': 115, 'SEA': 136, 'LAA': 108
        };
        return teamIds[teamAbbr];
    }
    
    normalizeGameStatus(status) {
        const statusMap = {
            'In Progress': 'LIVE',
            'Live': 'LIVE',
            'Scheduled': 'SCHEDULED',
            'Final': 'FINAL',
            'Postponed': 'POSTPONED',
            'Canceled': 'CANCELED'
        };
        return statusMap[status] || status;
    }
    
    calculateMLBWinProbability(game) {
        const homeScore = game.HomeTeamRuns || 0;
        const awayScore = game.AwayTeamRuns || 0;
        const inning = game.Inning || 1;
        
        const scoreDiff = homeScore - awayScore;
        let baseProb = 50 + (scoreDiff * 8); // Baseball has higher variance
        
        // Inning adjustments - late game becomes more decisive
        if (inning >= 7) {
            const lateGameMultiplier = 1 + ((inning - 6) * 0.3);
            baseProb = 50 + (scoreDiff * 8 * lateGameMultiplier);
        }
        
        return Math.max(5, Math.min(95, Math.round(baseProb * 10) / 10));
    }
    
    // Real-time data refresh
    async refreshLiveData() {
        try {
            // Clear live data caches
            cache.clear('mlb_live_games');
            
            // Fetch fresh data
            const liveGames = await this.getLiveGames();
            
            console.log(`🔄 MLB live data refreshed: ${liveGames.length} games`);
            return liveGames;
            
        } catch (error) {
            console.error('❌ MLB live data refresh failed:', error);
            return this.getChampionshipLiveGamesFallback();
        }
    }
}

// Export singleton instance
export default new MLBChampionshipAdapter();