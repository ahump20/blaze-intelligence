// Coach Sideline Interface
// Blaze Intelligence Real-Time Game Analytics
// Championship-Level Coaching Dashboard

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Vibration,
  Alert
} from 'react-native';
import Voice from '@react-native-voice/voice';
import LinearGradient from 'react-native-linear-gradient';
import { LineChart, BarChart } from 'react-native-chart-kit';
import WebSocketManager from './websocket-manager';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const SidelineCoachInterface = ({ gameId, teamId, userId }) => {
  const [gameState, setGameState] = useState({
    quarter: 1,
    timeRemaining: '15:00',
    score: { home: 0, away: 0 },
    possession: 'home',
    down: 1,
    yardsToGo: 10,
    yardLine: 25,
    situation: 'normal'
  });

  const [realTimeMetrics, setRealTimeMetrics] = useState({
    winProbability: 50.0,
    momentum: 0,
    playerFatigue: {},
    injuryRisk: {},
    performanceIndex: 85.3,
    pressureRating: 'medium'
  });

  const [playerMetrics, setPlayerMetrics] = useState({});
  const [playRecommendations, setPlayRecommendations] = useState([]);
  const [voiceCommands, setVoiceCommands] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [communicationHub, setCommunicationHub] = useState({
    messages: [],
    activeCall: null,
    coordinators: []
  });

  const [alertSystem, setAlertSystem] = useState({
    activeAlerts: [],
    criticalThreshold: 85,
    injuryAlerts: true,
    performanceAlerts: true
  });

  const wsManager = useRef(null);
  const voiceTimer = useRef(null);

  useEffect(() => {
    initializeInterface();
    return cleanup;
  }, [gameId]);

  const initializeInterface = async () => {
    try {
      // Initialize WebSocket connection for real-time data
      wsManager.current = new WebSocketManager({
        gameId,
        teamId,
        userId,
        onMessage: handleRealTimeUpdate,
        onError: handleWebSocketError
      });

      await wsManager.current.connect();

      // Setup voice commands
      await initializeVoiceCommands();

      // Load initial game data
      await loadGameData();

      // Start performance monitoring
      startPerformanceMonitoring();

    } catch (error) {
      console.error('Failed to initialize coach interface:', error);
      Alert.alert('Initialization Error', 'Failed to connect to game data. Please check your connection.');
    }
  };

  const cleanup = () => {
    if (wsManager.current) {
      wsManager.current.disconnect();
    }
    Voice.destroy().then(Voice.removeAllListeners);
    if (voiceTimer.current) {
      clearInterval(voiceTimer.current);
    }
  };

  const handleRealTimeUpdate = (data) => {
    switch (data.type) {
      case 'game_state_update':
        setGameState(prev => ({ ...prev, ...data.payload }));
        break;

      case 'player_metrics_update':
        setPlayerMetrics(prev => ({ ...prev, ...data.payload }));
        checkPlayerAlerts(data.payload);
        break;

      case 'win_probability_update':
        setRealTimeMetrics(prev => ({
          ...prev,
          winProbability: data.payload.probability,
          momentum: data.payload.momentum
        }));
        break;

      case 'play_recommendation':
        setPlayRecommendations(data.payload.recommendations);
        if (data.payload.urgent) {
          triggerUrgentAlert(data.payload);
        }
        break;

      case 'injury_alert':
        handleInjuryAlert(data.payload);
        break;

      case 'communication_message':
        setCommunicationHub(prev => ({
          ...prev,
          messages: [data.payload, ...prev.messages.slice(0, 49)]
        }));
        break;

      default:
        console.log('Unknown update type:', data.type);
    }
  };

  const initializeVoiceCommands = async () => {
    try {
      Voice.onSpeechStart = () => setIsListening(true);
      Voice.onSpeechEnd = () => setIsListening(false);
      Voice.onSpeechError = (error) => {
        console.error('Voice recognition error:', error);
        setIsListening(false);
      };

      Voice.onSpeechResults = (event) => {
        const command = event.value[0];
        processVoiceCommand(command);
        setVoiceCommands(prev => [
          { command, timestamp: new Date().toISOString() },
          ...prev.slice(0, 9)
        ]);
      };

      await Voice.isAvailable();
    } catch (error) {
      console.error('Voice commands not available:', error);
    }
  };

  const processVoiceCommand = (command) => {
    const lowerCommand = command.toLowerCase();

    // Timeout command
    if (lowerCommand.includes('timeout') || lowerCommand.includes('time out')) {
      requestTimeout();
      return;
    }

    // Player substitution
    if (lowerCommand.includes('sub') || lowerCommand.includes('substitute')) {
      openSubstitutionMenu();
      return;
    }

    // Play calling
    if (lowerCommand.includes('run') || lowerCommand.includes('pass') || lowerCommand.includes('kick')) {
      suggestPlay(lowerCommand);
      return;
    }

    // Formation changes
    if (lowerCommand.includes('formation') || lowerCommand.includes('set')) {
      suggestFormation(lowerCommand);
      return;
    }

    // Challenge/Review
    if (lowerCommand.includes('challenge') || lowerCommand.includes('review')) {
      considerChallenge();
      return;
    }

    // General query
    processGeneralQuery(command);
  };

  const loadGameData = async () => {
    try {
      const response = await fetch(`/api/games/${gameId}/current-state`, {
        headers: {
          'Authorization': `Bearer ${await getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const gameData = await response.json();
        setGameState(gameData.gameState);
        setPlayerMetrics(gameData.playerMetrics);
        setRealTimeMetrics(gameData.realTimeMetrics);
      }
    } catch (error) {
      console.error('Failed to load game data:', error);
    }
  };

  const startPerformanceMonitoring = () => {
    // Monitor player performance every 30 seconds
    const performanceInterval = setInterval(() => {
      updatePlayerPerformanceMetrics();
    }, 30000);

    // Monitor game situation changes
    const situationInterval = setInterval(() => {
      analyzeSituation();
    }, 10000);

    return () => {
      clearInterval(performanceInterval);
      clearInterval(situationInterval);
    };
  };

  const updatePlayerPerformanceMetrics = async () => {
    try {
      const response = await fetch(`/api/games/${gameId}/player-metrics`, {
        headers: {
          'Authorization': `Bearer ${await getAuthToken()}`
        }
      });

      if (response.ok) {
        const metrics = await response.json();
        setPlayerMetrics(metrics);
        checkPlayerAlerts(metrics);
      }
    } catch (error) {
      console.error('Failed to update player metrics:', error);
    }
  };

  const checkPlayerAlerts = (metrics) => {
    Object.entries(metrics).forEach(([playerId, data]) => {
      // Fatigue alert
      if (data.fatigue > 85) {
        addAlert({
          type: 'fatigue',
          playerId,
          playerName: data.name,
          level: data.fatigue > 95 ? 'critical' : 'warning',
          message: `${data.name} fatigue at ${data.fatigue}%`
        });
      }

      // Injury risk alert
      if (data.injuryRisk > 75) {
        addAlert({
          type: 'injury_risk',
          playerId,
          playerName: data.name,
          level: 'warning',
          message: `High injury risk for ${data.name}`
        });
      }

      // Performance drop alert
      if (data.performanceIndex < 60 && data.playingTime > 20) {
        addAlert({
          type: 'performance',
          playerId,
          playerName: data.name,
          level: 'info',
          message: `${data.name} performance below average`
        });
      }
    });
  };

  const addAlert = (alert) => {
    const alertWithId = {
      ...alert,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };

    setAlertSystem(prev => ({
      ...prev,
      activeAlerts: [alertWithId, ...prev.activeAlerts.slice(0, 19)]
    }));

    // Vibrate for critical alerts
    if (alert.level === 'critical') {
      Vibration.vibrate([100, 100, 100]);
    }
  };

  const startVoiceListening = async () => {
    try {
      await Voice.start('en-US');
    } catch (error) {
      console.error('Failed to start voice recognition:', error);
    }
  };

  const stopVoiceListening = async () => {
    try {
      await Voice.stop();
    } catch (error) {
      console.error('Failed to stop voice recognition:', error);
    }
  };

  const requestTimeout = () => {
    Alert.alert(
      'Request Timeout',
      'Are you sure you want to call a timeout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            // Send timeout request to officials/system
            wsManager.current?.send({
              type: 'timeout_request',
              teamId,
              gameId,
              timestamp: new Date().toISOString()
            });
          }
        }
      ]
    );
  };

  const suggestPlay = (command) => {
    // Analyze current situation and suggest plays
    const suggestions = analyzePlayOptions(gameState, command);

    setPlayRecommendations(suggestions);

    // Auto-speak the top recommendation
    if (suggestions.length > 0) {
      speakRecommendation(suggestions[0]);
    }
  };

  const analyzePlayOptions = (state, voiceInput) => {
    const situation = {
      down: state.down,
      yardsToGo: state.yardsToGo,
      yardLine: state.yardLine,
      timeRemaining: state.timeRemaining,
      score: state.score
    };

    // AI-powered play analysis would go here
    // For now, return mock recommendations
    return [
      {
        id: '1',
        name: 'Quick Slant Right',
        type: 'pass',
        confidence: 0.87,
        successProbability: 0.74,
        expectedYards: 6.2,
        riskLevel: 'low',
        reasoning: 'High completion rate in this down/distance'
      },
      {
        id: '2',
        name: 'Power Run Left',
        type: 'run',
        confidence: 0.82,
        successProbability: 0.68,
        expectedYards: 4.1,
        riskLevel: 'medium',
        reasoning: 'Favorable matchup against tired defense'
      },
      {
        id: '3',
        name: 'Play Action Deep',
        type: 'pass',
        confidence: 0.71,
        successProbability: 0.45,
        expectedYards: 12.8,
        riskLevel: 'high',
        reasoning: 'Defense expecting run, opportunity for big gain'
      }
    ];
  };

  const speakRecommendation = (play) => {
    const message = `Recommendation: ${play.name}. ${Math.round(play.successProbability * 100)}% success probability.`;

    // Text-to-speech would be implemented here
    console.log('Speaking:', message);
  };

  const renderGameClock = () => (
    <View style={styles.clockContainer}>
      <LinearGradient
        colors={['#BF5700', '#FF7A00']}
        style={styles.clockGradient}
      >
        <Text style={styles.quarter}>Q{gameState.quarter}</Text>
        <Text style={styles.timeRemaining}>{gameState.timeRemaining}</Text>
      </LinearGradient>
    </View>
  );

  const renderScoreboard = () => (
    <View style={styles.scoreboardContainer}>
      <View style={styles.scoreBox}>
        <Text style={styles.teamLabel}>HOME</Text>
        <Text style={styles.score}>{gameState.score.home}</Text>
      </View>
      <View style={styles.scoreBox}>
        <Text style={styles.teamLabel}>AWAY</Text>
        <Text style={styles.score}>{gameState.score.away}</Text>
      </View>
    </View>
  );

  const renderDownAndDistance = () => (
    <View style={styles.downDistanceContainer}>
      <Text style={styles.downDistance}>
        {gameState.down === 1 ? '1st' :
         gameState.down === 2 ? '2nd' :
         gameState.down === 3 ? '3rd' : '4th'} & {gameState.yardsToGo}
      </Text>
      <Text style={styles.yardLine}>at {gameState.yardLine}</Text>
    </View>
  );

  const renderWinProbability = () => (
    <View style={styles.winProbContainer}>
      <Text style={styles.winProbLabel}>Win Probability</Text>
      <Text style={styles.winProbValue}>
        {realTimeMetrics.winProbability.toFixed(1)}%
      </Text>
      <View style={styles.winProbBar}>
        <View
          style={[
            styles.winProbFill,
            { width: `${realTimeMetrics.winProbability}%` }
          ]}
        />
      </View>
    </View>
  );

  const renderPlayRecommendations = () => (
    <View style={styles.recommendationsContainer}>
      <Text style={styles.sectionTitle}>AI Play Recommendations</Text>
      <ScrollView style={styles.recommendationsList}>
        {playRecommendations.map((play, index) => (
          <TouchableOpacity
            key={play.id}
            style={[
              styles.recommendationCard,
              index === 0 && styles.topRecommendation
            ]}
            onPress={() => selectPlay(play)}
          >
            <View style={styles.playHeader}>
              <Text style={styles.playName}>{play.name}</Text>
              <Text style={styles.playType}>{play.type.toUpperCase()}</Text>
            </View>
            <View style={styles.playMetrics}>
              <Text style={styles.metric}>
                Success: {Math.round(play.successProbability * 100)}%
              </Text>
              <Text style={styles.metric}>
                Exp. Yards: {play.expectedYards}
              </Text>
              <Text style={[styles.metric, styles[play.riskLevel]]}>
                Risk: {play.riskLevel}
              </Text>
            </View>
            <Text style={styles.playReasoning}>{play.reasoning}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderPlayerMetrics = () => (
    <View style={styles.playerMetricsContainer}>
      <Text style={styles.sectionTitle}>Player Performance</Text>
      <ScrollView horizontal style={styles.playerScroll}>
        {Object.entries(playerMetrics).map(([playerId, data]) => (
          <View key={playerId} style={styles.playerCard}>
            <Text style={styles.playerName}>{data.name}</Text>
            <Text style={styles.playerPosition}>{data.position}</Text>
            <View style={styles.playerStats}>
              <Text style={styles.stat}>
                Performance: {data.performanceIndex}%
              </Text>
              <Text style={[
                styles.stat,
                data.fatigue > 85 ? styles.warning : styles.normal
              ]}>
                Fatigue: {data.fatigue}%
              </Text>
              <Text style={styles.stat}>
                Snaps: {data.snapsPlayed}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderVoiceInterface = () => (
    <View style={styles.voiceContainer}>
      <TouchableOpacity
        style={[
          styles.voiceButton,
          isListening && styles.voiceButtonActive
        ]}
        onPress={isListening ? stopVoiceListening : startVoiceListening}
      >
        <Text style={styles.voiceButtonText}>
          {isListening ? '🎤 Listening...' : '🎤 Voice Commands'}
        </Text>
      </TouchableOpacity>

      {voiceCommands.length > 0 && (
        <View style={styles.recentCommands}>
          <Text style={styles.commandsTitle}>Recent Commands:</Text>
          {voiceCommands.slice(0, 3).map((cmd, index) => (
            <Text key={index} style={styles.command}>
              "{cmd.command}"
            </Text>
          ))}
        </View>
      )}
    </View>
  );

  const renderAlerts = () => (
    <View style={styles.alertsContainer}>
      <Text style={styles.sectionTitle}>Active Alerts</Text>
      {alertSystem.activeAlerts.slice(0, 5).map((alert) => (
        <View
          key={alert.id}
          style={[
            styles.alertCard,
            styles[`alert${alert.level.charAt(0).toUpperCase() + alert.level.slice(1)}`]
          ]}
        >
          <Text style={styles.alertMessage}>{alert.message}</Text>
          <TouchableOpacity
            style={styles.dismissAlert}
            onPress={() => dismissAlert(alert.id)}
          >
            <Text style={styles.dismissText}>✕</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );

  const selectPlay = (play) => {
    Alert.alert(
      'Confirm Play Selection',
      `Send "${play.name}" to offensive coordinator?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: () => {
            wsManager.current?.send({
              type: 'play_selection',
              playId: play.id,
              playName: play.name,
              gameId,
              teamId,
              timestamp: new Date().toISOString()
            });
          }
        }
      ]
    );
  };

  const dismissAlert = (alertId) => {
    setAlertSystem(prev => ({
      ...prev,
      activeAlerts: prev.activeAlerts.filter(alert => alert.id !== alertId)
    }));
  };

  const getAuthToken = async () => {
    // Implementation would get token from secure storage
    return 'mock_token';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        {renderGameClock()}
        {renderScoreboard()}
      </View>

      <View style={styles.gameInfo}>
        {renderDownAndDistance()}
        {renderWinProbability()}
      </View>

      {renderPlayRecommendations()}
      {renderPlayerMetrics()}
      {renderVoiceInterface()}
      {renderAlerts()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#1a1a1a',
  },
  clockContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  clockGradient: {
    padding: 16,
    alignItems: 'center',
  },
  quarter: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  timeRemaining: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  scoreboardContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  scoreBox: {
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 12,
  },
  teamLabel: {
    color: '#cccccc',
    fontSize: 12,
    fontWeight: '600',
  },
  score: {
    color: '#BF5700',
    fontSize: 28,
    fontWeight: 'bold',
  },
  gameInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  downDistanceContainer: {
    alignItems: 'center',
  },
  downDistance: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  yardLine: {
    color: '#cccccc',
    fontSize: 14,
  },
  winProbContainer: {
    alignItems: 'center',
    minWidth: 120,
  },
  winProbLabel: {
    color: '#cccccc',
    fontSize: 12,
    marginBottom: 4,
  },
  winProbValue: {
    color: '#00B2A9',
    fontSize: 20,
    fontWeight: 'bold',
  },
  winProbBar: {
    width: 100,
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
    marginTop: 4,
  },
  winProbFill: {
    height: '100%',
    backgroundColor: '#00B2A9',
    borderRadius: 2,
  },
  recommendationsContainer: {
    padding: 16,
  },
  sectionTitle: {
    color: '#BF5700',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  recommendationsList: {
    maxHeight: 300,
  },
  recommendationCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  topRecommendation: {
    borderColor: '#BF5700',
    borderWidth: 2,
  },
  playHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  playName: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  playType: {
    color: '#BF5700',
    fontSize: 12,
    fontWeight: '600',
    backgroundColor: 'rgba(191, 87, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  playMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metric: {
    color: '#cccccc',
    fontSize: 12,
  },
  low: {
    color: '#00B2A9',
  },
  medium: {
    color: '#FFB000',
  },
  high: {
    color: '#FF4444',
  },
  playReasoning: {
    color: '#999',
    fontSize: 12,
    fontStyle: 'italic',
  },
  playerMetricsContainer: {
    padding: 16,
  },
  playerScroll: {
    marginTop: 8,
  },
  playerCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
    minWidth: 120,
  },
  playerName: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  playerPosition: {
    color: '#BF5700',
    fontSize: 12,
    marginBottom: 8,
  },
  playerStats: {
    gap: 4,
  },
  stat: {
    color: '#cccccc',
    fontSize: 11,
  },
  warning: {
    color: '#FF4444',
  },
  normal: {
    color: '#00B2A9',
  },
  voiceContainer: {
    padding: 16,
    alignItems: 'center',
  },
  voiceButton: {
    backgroundColor: '#2a2a2a',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 2,
    borderColor: '#BF5700',
  },
  voiceButtonActive: {
    backgroundColor: '#BF5700',
  },
  voiceButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  recentCommands: {
    marginTop: 16,
    alignItems: 'center',
  },
  commandsTitle: {
    color: '#cccccc',
    fontSize: 14,
    marginBottom: 8,
  },
  command: {
    color: '#999',
    fontSize: 12,
    fontStyle: 'italic',
  },
  alertsContainer: {
    padding: 16,
  },
  alertCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  alertCritical: {
    backgroundColor: 'rgba(255, 68, 68, 0.2)',
    borderColor: '#FF4444',
    borderWidth: 1,
  },
  alertWarning: {
    backgroundColor: 'rgba(255, 176, 0, 0.2)',
    borderColor: '#FFB000',
    borderWidth: 1,
  },
  alertInfo: {
    backgroundColor: 'rgba(0, 178, 169, 0.2)',
    borderColor: '#00B2A9',
    borderWidth: 1,
  },
  alertMessage: {
    color: 'white',
    fontSize: 14,
    flex: 1,
  },
  dismissAlert: {
    padding: 4,
  },
  dismissText: {
    color: '#999',
    fontSize: 16,
  },
});

export default SidelineCoachInterface;