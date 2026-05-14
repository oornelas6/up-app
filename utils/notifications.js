import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const MESSAGES = [
  { title: "Your body's ready.", body: "What are we training today?" },
  { title: "Progress doesn't pause.", body: "Pick up where you left off." },
  { title: "Same time yesterday you PR'd.", body: "Let's get after it." },
  { title: "Rest is earned.", body: "You've got a session in you today." },
  { title: "get UP.", body: "Your future self will thank you." },
  { title: "One session at a time.", body: "That's all it takes." },
  { title: "The work compounds.", body: "Show up today." },
  { title: "Your split is calling.", body: "Ready when you are." },
];

export const requestNotificationPermission = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
};

export const scheduleWorkoutReminder = async (hour = 18, minute = 0) => {
  await Notifications.cancelAllScheduledNotificationsAsync();
  
  const msg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
  
  await Notifications.scheduleNotificationAsync({
    content: {
      title: msg.title,
      body: msg.body,
    },
    trigger: {
      hour,
      minute,
      repeats: true,
    },
  });
  
  await AsyncStorage.setItem('notification_hour', String(hour));
  await AsyncStorage.setItem('notification_minute', String(minute));
  await AsyncStorage.setItem('notifications_enabled', 'true');
};

export const cancelWorkoutReminder = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();
  await AsyncStorage.setItem('notifications_enabled', 'false');
};

export const getNotificationSettings = async () => {
  const enabled = await AsyncStorage.getItem('notifications_enabled');
  const hour = await AsyncStorage.getItem('notification_hour');
  const minute = await AsyncStorage.getItem('notification_minute');
  return {
    enabled: enabled === 'true',
    hour: hour ? parseInt(hour) : 18,
    minute: minute ? parseInt(minute) : 0,
  };
};