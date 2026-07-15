import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import * as Haptics from 'expo-haptics';

const API_BASE = 'https://lurl0xn2b7.execute-api.us-east-1.amazonaws.com';

const AVATAR_COLORS = ['#7b2cbf', '#3c096c', '#5a189a', '#9d4edd', '#480ca8'];

const AWARDS = [
  { id: 'first_set', title: 'First Rep', desc: 'Logged your first set.', icon: '1', req: (s) => s.totalSets >= 1 },
  { id: 'ten_sets', title: 'Getting Started', desc: '10 sets logged.', icon: '10', req: (s) => s.totalSets >= 10 },
  { id: 'fifty_sets', title: 'Consistent', desc: '50 sets logged.', icon: '50', req: (s) => s.totalSets >= 50 },
  { id: 'hundred_sets', title: 'Century', desc: '100 sets logged.', icon: '100', req: (s) => s.totalSets >= 100 },
  { id: 'first_pr', title: 'Personal Best', desc: 'Hit your first PR.', icon: 'PR', req: (s) => s.prs >= 1 },
  { id: 'five_prs', title: 'On a Tear', desc: '5 PRs and counting.', icon: '5', req: (s) => s.prs >= 5 },
  { id: 'streak_3', title: 'Showing Up', desc: '3-day streak.', icon: '3', req: (s) => s.streak >= 3 },
  { id: 'streak_7', title: 'Full Week', desc: '7-day streak.', icon: '7', req: (s) => s.streak >= 7 },
  { id: 'streak_30', title: 'Locked In', desc: '30-day streak.', icon: '30', req: (s) => s.streak >= 30 },
  { id: 'days_10', title: 'Regular', desc: 'Trained 10 different days.', icon: 'D', req: (s) => s.daysTraining >= 10 },
  { id: 'days_30', title: 'Dedicated', desc: 'Trained 30 different days.', icon: 'D+', req: (s) => s.daysTraining >= 30 },
  { id: 'volume_100k', title: 'Volume King', desc: 'Moved 100,000 lbs total.', icon: 'V', req: (s) => s.totalVolume >= 100000 },
];

