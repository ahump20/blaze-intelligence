// React Native Mobile App Architecture
// Blaze Intelligence Championship Mobile Platform
// Cross-Platform iOS & Android Foundation

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-netinfo/netinfo';
import PushNotification from 'react-native-push-notification';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';

// App Architecture Configuration
const APP_CONFIG = {
  version: '1.0.0',
  buildNumber: '001',
  apiBaseUrl: 'https://api.blaze-intelligence.com/v1',
  wsUrl: 'wss://api.blaze-intelligence.com/ws',
  offlineStorageKey: 'BlazeIntelligence_OfflineData',
  maxOfflineStorage: 50 * 1024 * 1024, // 50MB
  cacheDuration: 24 * 60 * 60 * 1000, // 24 hours
  performanceTargets: {
    appLaunch: 2000, // 2 seconds
    screenTransition: 300, // 300ms
    apiResponse: 100, // 100ms target
    frameRate: 60
  }
};

// Global State Management
const AppStateContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: false,
  currentTeam: null,
  offlineMode: false,
  networkStatus: 'online',
  notifications: [],
  analytics: {
    cardinals: null,
    titans: null,
    longhorns: null,
    grizzlies: null
  },
  cache: {},
  performance: {
    appLaunchTime: 0,
    lastSyncTime: null,
    apiResponseTimes: []
  },
  settings: {
    pushNotifications: true,
    darkMode: true,
    autoSync: true,
    offlineAnalytics: true,
    biometricAuth: false
  }
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload, isAuthenticated: !!action.payload };

    case 'SET_TEAM':
      return { ...state, currentTeam: action.payload };

    case 'SET_NETWORK_STATUS':
      return {
        ...state,
        networkStatus: action.payload,
        offlineMode: action.payload === 'offline'
      };

    case 'UPDATE_ANALYTICS':
      return {
        ...state,
        analytics: { ...state.analytics, [action.team]: action.payload }
      };

    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications.slice(0, 49)] // Keep last 50
      };

    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.id ? { ...n, read: true } : n
        )
      };

    case 'UPDATE_CACHE':
      return {
        ...state,
        cache: { ...state.cache, [action.key]: action.payload }
      };

    case 'CLEAR_CACHE':
      return { ...state, cache: {} };

    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload }
      };

    case 'RECORD_PERFORMANCE':
      return {
        ...state,
        performance: {
          ...state.performance,
          [action.metric]: action.value,
          lastUpdated: new Date().toISOString()
        }
      };

    default:
      return state;
  }
}

