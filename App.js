import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SettingsProvider } from './context/SettingsContext';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HomeScreen from './screens/HomeScreen';
import SplitScreen from './screens/SplitScreen';
import WorkoutScreen from './screens/WorkoutScreen';
import RevolverScreen from './screens/RevolverScreen';
import PRScreen from './screens/PRScreen';
import HistoryScreen from './screens/HistoryScreen';
import SettingsScreen from './screens/SettingsScreen';
import SummaryScreen from './screens/SummaryScreen';
import SplashScreen from './screens/SplashScreen';
import OnboardingScreen from './screens/OnboardingScreen';

const Stack = createStackNavigator();

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [onboardingDone, setOnboardingDone] = useState(null);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    AsyncStorage.getItem('onboarding_complete').then(val => {
      setOnboardingDone(val === 'true');
    });
    AsyncStorage.getItem('user_name').then(val => {
      if (val) setUserName(val);
    });
  }, []);

  if (onboardingDone === null) return null;

  if (!onboardingDone) {
    return (
      <OnboardingScreen onFinish={({ name }) => {
        setUserName(name);
        setOnboardingDone(true);
      }} />
    );
  }

  return (
    <SettingsProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: '#080010' },
            cardStyleInterpolator: ({ current }) => ({
              cardStyle: { opacity: current.progress },
            }),
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Split" component={SplitScreen} />
          <Stack.Screen name="Workout" component={WorkoutScreen} />
          <Stack.Screen name="Revolver" component={RevolverScreen} />
          <Stack.Screen name="PR" component={PRScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="Summary" component={SummaryScreen} />
          <Stack.Screen name="History" component={HistoryScreen} />
        </Stack.Navigator>
      </NavigationContainer>
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
    </SettingsProvider>
  );
}