export default function ProfileScreen({ navigation }) {
  const theme = useTheme();
  const styles = getStyles(theme);
  const [userName, setUserName] = useState('');
  const [userGoal, setUserGoal] = useState('');
  const [userWhy, setUserWhy] = useState('');
  const [activeSplit, setActiveSplit] = useState(null);
  const [avatarColor, setAvatarColor] = useState('#7b2cbf');
  const [stats, setStats] = useState({ totalSets: 0, totalVolume: 0, streak: 0, prs: 0, daysTraining: 0, topSport: null });
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadProfile();
    loadStats();
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadProfile);
    return unsubscribe;
  }, [navigation]);

  const loadProfile = async () => {
    const name = await AsyncStorage.getItem('user_name') || '';
    const goal = await AsyncStorage.getItem('user_goal') || '';
    const why = await AsyncStorage.getItem('user_why') || '';
    const splitStr = await AsyncStorage.getItem('active_split');
    const color = await AsyncStorage.getItem('avatar_color') || '#7b2cbf';
    setUserName(name); setUserGoal(goal); setUserWhy(why); setAvatarColor(color);
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

      let streak = 0;
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const mostRecent = uniqueDays[0] ? new Date(uniqueDays[0] + 'T12:00:00') : null;
      if (mostRecent) {
        const diff = Math.floor((today - mostRecent) / (1000 * 60 * 60 * 24));
        if (diff <= 1) {
          for (let i = 0; i < uniqueDays.length; i++) {
            const d = new Date(uniqueDays[i] + 'T12:00:00'); d.setHours(0, 0, 0, 0);
            const expected = new Date(mostRecent); expected.setHours(0, 0, 0, 0);
            expected.setDate(expected.getDate() - i);
            if (Math.abs(d - expected) < 86400000) streak++;
            else break;
          }
        }
      }

      const muscleMap = {
        'Flat Barbell Bench': 'push', 'Incline DB Bench': 'push', 'Overhead Press': 'push',
        'Back Squat': 'legs', 'Belt Squat': 'legs', 'RDL': 'legs',
        'Bent Over Barbell Row': 'pull', 'Wide Grip Lat Pulldown': 'pull',
        'Hammer Curl': 'arms', 'Preacher Curl': 'arms',
      };
      const typeCounts = { push: 0, pull: 0, legs: 0, arms: 0 };
      sets.forEach(s => { const t = muscleMap[s.exercise]; if (t) typeCounts[t]++; });
      const topType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
      const sportLabels = { push: 'Powerbuilder', pull: 'Back Specialist', legs: 'Leg Day Loyalist', arms: 'Aesthetic Builder' };
      const topSport = sets.length > 5 ? (sportLabels[topType] || 'All-Around Athlete') : null;

      setStats({ totalSets: sets.length, totalVolume, streak, prs, daysTraining: uniqueDays.length, topSport });
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

  const cycleAvatarColor = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const idx = AVATAR_COLORS.indexOf(avatarColor);
    const next = AVATAR_COLORS[(idx + 1) % AVATAR_COLORS.length];
    setAvatarColor(next);
    await AsyncStorage.setItem('avatar_color', next);
  };

  const unlockedAwards = AWARDS.filter(a => a.req(stats));
  const lockedAwards = AWARDS.filter(a => !a.req(stats));
  const firstName = userName.split(' ')[0];

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <LinearGradient colors={theme.gradientBg} style={StyleSheet.absoluteFillObject} />
      <Animated.ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll} style={{ opacity: fadeAnim }}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.pageTitle, { color: theme.text }]}>You</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')} activeOpacity={0.7}>
            <Text style={[styles.gearBtn, { color: theme.textSecondary }]}>⚙</Text>
          </TouchableOpacity>
        </View>

        {/* Identity */}
        <LinearGradient
          colors={['rgba(123,44,191,0.18)', 'rgba(74,0,128,0.04)']}
          style={[styles.identityCard, { borderColor: theme.bgCardBorder }]}
        >
          <View style={styles.identityTop}>
            <TouchableOpacity onPress={cycleAvatarColor} activeOpacity={0.8}>
              <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
                <Text style={styles.avatarText}>{firstName ? firstName.charAt(0).toUpperCase() : 'U'}</Text>
              </View>
              <Text style={[styles.avatarHint, { color: theme.textTertiary }]}>tap</Text>
            </TouchableOpacity>
            <View style={styles.identityInfo}>
              <Text style={[styles.identityName, { color: theme.text }]}>{userName || 'Athlete'}</Text>
              {stats.topSport && (
                <View style={styles.sportBadge}>
                  <Text style={styles.sportBadgeText}>{stats.topSport}</Text>
                </View>
              )}
              {userGoal && <Text style={[styles.identityGoal, { color: theme.textSecondary }]}>{goalLabels[userGoal] || userGoal}</Text>}
              {activeSplit && <Text style={[styles.identitySplit, { color: theme.textTertiary }]}>{activeSplit.name || 'Custom Split'}</Text>}
            </View>
          </View>

          {/* Why */}
          <TouchableOpacity
            style={[styles.whyBox, { borderTopColor: theme.bgCardBorder }]}
            onPress={() => navigation.navigate('EditWhy', { current: userWhy })}
            activeOpacity={0.8}
          >
            {userWhy ? (
              <>
                <Text style={[styles.whyLabel, { color: theme.accent }]}>MY WHY</Text>
                <Text style={[styles.whyText, { color: theme.textSecondary }]}>{userWhy}</Text>
                <Text style={[styles.whyEdit, { color: theme.textTertiary }]}>Tap to edit</Text>
              </>
            ) : (
              <View>
                <Text style={[styles.whyEmptyTitle, { color: theme.text }]}>Add your why.</Text>
                <Text style={[styles.whyEmptySub, { color: theme.textTertiary }]}>What keeps you showing up? This is just for you.</Text>
              </View>
            )}
          </TouchableOpacity>
        </LinearGradient>

        {/* Stats */}
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
            <Text style={[styles.streakSub, { color: theme.textTertiary }]}>Tap to view</Text>
          </View>
          <Text style={[styles.chevron, { color: theme.accent }]}>›</Text>
        </TouchableOpacity>

        {/* Awards */}
        <Text style={[styles.sectionLabel, { color: theme.textTertiary }]}>
          AWARDS · {unlockedAwards.length}/{AWARDS.length}
        </Text>

        {/* Unlocked */}
        {unlockedAwards.length > 0 && (
          <View style={styles.awardsGrid}>
            {unlockedAwards.map(award => (
              <View key={award.id} style={[styles.awardCard, { backgroundColor: 'rgba(123,44,191,0.15)', borderColor: 'rgba(157,78,221,0.4)' }]}>
                <View style={[styles.awardIcon, { backgroundColor: theme.accent }]}>
                  <Text style={styles.awardIconText}>{award.icon}</Text>
                </View>
                <Text style={[styles.awardTitle, { color: theme.text }]}>{award.title}</Text>
                <Text style={[styles.awardDesc, { color: theme.textTertiary }]}>{award.desc}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Locked */}
        {lockedAwards.length > 0 && (
          <>
            <Text style={[styles.sectionLabel, { color: theme.textTertiary, marginTop: 16 }]}>LOCKED</Text>
            <View style={styles.awardsGrid}>
              {lockedAwards.map(award => (
                <View key={award.id} style={[styles.awardCard, { backgroundColor: theme.bgCard, borderColor: theme.bgCardBorder, opacity: 0.5 }]}>
                  <View style={[styles.awardIcon, { backgroundColor: theme.bgCardBorder }]}>
                    <Text style={[styles.awardIconText, { color: theme.textTertiary }]}>?</Text>
                  </View>
                  <Text style={[styles.awardTitle, { color: theme.textSecondary }]}>{award.title}</Text>
                  <Text style={[styles.awardDesc, { color: theme.textTertiary }]}>{award.desc}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        <View style={{ height: 60 }} />
      </Animated.ScrollView>
    </View>
  );
}

const getStyles = (theme) => ({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 24, paddingTop: 64 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  pageTitle: { fontSize: 38, fontWeight: '900', letterSpacing: -1 },
  gearBtn: { fontSize: 22 },
  identityCard: { borderRadius: 24, borderWidth: 1, marginBottom: 24, overflow: 'hidden' },
  identityTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 16, padding: 24 },
  avatar: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  avatarText: { fontSize: 30, fontWeight: '900', color: '#ffffff' },
  avatarHint: { fontSize: 9, fontWeight: '500', textAlign: 'center', letterSpacing: 0.5 },
  identityInfo: { flex: 1, paddingTop: 4 },
  identityName: { fontSize: 24, fontWeight: '900', letterSpacing: -0.5, marginBottom: 6 },
  sportBadge: { backgroundColor: 'rgba(157,78,221,0.2)', borderRadius: 100, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start', marginBottom: 6 },
  sportBadgeText: { fontSize: 11, fontWeight: '700', color: '#9d4edd', letterSpacing: 0.5 },
  identityGoal: { fontSize: 13, fontWeight: '500', marginBottom: 2 },
  identitySplit: { fontSize: 11, fontWeight: '400' },
  whyBox: { borderTopWidth: 1, padding: 20 },
  whyLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 2, marginBottom: 6 },
  whyText: { fontSize: 14, fontWeight: '400', lineHeight: 22, fontStyle: 'italic', marginBottom: 6 },
  whyEdit: { fontSize: 10, fontWeight: '500' },
  whyEmptyTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  whyEmptySub: { fontSize: 13, fontWeight: '400', lineHeight: 18 },
  sectionLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 3, marginBottom: 10, marginTop: 8 },
  statsGrid: { flexDirection: 'row', borderRadius: 16, borderWidth: 1, marginBottom: 12 },
  statItem: { flex: 1, paddingVertical: 18, alignItems: 'center' },
  statVal: { fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  statLbl: { fontSize: 8, fontWeight: '700', letterSpacing: 2, marginTop: 3 },
  streakRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: 16, borderWidth: 1, padding: 18, marginBottom: 24 },
  streakNum: { fontSize: 17, fontWeight: '800', marginBottom: 2 },
  streakSub: { fontSize: 11 },
  chevron: { fontSize: 20 },
  awardsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  awardCard: { width: '47%', borderRadius: 16, borderWidth: 1, padding: 14 },
  awardIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  awardIconText: { fontSize: 12, fontWeight: '900', color: '#ffffff' },
  awardTitle: { fontSize: 13, fontWeight: '700', marginBottom: 3 },
  awardDesc: { fontSize: 11, fontWeight: '400', lineHeight: 15 },
});
