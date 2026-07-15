import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Logo from '../components/Logo';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { useSettings } from '../context/SettingsContext';
import * as Haptics from 'expo-haptics';

const API_BASE = 'https://lurl0xn2b7.execute-api.us-east-1.amazonaws.com';

export default function ProfileScreen({ navigation }) {
  const theme = useTheme();
  const styles = getStyles(theme);
  const { isKg, setIsKg, restTimer, setRestTimer, showRPE, setShowRPE } = useSettings();
  const [userName, setUserName] = useState('');
  const [userGoal, setUserGoal] = useState('');
  const [userWhy, setUserWhy] = useState('');
  const [stats, setStats] = useState({ totalSets: 0, totalVolume: 0, streak: 0, prs: 0, daysTraining: 0 });
  const [activeSplit, setActiveSplit] = useState(null);

  useEffect(() => {
    loadProfile();
    loadStats();
  }, []);

  const loadProfile = async () => {
    const name = await AsyncStorage.getItem('user_name') || '';
    const goal = await AsyncStorage.getItem('user_goal') || '';
    const why = await AsyncStorage.getItem('user_why') || '';
    const splitStr = await AsyncStorage.getItem('active_split');
    setUserName(name);
    setUserGoal(goal);
    setUserWhy(why);
    if (splitStr) setActiveSplit(JSON.parse(splitStr));
  };

  const loadStats = async () => {
    try {
      const userId = await AsyncStorage.getItem('user_id') || 'user-test-001';
      const response = await fetch(`${API_BASE}/history?userId=${userId}`);
      const data = await response.json();
      const sets = data.sets || [];
      const totalVolume = sets.reduce((sum, s) => sum + ((parseFloat(s.weight) || 0) * (parseInt(s.reps) || 0)), 0);
      const uniqueDays = [...new Set(sets.map(s => s.timestamp?.split('T')[0]))].sort((a, b) => b.localeCompare(a));
      const prs = sets.filter(s => s.isPR === true || s.isPR === 'true').length;

      // Calculate streak
      let streak = 0;
      const today = new Date(); today.setHours(0,0,0,0);
      const mostRecent = uniqueDays[0] ? new Date(uniqueDays[0] + 'T12:00:00') : null;
      if (mostRecent) {
        const diff = Math.floor((today - mostRecent) / (1000 * 60 * 60 * 24));
        if (diff <= 1) {
          for (let i = 0; i < uniqueDays.length; i++) {
            const d = new Date(uniqueDays[i] + 'T12:00:00'); d.setHours(0,0,0,0);
            const expected = new Date(mostRecent); expected.setHours(0,0,0,0);
            expected.setDate(expected.getDate() - i);
            if (Math.abs(d - expected) < 86400000) streak++;
            else break;
          }
        }
      }

      setStats({ totalSets: sets.length, totalVolume, streak, prs, daysTraining: uniqueDays.length });
    } catch (err) { console.error(err); }
  };

  const formatVolume = (vol) => {
    if (vol >= 1000000) return `${(vol / 1000000).toFixed(1)}M`;
    if (vol >= 1000) return `${(vol / 1000).toFixed(1)}k`;
    return Math.round(vol).toString();
  };

  const goalLabels = {
    strength: 'Get Stronger', muscle: 'Build Muscle',
    performance: 'Performance', consistency: 'Stay Consistent', general: 'General Fitness'
  };

  const restOptions = [60, 90, 120, 180, 240];

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: async () => {
        await AsyncStorage.multiRemove(['auth_token', 'user_id', 'onboarding_complete', 'user_name']);
        if (global.onSignOut) global.onSignOut();
      }}
    ]);
  };

  const firstName = userName.split(' ')[0];

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <LinearGradient colors={theme.gradientBg} style={StyleSheet.absoluteFillObject} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Header */}
        <View style={styles.header}>
          <View style={{ width: 36 }} />
          <Logo size={36} tappable={false} />
        </View>

        {/* Identity card */}
        <View style={[styles.identityCard, { backgroundColor: theme.bgCard, borderColor: theme.bgCardBorder }]}>
          <View style={styles.identityTop}>
            <View style={[styles.avatar, { backgroundColor: theme.accent }]}>
              <Text style={styles.avatarText}>{firstName.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.identityInfo}>
              <Text style={[styles.identityName, { color: theme.text }]}>{userName || 'Athlete'}</Text>
              {userGoal && <Text style={[styles.identityGoal, { color: theme.accent }]}>{goalLabels[userGoal] || userGoal}</Text>}
              {activeSplit && <Text style={[styles.identitySplit, { color: theme.textTertiary }]}>{activeSplit.name || activeSplit.trainingDays + '-day split'}</Text>}
            </View>
          </View>
          {userWhy ? (
            <View style={[styles.whyBox, { borderTopColor: theme.bgCardBorder }]}>
              <Text style={[styles.whyLabel, { color: theme.textTertiary }]}>MY WHY</Text>
              <Text style={[styles.whyText, { color: theme.textSecondary }]}>{userWhy}</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.whyBox, { borderTopColor: theme.bgCardBorder }]}
              onPress={() => navigation.navigate('EditWhy')}
            >
              <Text style={[styles.whyLabel, { color: theme.accent }]}>+ Add your why</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Lifetime stats */}
        <Text style={[styles.sectionLabel, { color: theme.textTertiary }]}>LIFETIME</Text>
        <View style={[styles.statsGrid, { backgroundColor: theme.bgCard, borderColor: theme.bgCardBorder }]}>
          {[
            { val: stats.totalSets, label: 'SETS' },
            { val: formatVolume(stats.totalVolume), label: 'VOLUME' },
            { val: stats.prs, label: 'PRS' },
            { val: stats.daysTraining, label: 'DAYS' },
          ].map(({ val, label }, i) => (
            <View key={i} style={[styles.statItem, i < 3 && { borderRightWidth: 1, borderRightColor: theme.bgCardBorder }]}>
              <Text style={[styles.statVal, { color: theme.text }]}>{val}</Text>
              <Text style={[styles.statLbl, { color: theme.textTertiary }]}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Streak */}
        <TouchableOpacity
          style={[styles.streakRow, { backgroundColor: theme.bgCard, borderColor: theme.bgCardBorder }]}
          onPress={() => navigation.navigate('Streak', { streak: stats.streak })}
          activeOpacity={0.8}
        >
          <View>
            <Text style={[styles.streakNum, { color: theme.text }]}>{stats.streak} day streak</Text>
            <Text style={[styles.streakSub, { color: theme.textTertiary }]}>Tap to view your streak</Text>
          </View>
          <Text style={[styles.streakFire, { color: stats.streak > 0 ? '#f0a500' : theme.textTertiary }]}>
            {stats.streak > 0 ? '🔥' : '—'}
          </Text>
        </TouchableOpacity>

        {/* Settings */}
        <Text style={[styles.sectionLabel, { color: theme.textTertiary }]}>SETTINGS</Text>

        <View style={[styles.settingsCard, { backgroundColor: theme.bgCard, borderColor: theme.bgCardBorder }]}>
          {/* Weight unit */}
          <View style={styles.settingRow}>
            <View>
              <Text style={[styles.settingLabel, { color: theme.text }]}>Weight Unit</Text>
              <Text style={[styles.settingSub, { color: theme.textTertiary }]}>Applied everywhere</Text>
            </View>
            <View style={styles.unitToggle}>
              <Text style={[styles.unitLabel, !isKg && { color: theme.accent, fontWeight: '800' }, { color: !isKg ? theme.accent : theme.textTertiary }]}>LBS</Text>
              <Switch value={isKg} onValueChange={setIsKg} trackColor={{ false: 'rgba(157,78,221,0.3)', true: '#7b2cbf' }} thumbColor="#ffffff" />
              <Text style={[styles.unitLabel, { color: isKg ? theme.accent : theme.textTertiary, fontWeight: isKg ? '800' : '400' }]}>KG</Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.bgCardBorder }]} />

          {/* Rest timer */}
          <View style={styles.settingRow}>
            <View>
              <Text style={[styles.settingLabel, { color: theme.text }]}>Rest Timer</Text>
              <Text style={[styles.settingSub, { color: theme.textTertiary }]}>Default between sets</Text>
            </View>
          </View>
          <View style={styles.restOptions}>
            {restOptions.map(sec => (
              <TouchableOpacity
                key={sec}
                style={[styles.restBtn, { backgroundColor: restTimer === sec ? theme.accent : theme.bgCard, borderColor: restTimer === sec ? theme.accent : theme.bgCardBorder }]}
                onPress={() => { setRestTimer(sec); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
              >
                <Text style={[styles.restBtnText, { color: restTimer === sec ? '#fff' : theme.textSecondary }]}>
                  {sec < 60 ? `${sec}s` : `${sec / 60}m`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={[styles.divider, { backgroundColor: theme.bgCardBorder }]} />

          {/* Show RPE */}
          <View style={styles.settingRow}>
            <View>
              <Text style={[styles.settingLabel, { color: theme.text }]}>Show RPE</Text>
              <Text style={[styles.settingSub, { color: theme.textTertiary }]}>Rate of perceived exertion</Text>
            </View>
            <Switch value={showRPE} onValueChange={setShowRPE} trackColor={{ false: 'rgba(157,78,221,0.3)', true: '#7b2cbf' }} thumbColor="#ffffff" />
          </View>
        </View>

        {/* Account */}
        <Text style={[styles.sectionLabel, { color: theme.textTertiary }]}>ACCOUNT</Text>
        <View style={[styles.settingsCard, { backgroundColor: theme.bgCard, borderColor: theme.bgCardBorder }]}>
          <TouchableOpacity style={styles.settingRow} onPress={() => navigation.navigate('SplitBuilder')}>
            <Text style={[styles.settingLabel, { color: theme.text }]}>Edit Split</Text>
            <Text style={[styles.chevron, { color: theme.textTertiary }]}>›</Text>
          </TouchableOpacity>
          <View style={[styles.divider, { backgroundColor: theme.bgCardBorder }]} />
          <TouchableOpacity style={styles.settingRow} onPress={handleSignOut}>
            <Text style={[styles.settingLabel, { color: '#e05555' }]}>Sign Out</Text>
            <Text style={[styles.chevron, { color: theme.textTertiary }]}>›</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.version, { color: theme.textTertiary }]}>UP v1.0 · Built for those who show up.</Text>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const getStyles = (theme) => ({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 24, paddingTop: 64 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  identityCard: { borderRadius: 20, borderWidth: 1, marginBottom: 24, overflow: 'hidden' },
  identityTop: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 20 },
  avatar: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 24, fontWeight: '900', color: '#ffffff' },
  identityInfo: { flex: 1 },
  identityName: { fontSize: 22, fontWeight: '900', letterSpacing: -0.5, marginBottom: 3 },
  identityGoal: { fontSize: 13, fontWeight: '600', marginBottom: 2 },
  identitySplit: { fontSize: 11, fontWeight: '500' },
  whyBox: { borderTopWidth: 1, padding: 16 },
  whyLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 2, marginBottom: 4 },
  whyText: { fontSize: 13, fontWeight: '400', lineHeight: 20, fontStyle: 'italic' },
  sectionLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 3, marginBottom: 10, marginTop: 8 },
  statsGrid: { flexDirection: 'row', borderRadius: 16, borderWidth: 1, marginBottom: 12 },
  statItem: { flex: 1, paddingVertical: 16, alignItems: 'center' },
  statVal: { fontSize: 22, fontWeight: '900', letterSpacing: -0.5 },
  statLbl: { fontSize: 8, fontWeight: '700', letterSpacing: 2, marginTop: 3 },
  streakRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: 16, borderWidth: 1, padding: 18, marginBottom: 24 },
  streakNum: { fontSize: 17, fontWeight: '800', marginBottom: 2 },
  streakSub: { fontSize: 11, fontWeight: '400' },
  streakFire: { fontSize: 28 },
  settingsCard: { borderRadius: 16, borderWidth: 1, marginBottom: 16, overflow: 'hidden' },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  settingLabel: { fontSize: 15, fontWeight: '600' },
  settingSub: { fontSize: 11, fontWeight: '400', marginTop: 2 },
  divider: { height: 1, marginHorizontal: 16 },
  unitToggle: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  unitLabel: { fontSize: 12, fontWeight: '600' },
  restOptions: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingBottom: 16 },
  restBtn: { flex: 1, paddingVertical: 8, borderRadius: 10, borderWidth: 1, alignItems: 'center' },
  restBtnText: { fontSize: 12, fontWeight: '700' },
  chevron: { fontSize: 20 },
  version: { fontSize: 11, textAlign: 'center', marginTop: 8, letterSpacing: 0.5 },
});
