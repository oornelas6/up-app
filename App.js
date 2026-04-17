import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';
import SplitScreen from './screens/SplitScreen';
import WorkoutScreen from './screens/WorkoutScreen';
import RevolverScreen from './screens/RevolverScreen';
import PRScreen from './screens/PRScreen';
import HistoryScreen from './screens/HistoryScreen';
import './aws-config';
import SettingsScreen from './screens/SettingsScreen';


const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#080010' },
          cardStyleInterpolator: ({ current, layouts }) => ({
            cardStyle: {
              opacity: current.progress,
            },
          }),
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Split" component={SplitScreen} />
        <Stack.Screen name="Workout" component={WorkoutScreen} />
        <Stack.Screen name="Revolver" component={RevolverScreen} />
        <Stack.Screen name="PR" component={PRScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="History" component={HistoryScreen} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
