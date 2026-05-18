import { StyleSheet, Text, View, TouchableOpacity, Switch, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Logo from '../components/Logo';
import { useState, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { scheduleWorkoutReminder, cancelWorkoutReminder, getNotificationSettings, requestNotificationPermission } from '../utils/notifications';

import { useTheme } from '../context/ThemeContext';
export default function SettingsScreen({ navigation }) {
  const theme = useTheme();
  const styles = getStyles(theme);
  const { isKg, setIsKg, restTimer, setRestTimer, showRPE, setShowRPE } = useSettings();
  const [notifications, setNotifications] = useState(false);
  const [notifHour, setNotifHour] = useState(18);

  useEffect(() => {
    getNotificationSettings().then(settings => {
      setNotifications(settings.enabled);
      setNotifHour(settings.hour);
    });
  }, []);

  const restOptions = [60, 90, 120, 180, 240];

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out', style: 'destructive', onPress: async () => {
          await AsyncStorage.removeItem('auth_token');
          await AsyncStorage.removeItem('user_id');
          await AsyncStorage.removeItem('onboarding_complete');
          navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
        }
      }
    ]);
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <LinearGradient colors={theme.gradientBg} style={StyleSheet.absoluteFillObject} />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.back}>← Back</Text>
          </TouchableOpacity>
          <Logo size={36} />
        </View>

        <Text style={[styles.title, { color: theme.text }]}>Settings</Text>

        <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 32 }}>
          <Text style={styles.sectionLabel}>UNITS</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <View>
                <Text style={styles.rowTitle}>Weight Unit</Text>
                <Text style={styles.rowSub}>Applies to all exercises</Text>
              </View>
              <View style={styles.toggleRow}>
                <Text style={[styles.unitLabel, !isKg && styles.unitActive]}>LBS</Text>
                <Switch value={isKg} onValueChange={setIsKg} trackColor={{ false: 'rgba(157,78,221,0.3)', true: '#7b2cbf' }} thumbColor={'#ffffff'} />
                <Text style={[styles.unitLabel, isKg && styles.unitActive]}>KG</Text>
              </View>
            </View>
          </View>

          <Text style={styles.sectionLabel}>REST TIMER</Text>
          <View style={styles.card}>
            <Text style={styles.rowTitle}>Default Rest Duration</Text>
            <Text style={styles.rowSub}>Seconds between sets</Text>
            <View style={styles.optionsRow}>
              {restOptions.map(sec => (
                <TouchableOpacity key={sec} style={[styles.optionBtn, restTimer === sec && styles.optionBtnActive]} onPress={() => setRestTimer(sec)}>
                  <Text style={[styles.optionText, restTimer === sec && styles.optionTextActive]}>{sec < 60 ? `${sec}s` : `${sec / 60}m`}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Text style={styles.sectionLabel}>ADVANCED</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <View>
                <Text style={styles.rowTitle}>Show RPE</Text>
                <Text style={styles.rowSub}>Rate of perceived exertion</Text>
              </View>
              <Switch value={showRPE} onValueChange={setShowRPE} trackColor={{ false: 'rgba(157,78,221,0.3)', true: '#7b2cbf' }} thumbColor={'#ffffff'} />
            </View>
            <View style={[styles.row, { marginTop: 16 }]}>
              <View>
                <Text style={styles.rowTitle}>Workout Reminders</Text>
                <Text style={styles.rowSub}>{notifications ? `Daily at ${notifHour}:00` : 'Opt in for a friendly nudge'}</Text>
              </View>
              <Switch
                value={notifications}
                onValueChange={async (val) => {
                  if (val) {
                    const granted = await requestNotificationPermission();
                    if (granted) {
                      await scheduleWorkoutReminder(notifHour, 0);
                      setNotifications(true);
                    } else {
                      Alert.alert('Permission needed', 'Enable notifications in your iPhone Settings to use this feature.');
                    }
                  } else {
                    await cancelWorkoutReminder();
                    setNotifications(false);
                  }
                }}
                trackColor={{ false: 'rgba(157,78,221,0.3)', true: '#7b2cbf' }}
                thumbColor={'#ffffff'}
              />
            </View>
            {notifications && (
              <View style={{ marginTop: 12 }}>
                <Text style={styles.rowSub}>Reminder time</Text>
                <View style={styles.timeRow}>
                  {[6, 9, 12, 15, 17, 18, 19, 20].map(h => (
                    <TouchableOpacity
                      key={h}
                      style={[styles.timeBtn, notifHour === h && styles.timeBtnActive]}
                      onPress={async () => {
                        setNotifHour(h);
                        await scheduleWorkoutReminder(h, 0);
                      }}
                    >
                      <Text style={[styles.timeBtnText, notifHour === h && styles.timeBtnTextActive]}>
                        {h < 12 ? `${h}am` : h === 12 ? '12pm' : `${h - 12}pm`}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>

          <Text style={styles.sectionLabel}>ACCOUNT</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.row}>
              <Text style={styles.rowTitle}>Export Data</Text>
              <Text style={styles.chevron}>→</Text>
            </TouchableOpacity>
            <View style={styles.cardDivider} />
            <TouchableOpacity style={styles.row} onPress={handleSignOut}>
              <Text style={[styles.rowTitle, { color: '#e05555' }]}>Sign Out</Text>
              <Text style={styles.chevron}>→</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.version}>UP v1.8</Text>
          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </View>
  );
}

const getStyles = (theme) => ({
  root: { flex: 1, backgroundColor: '#080010' },
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 64 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  back: { color: theme.textSecondary, fontSize: 15, fontWeight: '600' },
  title: { fontSize: 38, fontWeight: '900', color: theme.text, letterSpacing: -1 },
  sectionLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 3, color: theme.textTertiary, marginBottom: 10, marginTop: 24 },
  card: { backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderRadius: 18, padding: 20, marginBottom: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowTitle: { fontSize: 16, fontWeight: '600', color: theme.text, marginBottom: 2 },
  rowSub: { fontSize: 12, color: theme.textTertiary, fontWeight: '400' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  unitLabel: { fontSize: 12, fontWeight: '700', color: theme.textTertiary, letterSpacing: 1 },
  unitActive: { color: '#9d4edd' },
  optionsRow: { flexDirection: 'row', gap: 8, marginTop: 16, flexWrap: 'wrap' },
  optionBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 100, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)' },
  optionBtnActive: { backgroundColor: 'rgba(123,44,191,0.3)', borderColor: '#7b2cbf' },
  optionText: { fontSize: 13, fontWeight: '600', color: theme.textSecondary },
  optionTextActive: { color: theme.text },
  timeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  timeBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 100, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)' },
  timeBtnActive: { backgroundColor: 'rgba(123,44,191,0.3)', borderColor: '#7b2cbf' },
  timeBtnText: { fontSize: 11, fontWeight: '600', color: theme.textSecondary },
  timeBtnTextActive: { color: theme.text },
  cardDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginVertical: 16 },
  chevron: { color: theme.textTertiary, fontSize: 16 },
  version: { fontSize: 12, color: theme.textTertiary, textAlign: 'center', marginTop: 24, letterSpacing: 1 },
});