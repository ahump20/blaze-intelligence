import { BalldontlieAPI } from '@balldontlie/sdk';

class BallDontLieService {
  constructor() {
    this.hasApiKey = !!process.env.BALLDONTLIE_API_KEY;
    
    // Initialize only if API key is available
    this.api = this.hasApiKey ? new BalldontlieAPI({
      apiKey: process.env.BALLDONTLIE_API_KEY
    }) : null;
    
    this.cache = new Map();
    this.cacheTimeout = 60000; // 1 minute cache
    
    if (!this.hasApiKey) {
      console.log('⚠️  BallDontLie API key not found - using fallback data only');
    } else {
      console.log('✅ BallDontLie API initialized with API key');
    }
  }

  // NBA Methods
  async getNBAGames(date) {
    // Return mock data immediately if no API key
    if (!this.hasApiKey) {
      return { data: this.generateMockNBAData(), meta: { source: 'mock' } };
    }
    
    const cacheKey = `nba-games-${date}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const games = await this.api.nba.getGames({
        dates: date ? [date] : undefined,
        per_page: 25
      });
      
      this.setCache(cacheKey, games);
      return games;
    } catch (error) {
      console.error('Error fetching NBA games:', error);
      return { data: this.generateMockNBAData(), meta: { source: 'mock_fallback' } };
    }
  }

  async getNBATeams() {
    if (!this.hasApiKey) {
      return { data: [], meta: { source: 'mock' } };
    }
    
    const cacheKey = 'nba-teams';
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const teams = await this.api.nba.getTeams({
        per_page: 30
      });
      
      this.setCache(cacheKey, teams);
      return teams;
    } catch (error) {
      console.error('Error fetching NBA teams:', error);
      return { data: [], meta: { source: 'mock_fallback' } };
    }
  }

  async getNBAPlayers(teamId) {
    const cacheKey = `nba-players-${teamId || 'all'}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const players = await this.api.nba.getPlayers({
        team_ids: teamId ? [teamId] : undefined,
        per_page: 50
      });
      
      this.setCache(cacheKey, players);
      return players;
    } catch (error) {
      console.error('Error fetching NBA players:', error);
      return { data: [], meta: {} };
    }
  }

  async getNBAStats(playerId, season) {
    const cacheKey = `nba-stats-${playerId}-${season}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const stats = await this.api.nba.getStats({
        player_ids: playerId ? [playerId] : undefined,
        seasons: season ? [season] : [2024],
        per_page: 100
      });
      
      this.setCache(cacheKey, stats);
      return stats;
    } catch (error) {
      console.error('Error fetching NBA stats:', error);
      return { data: [], meta: {} };
    }
  }

  // NFL Methods
  async getNFLGames(week, season) {
    if (!this.hasApiKey) {
      return { data: this.generateMockNFLData(), meta: { source: 'mock' } };
    }
    
    const cacheKey = `nfl-games-${week}-${season}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const games = await this.api.nfl.getGames({
        weeks: week ? [week] : undefined,
        seasons: season ? [season] : [2024],
        per_page: 25
      });
      
      this.setCache(cacheKey, games);
      return games;
    } catch (error) {
      console.error('Error fetching NFL games:', error);
      return { data: this.generateMockNFLData(), meta: { source: 'mock_fallback' } };
    }
  }

  async getNFLTeams() {
    if (!this.hasApiKey) {
      return { data: [], meta: { source: 'mock' } };
    }
    
    const cacheKey = 'nfl-teams';
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const teams = await this.api.nfl.getTeams({
        per_page: 32
      });
      
      this.setCache(cacheKey, teams);
      return teams;
    } catch (error) {
      console.error('Error fetching NFL teams:', error);
      return { data: [], meta: { source: 'mock_fallback' } };
    }
  }

  async getNFLPlayers(teamId) {
    const cacheKey = `nfl-players-${teamId || 'all'}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const players = await this.api.nfl.getPlayers({
        team_ids: teamId ? [teamId] : undefined,
        per_page: 100
      });
      
      this.setCache(cacheKey, players);
      return players;
    } catch (error) {
      console.error('Error fetching NFL players:', error);
      return { data: [], meta: {} };
    }
  }

  async getNFLStats(playerId, season) {
    const cacheKey = `nfl-stats-${playerId}-${season}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const stats = await this.api.nfl.getStats({
        player_ids: playerId ? [playerId] : undefined,
        seasons: season ? [season] : [2024],
        per_page: 100
      });
      
      this.setCache(cacheKey, stats);
      return stats;
    } catch (error) {
      console.error('Error fetching NFL stats:', error);
      return { data: [], meta: {} };
    }
  }

  // MLB Methods
  async getMLBGames(date) {
    if (!this.hasApiKey) {
      return { data: this.generateMockMLBData(), meta: { source: 'mock' } };
    }
    
    const cacheKey = `mlb-games-${date}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const games = await this.api.mlb.getGames({
        dates: date ? [date] : undefined,
        per_page: 25
      });
      
      this.setCache(cacheKey, games);
      return games;
    } catch (error) {
      console.error('Error fetching MLB games:', error);
      return { data: this.generateMockMLBData(), meta: { source: 'mock_fallback' } };
    }
  }

  async getMLBTeams() {
    if (!this.hasApiKey) {
      return { data: [], meta: { source: 'mock' } };
    }
    
    const cacheKey = 'mlb-teams';
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const teams = await this.api.mlb.getTeams({
        per_page: 30
      });
      
      this.setCache(cacheKey, teams);
      return teams;
    } catch (error) {
      console.error('Error fetching MLB teams:', error);
      return { data: [], meta: { source: 'mock_fallback' } };
    }
  }

  async getMLBPlayers(teamId) {
    const cacheKey = `mlb-players-${teamId || 'all'}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const players = await this.api.mlb.getPlayers({
        team_ids: teamId ? [teamId] : undefined,
        per_page: 100
      });
      
      this.setCache(cacheKey, players);
      return players;
    } catch (error) {
      console.error('Error fetching MLB players:', error);
      return { data: [], meta: {} };
    }
  }

  async getMLBStats(playerId, season) {
    const cacheKey = `mlb-stats-${playerId}-${season}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const stats = await this.api.mlb.getStats({
        player_ids: playerId ? [playerId] : undefined,
        seasons: season ? [season] : [2024],
        per_page: 100
      });
      
      this.setCache(cacheKey, stats);
      return stats;
    } catch (error) {
      console.error('Error fetching MLB stats:', error);
      return { data: [], meta: {} };
    }
  }

  // Live Score Aggregator - Multiple method names for compatibility
  async getAllLiveScores() {
    return this.getAllLiveData();
  }

  async getAllLiveData() {
    // If no API key, immediately return fallback data to prevent 401 errors
    if (!this.hasApiKey) {
      return this.getFallbackLiveData();
    }
    
    const today = new Date().toISOString().split('T')[0];
    
    try {
      const [nbaGames, nflGames, mlbGames] = await Promise.all([
        this.getNBAGames(today),
        this.getNFLGames(null, 2024),
        this.getMLBGames(today)
      ]);

      const liveData = {
        nba: nbaGames.data || [],
        nfl: nflGames.data || [],
        mlb: mlbGames.data || [],
        timestamp: new Date().toISOString(),
        status: 'active',
        source: 'balldontlie_api'
      };

      // Add mock real-time updates for demo
      if (liveData.nba.length === 0) {
        liveData.nba = this.generateMockNBAData();
      }
      if (liveData.nfl.length === 0) {
        liveData.nfl = this.generateMockNFLData();
      }
      if (liveData.mlb.length === 0) {
        liveData.mlb = this.generateMockMLBData();
      }

      return liveData;
    } catch (error) {
      console.error('Error fetching all live data:', error);
      return this.getFallbackLiveData();
    }
  }

  // Fallback data when API is unavailable
  getFallbackLiveData() {
    return {
      nba: this.generateMockNBAData(),
      nfl: this.generateMockNFLData(),
      mlb: this.generateMockMLBData(),
      timestamp: new Date().toISOString(),
      status: 'fallback',
      source: 'mock_data'
    };
  }

  generateMockNBAData() {
    const teams = [
      { name: 'Lakers', abbreviation: 'LAL' },
      { name: 'Warriors', abbreviation: 'GSW' },
      { name: 'Celtics', abbreviation: 'BOS' },
      { name: 'Heat', abbreviation: 'MIA' }
    ];

    return Array.from({ length: 3 }, (_, i) => ({
      id: `mock-nba-${i}`,
      home_team: teams[i * 2],
      visitor_team: teams[i * 2 + 1],
      home_team_score: Math.floor(Math.random() * 40) + 80,
      visitor_team_score: Math.floor(Math.random() * 40) + 80,
      status: ['Live', 'Final', 'Q3'][i],
      period: Math.floor(Math.random() * 4) + 1,
      time: `${Math.floor(Math.random() * 12)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`
    }));
  }

  generateMockNFLData() {
    const teams = [
      { name: 'Chiefs', abbreviation: 'KC' },
      { name: 'Bills', abbreviation: 'BUF' },
      { name: 'Cowboys', abbreviation: 'DAL' },
      { name: 'Eagles', abbreviation: 'PHI' }
    ];

    return Array.from({ length: 2 }, (_, i) => ({
      id: `mock-nfl-${i}`,
      home_team: teams[i * 2],
      visitor_team: teams[i * 2 + 1],
      home_team_score: Math.floor(Math.random() * 21) + 7,
      visitor_team_score: Math.floor(Math.random() * 21) + 7,
      status: ['Live', 'Final'][i],
      period: Math.floor(Math.random() * 4) + 1,
      week: 3,
      season: 2024
    }));
  }

  generateMockMLBData() {
    const teams = [
      { name: 'Yankees', abbreviation: 'NYY' },
      { name: 'Red Sox', abbreviation: 'BOS' },
      { name: 'Dodgers', abbreviation: 'LAD' },
      { name: 'Giants', abbreviation: 'SF' }
    ];

    return Array.from({ length: 4 }, (_, i) => ({
      id: `mock-mlb-${i}`,
      home_team: teams[i],
      visitor_team: teams[(i + 2) % 4],
      home_team_score: Math.floor(Math.random() * 8) + 1,
      visitor_team_score: Math.floor(Math.random() * 8) + 1,
      status: ['Live', 'Final', 'Top 7', 'Bot 5'][i],
      inning: Math.floor(Math.random() * 9) + 1
    }));
  }

  // Cache helpers
  getCached(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > this.cacheTimeout) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clearCache() {
    this.cache.clear();
  }
}

export default new BallDontLieService();