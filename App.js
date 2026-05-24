import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SettingsProvider } from './context/SettingsContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HomeScreen from './screens/HomeScreen';
import SplitScreen from './screens/SplitScreen';
import SplitBuilderScreen from './screens/SplitBuilderScreen';
import WorkoutScreen from './screens/WorkoutScreen';
import RevolverScreen from './screens/RevolverScreen';
import PRScreen from './screens/PRScreen';
import HistoryScreen from './screens/HistoryScreen';
import SettingsScreen from './screens/SettingsScreen';
import SummaryScreen from './screens/SummaryScreen';
import SplashScreen from './screens/SplashScreen';
import PRHistoryScreen from './screens/PRHistoryScreen';
import MyWorkoutsScreen from './screens/MyWorkoutsScreen';
import WorkoutBuilderScreen from './screens/WorkoutBuilderScreen';
import GuidedWorkoutScreen from './screens/GuidedWorkoutScreen';
import StatsScreen from './screens/StatsScreen';
import ShareScreen from './screens/ShareScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import AuthScreen from './screens/AuthScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const stackOptions = {
  headerShown: false,
  cardStyle: { backgroundColor: '#080010' },
  cardStyleInterpolator: ({ current, next, layouts }) => ({
    cardStyle: {
      opacity: current.progress.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }),
      transform: [
        { translateX: current.progress.interpolate({ inputRange: [0, 1], outputRange: [layouts.screen.width * 0.08, 0] }) },
        { scale: next ? next.progress.interpolate({ inputRange: [0, 1], outputRange: [1, 0.97] }) : 1 },
      ],
    },
  }),
};

// ── Tab stacks ─────────────────────────────────────────────────

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={stackOptions}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="Split" component={SplitScreen} />
      <Stack.Screen name="SplitBuilder" component={SplitBuilderScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="PRHistory" component={PRHistoryScreen} />
    </Stack.Navigator>
  );
}

function WorkoutStack() {
  return (
    <Stack.Navigator screenOptions={stackOptions}>
      <Stack.Screen name="MyWorkoutsMain" component={MyWorkoutsScreen} />
      <Stack.Screen name="WorkoutBuilder" component={WorkoutBuilderScreen} />
      <Stack.Screen name="GuidedWorkout" component={GuidedWorkoutScreen} />
      <Stack.Screen name="Split" component={SplitScreen} />
      <Stack.Screen name="SplitBuilder" component={SplitBuilderScreen} />
      <Stack.Screen name="Workout" component={WorkoutScreen} />
      <Stack.Screen name="Revolver" component={RevolverScreen} />
      <Stack.Screen name="PR" component={PRScreen} />
      <Stack.Screen name="Summary" component={SummaryScreen} />
      <Stack.Screen name="Share" component={ShareScreen} />
      <Stack.Screen name="PRHistory" component={PRHistoryScreen} />
    </Stack.Navigator>
  );
}

function HistoryStack() {
  return (
    <Stack.Navigator screenOptions={stackOptions}>
      <Stack.Screen name="HistoryMain" component={HistoryScreen} />
      <Stack.Screen name="Share" component={ShareScreen} />
    </Stack.Navigator>
  );
}

function StatsStack() {
  return (
    <Stack.Navigator screenOptions={stackOptions}>
      <Stack.Screen name="StatsMain" component={StatsScreen} />
      <Stack.Screen name="PRHistory" component={PRHistoryScreen} />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={stackOptions}>
      <Stack.Screen name="ProfileMain" component={SettingsScreen} />
    </Stack.Navigator>
  );
}

// ── Custom Tab Bar ──────────────────────────────────────────────

function CustomTabBar({ state, descriptors, navigation }) {
  const theme = useTheme();

  const tabs = [
    { name: 'HomeTab', icon: '⌂', label: 'Home' },
    { name: 'HistoryTab', icon: '◷', label: 'History' },
    { name: 'WorkoutTab', icon: '↑', label: 'Train' },
    { name: 'StatsTab', icon: '◈', label: 'Stats' },
    { name: 'ProfileTab', icon: '◉', label: 'You' },
  ];

  return (
    <View style={{
      flexDirection: 'row',
      backgroundColor: theme.bg,
      borderTopWidth: 0.5,
      borderTopColor: theme.bgCardBorder,
      paddingBottom: 28,
      paddingTop: 10,
      paddingHorizontal: 8,
    }}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const tab = tabs[index];

        // Special center "Train" button
        if (index === 2) {
          return (
            <TouchableOpacity
              key={route.key}
              style={{ flex: 1, alignItems: 'center' }}
              onPress={() => navigation.navigate(route.name)}
              activeOpacity={0.8}
            >
              <View style={{
                width: 44, height: 44, borderRadius: 22,
                backgroundColor: isFocused ? theme.accent : 'rgba(157,78,221,0.12)',
                alignItems: 'center', justifyContent: 'center',
                borderWidth: 1.5,
                borderColor: isFocused ? theme.accent : 'rgba(157,78,221,0.25)',
              }}>
                <Image
                  source={require('./assets/logo.png')}
                  style={{ width: 24, height: 24, tintColor: '#ffffff' }}
                  resizeMode="contain"
                />
              </View>
              <Text style={{
                fontSize: 10, fontWeight: '600', marginTop: 4,
                color: isFocused ? theme.accent : theme.textTertiary,
                letterSpacing: 0.5,
              }}>Train</Text>
            </TouchableOpacity>
          );
        }

        return (
          <TouchableOpacity
            key={route.key}
            style={{ flex: 1, alignItems: 'center' }}
            onPress={() => navigation.navigate(route.name)}
            activeOpacity={0.8}
          >
            <Text style={{
              fontSize: 20, marginBottom: 3,
              color: isFocused ? theme.accent : theme.textSecondary,
            }}>{tab.icon}</Text>
            <Text style={{
              fontSize: 10, fontWeight: '600',
              color: isFocused ? theme.accent : theme.textSecondary,
              letterSpacing: 0.5,
            }}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="HomeTab" component={HomeStack} />
      <Tab.Screen name="HistoryTab" component={HistoryStack} />
      <Tab.Screen name="WorkoutTab" component={WorkoutStack} />
      <Tab.Screen name="StatsTab" component={StatsStack} />
      <Tab.Screen name="ProfileTab" component={ProfileStack} />
    </Tab.Navigator>
  );
}

// ── Root ────────────────────────────────────────────────────────

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [onboardingDone, setOnboardingDone] = useState(null);
  const [userName, setUserName] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  global.onSignOut = () => {
    setIsAuthenticated(false);
    setOnboardingDone(false);
  };

  useEffect(() => {
    AsyncStorage.getItem('onboarding_complete').then(val => setOnboardingDone(val === 'true'));
    AsyncStorage.getItem('user_name').then(val => { if (val) setUserName(val); });
    AsyncStorage.getItem('auth_token').then(val => setIsAuthenticated(!!val));
  }, []);

  if (isAuthenticated === null || onboardingDone === null) return null;

  if (!isAuthenticated) {
    return (
      <ThemeProvider>
        <AuthScreen onAuth={() => setIsAuthenticated(true)} />
      </ThemeProvider>
    );
  }

  if (!onboardingDone) {
    return (
      <ThemeProvider>
        <OnboardingScreen onFinish={({ name }) => {
          setUserName(name);
          setOnboardingDone(true);
        }} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <SettingsProvider>
        <NavigationContainer>
          <MainTabs />
        </NavigationContainer>
        {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      </SettingsProvider>
    </ThemeProvider>
  );
}