// App State Provider
export const AppStateProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    const startTime = Date.now();

    try {
      // Load cached user data
      await loadUserFromStorage();

      // Setup network monitoring
      setupNetworkMonitoring();

      // Initialize push notifications
      initializePushNotifications();

      // Load cached analytics data
      await loadCachedData();

      // Setup periodic sync
      setupPeriodicSync();

      // Record app launch performance
      const launchTime = Date.now() - startTime;
      dispatch({
        type: 'RECORD_PERFORMANCE',
        metric: 'appLaunchTime',
        value: launchTime
      });

      console.log(`App initialized in ${launchTime}ms`);

    } catch (error) {
      console.error('App initialization failed:', error);
    }
  };

  const loadUserFromStorage = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      const authToken = await AsyncStorage.getItem('authToken');

      if (userData && authToken) {
        dispatch({ type: 'SET_USER', payload: JSON.parse(userData) });
      }
    } catch (error) {
      console.error('Failed to load user from storage:', error);
    }
  };

  const setupNetworkMonitoring = () => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const status = state.isConnected ? 'online' : 'offline';
      dispatch({ type: 'SET_NETWORK_STATUS', payload: status });

      if (status === 'online' && state.offlineMode) {
        // Sync offline data when coming back online
        syncOfflineData();
      }
    });

    return unsubscribe;
  };

  const initializePushNotifications = () => {
    PushNotification.configure({
      onNotification: function(notification) {
        if (notification.userInteraction) {
          // Handle notification tap
          handleNotificationTap(notification);
        } else {
          // Handle background notification
          dispatch({
            type: 'ADD_NOTIFICATION',
            payload: {
              id: Date.now().toString(),
              title: notification.title,
              message: notification.message,
              data: notification.data,
              timestamp: new Date().toISOString(),
              read: false
            }
          });
        }
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: true,
    });
  };

  const loadCachedData = async () => {
    try {
      const cachedData = await AsyncStorage.getItem(APP_CONFIG.offlineStorageKey);
      if (cachedData) {
        const parsed = JSON.parse(cachedData);

        // Check if cache is still valid
        const cacheAge = Date.now() - new Date(parsed.timestamp).getTime();
        if (cacheAge < APP_CONFIG.cacheDuration) {
          dispatch({ type: 'UPDATE_CACHE', key: 'offline', payload: parsed.data });
        }
      }
    } catch (error) {
      console.error('Failed to load cached data:', error);
    }
  };

  const setupPeriodicSync = () => {
    // Sync every 5 minutes when online
    setInterval(() => {
      if (state.networkStatus === 'online' && state.isAuthenticated) {
        syncLatestData();
      }
    }, 5 * 60 * 1000);
  };

  const syncLatestData = async () => {
    try {
      const startTime = Date.now();

      // Fetch latest analytics for all teams
      const teams = ['cardinals', 'titans', 'longhorns', 'grizzlies'];
      const promises = teams.map(team => fetchTeamAnalytics(team));

      const results = await Promise.allSettled(promises);

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          dispatch({
            type: 'UPDATE_ANALYTICS',
            team: teams[index],
            payload: result.value
          });
        }
      });

      // Record sync performance
      const syncTime = Date.now() - startTime;
      dispatch({
        type: 'RECORD_PERFORMANCE',
        metric: 'lastSyncTime',
        value: new Date().toISOString()
      });

      // Cache data for offline use
      await cacheDataForOffline();

    } catch (error) {
      console.error('Data sync failed:', error);
    }
  };

  const fetchTeamAnalytics = async (team) => {
    const token = await AsyncStorage.getItem('authToken');

    const response = await fetch(`${APP_CONFIG.apiBaseUrl}/analytics/${team}/latest`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${team} analytics`);
    }

    return await response.json();
  };

  const cacheDataForOffline = async () => {
    try {
      const cacheData = {
        timestamp: new Date().toISOString(),
        data: {
          analytics: state.analytics,
          user: state.user,
          settings: state.settings
        }
      };

      await AsyncStorage.setItem(
        APP_CONFIG.offlineStorageKey,
        JSON.stringify(cacheData)
      );
    } catch (error) {
      console.error('Failed to cache data:', error);
    }
  };

  const syncOfflineData = async () => {
    // Sync any offline actions when connection is restored
    try {
      const offlineActions = await AsyncStorage.getItem('offlineActions');
      if (offlineActions) {
        const actions = JSON.parse(offlineActions);

        for (const action of actions) {
          await processOfflineAction(action);
        }

        // Clear offline actions after successful sync
        await AsyncStorage.removeItem('offlineActions');
      }
    } catch (error) {
      console.error('Offline sync failed:', error);
    }
  };

  const processOfflineAction = async (action) => {
    // Process actions that were queued while offline
    switch (action.type) {
      case 'ANALYTICS_REQUEST':
        await fetchTeamAnalytics(action.team);
        break;
      case 'SETTINGS_UPDATE':
        await updateSettingsOnServer(action.settings);
        break;
      default:
        console.log('Unknown offline action:', action);
    }
  };

  const handleNotificationTap = (notification) => {
    // Navigate to appropriate screen based on notification data
    if (notification.data?.screen) {
      // Navigation logic would go here
      console.log('Navigate to:', notification.data.screen);
    }
  };

  const contextValue = {
    state,
    dispatch,
    actions: {
      syncLatestData,
      cacheDataForOffline,
      fetchTeamAnalytics
    }
  };

  return (
    <AppStateContext.Provider value={contextValue}>
      {children}
    </AppStateContext.Provider>
  );
};

// Custom Hook for App State
export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within AppStateProvider');
  }
  return context;
};

// Performance Monitoring Service
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      screenTransitions: [],
      apiCalls: [],
      renderTimes: [],
      memoryUsage: []
    };
  }

  startScreenTransition(screenName) {
    return {
      screen: screenName,
      startTime: Date.now(),
      end: () => {
        const endTime = Date.now();
        const duration = endTime - this.startTime;

        this.metrics.screenTransitions.push({
          screen: screenName,
          duration,
          timestamp: new Date().toISOString()
        });

        if (duration > APP_CONFIG.performanceTargets.screenTransition) {
          console.warn(`Slow screen transition: ${screenName} (${duration}ms)`);
        }

        return duration;
      }
    };
  }

  recordAPICall(endpoint, duration, success) {
    this.metrics.apiCalls.push({
      endpoint,
      duration,
      success,
      timestamp: new Date().toISOString()
    });

    if (duration > APP_CONFIG.performanceTargets.apiResponse) {
      console.warn(`Slow API call: ${endpoint} (${duration}ms)`);
    }
  }

  getPerformanceReport() {
    const avgScreenTransition = this.calculateAverage(
      this.metrics.screenTransitions.map(t => t.duration)
    );

    const avgAPIResponse = this.calculateAverage(
      this.metrics.apiCalls.map(c => c.duration)
    );

    const apiSuccessRate = this.metrics.apiCalls.length > 0 ?
      (this.metrics.apiCalls.filter(c => c.success).length / this.metrics.apiCalls.length) * 100 :
      100;

    return {
      averageScreenTransition: avgScreenTransition,
      averageAPIResponse: avgAPIResponse,
      apiSuccessRate,
      totalAPICallsLogged: this.metrics.apiCalls.length,
      totalScreenTransitions: this.metrics.screenTransitions.length,
      generatedAt: new Date().toISOString()
    };
  }

  calculateAverage(numbers) {
    if (numbers.length === 0) return 0;
    return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
  }
}

// Theme Configuration
const BlazeTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#BF5700', // Burnt Orange Heritage
    accent: '#9BCBEB', // Cardinal Sky Blue
    background: '#0a0a0a',
    surface: '#1a1a1a',
    text: '#ffffff',
    onSurface: '#ffffff',
    placeholder: '#cccccc',
    error: '#FF4444',
    success: '#00B2A9',
    warning: '#FFB000'
  },
  fonts: {
    ...DefaultTheme.fonts,
    regular: {
      fontFamily: 'Inter-Regular',
      fontWeight: 'normal'
    },
    medium: {
      fontFamily: 'Inter-Medium',
      fontWeight: '500'
    },
    bold: {
      fontFamily: 'Inter-Bold',
      fontWeight: 'bold'
    }
  }
};

// Navigation Configuration
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: BlazeTheme.colors.surface,
          borderTopColor: BlazeTheme.colors.primary
        },
        tabBarActiveTintColor: BlazeTheme.colors.primary,
        tabBarInactiveTintColor: BlazeTheme.colors.placeholder,
        headerStyle: {
          backgroundColor: BlazeTheme.colors.surface
        },
        headerTintColor: BlazeTheme.colors.text
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} />
      <Tab.Screen name="Teams" component={TeamsScreen} />
      <Tab.Screen name="Coach" component={CoachScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { state } = useAppState();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: BlazeTheme.colors.surface
          },
          headerTintColor: BlazeTheme.colors.text,
          cardStyle: {
            backgroundColor: BlazeTheme.colors.background
          }
        }}
      >
        {state.isAuthenticated ? (
          <Stack.Screen
            name="Main"
            component={TabNavigator}
            options={{ headerShown: false }}
          />
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Main App Component
const BlazeIntelligenceApp = () => {
  const performanceMonitor = new PerformanceMonitor();

  useEffect(() => {
    // Setup global error handler
    const errorHandler = (error, isFatal) => {
      console.error('App Error:', error);

      // Log to crash reporting service
      if (isFatal) {
        // Handle fatal errors
        console.error('Fatal error occurred:', error);
      }
    };

    // Setup performance monitoring
    const performanceInterval = setInterval(() => {
      const report = performanceMonitor.getPerformanceReport();
      console.log('Performance Report:', report);
    }, 60000); // Every minute

    return () => {
      clearInterval(performanceInterval);
    };
  }, []);

  return (
    <AppStateProvider>
      <PaperProvider theme={BlazeTheme}>
        <AppNavigator />
      </PaperProvider>
    </AppStateProvider>
  );
};

// Offline Data Manager
class OfflineDataManager {
  constructor() {
    this.storageKey = APP_CONFIG.offlineStorageKey;
    this.maxStorage = APP_CONFIG.maxOfflineStorage;
  }

  async storeData(key, data) {
    try {
      const existingData = await this.getAllData();
      existingData[key] = {
        data,
        timestamp: new Date().toISOString(),
        size: JSON.stringify(data).length
      };

      // Check storage limit
      await this.enforceStorageLimit(existingData);

      await AsyncStorage.setItem(this.storageKey, JSON.stringify(existingData));
    } catch (error) {
      console.error('Failed to store offline data:', error);
    }
  }

  async getData(key) {
    try {
      const allData = await this.getAllData();
      const item = allData[key];

      if (!item) return null;

      // Check if data is still fresh
      const age = Date.now() - new Date(item.timestamp).getTime();
      if (age > APP_CONFIG.cacheDuration) {
        await this.removeData(key);
        return null;
      }

      return item.data;
    } catch (error) {
      console.error('Failed to get offline data:', error);
      return null;
    }
  }

  async getAllData() {
    try {
      const data = await AsyncStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Failed to get all offline data:', error);
      return {};
    }
  }

  async removeData(key) {
    try {
      const existingData = await this.getAllData();
      delete existingData[key];
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(existingData));
    } catch (error) {
      console.error('Failed to remove offline data:', error);
    }
  }

  async clearAllData() {
    try {
      await AsyncStorage.removeItem(this.storageKey);
    } catch (error) {
      console.error('Failed to clear offline data:', error);
    }
  }

  async enforceStorageLimit(data) {
    const totalSize = Object.values(data).reduce((sum, item) => sum + item.size, 0);

    if (totalSize > this.maxStorage) {
      // Remove oldest items until under limit
      const sortedItems = Object.entries(data).sort((a, b) =>
        new Date(a[1].timestamp) - new Date(b[1].timestamp)
      );

      let currentSize = totalSize;
      for (const [key] of sortedItems) {
        if (currentSize <= this.maxStorage) break;

        currentSize -= data[key].size;
        delete data[key];
      }
    }
  }

  async getStorageInfo() {
    const data = await this.getAllData();
    const totalSize = Object.values(data).reduce((sum, item) => sum + item.size, 0);
    const itemCount = Object.keys(data).length;

    return {
      totalSize,
      itemCount,
      maxStorage: this.maxStorage,
      usagePercent: (totalSize / this.maxStorage) * 100
    };
  }
}

// Screen Components (placeholders)
const DashboardScreen = () => null;
const AnalyticsScreen = () => null;
const TeamsScreen = () => null;
const CoachScreen = () => null;
const ProfileScreen = () => null;
const LoginScreen = () => null;
const RegisterScreen = () => null;

export {
  BlazeIntelligenceApp,
  PerformanceMonitor,
  OfflineDataManager,
  APP_CONFIG,
  BlazeTheme
};

export default BlazeIntelligenceApp;