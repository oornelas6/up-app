import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SettingsProvider } from './context/SettingsContext';
import { ThemeProvider } from './context/ThemeContext';
import { useState, useEffect } from 'react';
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
import StatsScreen from './screens/StatsScreen';
import ShareScreen from './screens/ShareScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import AuthScreen from './screens/AuthScreen';

const Stack = createStackNavigator();

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
    AsyncStorage.getItem('onboarding_complete').then(val => {
      setOnboardingDone(val === 'true');
    });
    AsyncStorage.getItem('user_name').then(val => {
      if (val) setUserName(val);
    });
    AsyncStorage.getItem('auth_token').then(val => {
      setIsAuthenticated(!!val);
    });
  }, []);

  if (isAuthenticated === null || onboardingDone === null) return null;

  if (!isAuthenticated) {
    return <AuthScreen onAuth={() => setIsAuthenticated(true)} />;
  }

  if (!onboardingDone) {
    return (
      <OnboardingScreen onFinish={({ name }) => {
        setUserName(name);
        setOnboardingDone(true);
      }} />
    );
  }

  return (

     <ThemeProvider>
      <SettingsProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: '#080010' },
            
           cardStyleInterpolator: ({ current, next, layouts }) => ({
  cardStyle: {
    opacity: current.progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    }),
    transform: [
      {
        translateX: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [layouts.screen.width * 0.08, 0],
        }),
      },
      {
        scale: next
          ? next.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 0.97],
            })
          : 1,
      },
    ],
  },
}),
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Split" component={SplitScreen} />
          <Stack.Screen name="Workout" component={WorkoutScreen} />
          <Stack.Screen name="Revolver" component={RevolverScreen} />
          <Stack.Screen name="PR" component={PRScreen} />
          <Stack.Screen name="Share" component={ShareScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="SplitBuilder" component={SplitBuilderScreen} />
          <Stack.Screen name="Summary" component={SummaryScreen} />
          <Stack.Screen name="Stats" component={StatsScreen} />
          <Stack.Screen name="History" component={HistoryScreen} />
          <Stack.Screen name="PRHistory" component={PRHistoryScreen} />
        </Stack.Navigator>
      </NavigationContainer>
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

    </SettingsProvider>
    </ThemeProvider>    
  );
}
