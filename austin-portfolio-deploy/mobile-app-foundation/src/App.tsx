/**
 * 🏆 BLAZE INTELLIGENCE MOBILE APP
 *
 * Championship Sports Analytics Platform - Mobile Edition
 * Real-time sports intelligence with character assessment and video analysis
 *
 * @author Austin Humphrey <ahump20@outlook.com>
 * @version 1.0.0
 */

import React, { useEffect, useState } from 'react';
import {
  StatusBar,
  StyleSheet,
  View,
  Platform,
  Alert,
  AppState,
  AppStateStatus,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import SplashScreen from 'react-native-splash-screen';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';

// Redux Store
import { store, persistor } from './store/store';

// Screens
import LoadingScreen from './screens/LoadingScreen';
import AuthScreen from './screens/AuthScreen';
import DashboardScreen from './screens/DashboardScreen';
import AnalyticsScreen from './screens/AnalyticsScreen';
import VideoAnalysisScreen from './screens/VideoAnalysisScreen';
import CharacterAssessmentScreen from './screens/CharacterAssessmentScreen';
import LiveDataScreen from './screens/LiveDataScreen';
import SettingsScreen from './screens/SettingsScreen';
import ProfileScreen from './screens/ProfileScreen';

// Services
import { AuthService } from './services/AuthService';
import { AnalyticsService } from './services/AnalyticsService';
import { NotificationService } from './services/NotificationService';

// Types
import { RootStackParamList, TabParamList } from './types/navigation';

// Constants
import { Colors, Typography } from './constants/Design';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

/**
 * 🎯 Main Tab Navigator - Championship Dashboard Navigation
 */
const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Dashboard':
              iconName = 'dashboard';
              break;
            case 'Analytics':
              iconName = 'analytics';
              break;
            case 'VideoAnalysis':
              iconName = 'videocam';
              break;
            case 'LiveData':
              iconName = 'live-tv';
              break;
            case 'Profile':
              iconName = 'person';
              break;
            default:
              iconName = 'help-outline';
          }

          return (
            <View style={[styles.tabIconContainer, focused && styles.tabIconFocused]}>
              <Icon name={iconName} size={size} color={color} />
              {focused && <View style={styles.tabIndicator} />}
            </View>
          );
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: styles.tabBar,
        tabBarBackground: () => (
          <LinearGradient
            colors={[Colors.backgroundDark, Colors.backgroundLight]}
            style={StyleSheet.absoluteFillObject}
          />
        ),
        headerStyle: {
          backgroundColor: Colors.backgroundDark,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: Colors.textPrimary,
        headerTitleStyle: {
          fontFamily: Typography.fontFamily.bold,
          fontSize: Typography.fontSize.large,
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: '🏆 Championship Hub',
          headerBackground: () => (
            <LinearGradient
              colors={[Colors.primary, Colors.accent]}
              style={StyleSheet.absoluteFillObject}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{
          title: '📊 Analytics Intelligence',
        }}
      />
      <Tab.Screen
        name="VideoAnalysis"
        component={VideoAnalysisScreen}
        options={{
          title: '🎬 Video Intelligence',
        }}
      />
      <Tab.Screen
        name="LiveData"
        component={LiveDataScreen}
        options={{
          title: '📡 Live Intelligence',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: '👤 Profile',
        }}
      />
    </Tab.Navigator>
  );
};

/**
 * 🚀 Main App Component - Championship Application Architecture
 */
const App: React.FC = () => {
  const [isReady, setIsReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [appState, setAppState] = useState(AppState.currentState);

  useEffect(() => {
    initializeApp();

    // App state change handler
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        // App has come to the foreground
        AnalyticsService.trackEvent('app_foreground');
      } else if (nextAppState.match(/inactive|background/)) {
        // App has gone to the background
        AnalyticsService.trackEvent('app_background');
      }
      setAppState(nextAppState);
    };

    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      appStateSubscription?.remove();
    };
  }, [appState]);

  /**
   * 🏁 Initialize Championship Application
   */
  const initializeApp = async () => {
    try {
      // Hide splash screen
      SplashScreen.hide();

      // Initialize services
      await Promise.all([
        AuthService.initialize(),
        AnalyticsService.initialize(),
        NotificationService.initialize(),
      ]);

      // Check authentication status
      const authStatus = await AuthService.isAuthenticated();
      setIsAuthenticated(authStatus);

      // Mark app as ready
      setIsReady(true);

      // Track app launch
      AnalyticsService.trackEvent('app_launch', {
        platform: Platform.OS,
        version: '1.0.0',
        timestamp: new Date().toISOString(),
      });

      console.log('🏆 Blaze Intelligence Mobile App initialized successfully');

    } catch (error) {
      console.error('❌ App initialization failed:', error);

      Alert.alert(
        'Initialization Error',
        'Failed to initialize the app. Please restart the application.',
        [
          { text: 'Restart', onPress: () => initializeApp() },
        ]
      );
    }
  };

  /**
   * 🔐 Authentication Flow Handler
   */
  const handleAuthenticationChange = (authenticated: boolean) => {
    setIsAuthenticated(authenticated);

    if (authenticated) {
      AnalyticsService.trackEvent('user_authenticated');
    } else {
      AnalyticsService.trackEvent('user_signed_out');
    }
  };

  // Show loading screen while initializing
  if (!isReady) {
    return <LoadingScreen />;
  }

  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingScreen />} persistor={persistor}>
        <NavigationContainer>
          <StatusBar
            barStyle="light-content"
            backgroundColor={Colors.backgroundDark}
            translucent={false}
          />

          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              cardStyle: { backgroundColor: Colors.backgroundDark },
              animationEnabled: true,
              gestureEnabled: true,
            }}
          >
            {isAuthenticated ? (
              // Authenticated Stack
              <>
                <Stack.Screen name="Main" component={TabNavigator} />
                <Stack.Screen
                  name="CharacterAssessment"
                  component={CharacterAssessmentScreen}
                  options={{
                    headerShown: true,
                    title: '🧠 Character Assessment',
                    headerStyle: {
                      backgroundColor: Colors.backgroundDark,
                    },
                    headerTintColor: Colors.textPrimary,
                  }}
                />
                <Stack.Screen
                  name="Settings"
                  component={SettingsScreen}
                  options={{
                    headerShown: true,
                    title: '⚙️ Settings',
                    headerStyle: {
                      backgroundColor: Colors.backgroundDark,
                    },
                    headerTintColor: Colors.textPrimary,
                  }}
                />
              </>
            ) : (
              // Unauthenticated Stack
              <Stack.Screen name="Auth">
                {() => <AuthScreen onAuthenticationChange={handleAuthenticationChange} />}
              </Stack.Screen>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </PersistGate>
    </Provider>
  );
};

/**
 * 🎨 Championship Design System Styles
 */
const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'transparent',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    height: Platform.OS === 'ios' ? 90 : 70,
    paddingBottom: Platform.OS === 'ios' ? 25 : 10,
    paddingTop: 10,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    minHeight: 36,
  },
  tabIconFocused: {
    backgroundColor: Colors.primaryAlpha,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: -2,
    left: '50%',
    marginLeft: -2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },
});

export default App;