import { StyleSheet, Text, View, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const StreakIcon = () => (
  <Svg width="12" height="12" viewBox="0 0 14 14">
    <Path d="M7 1 L8.5 5.5 L13 5.5 L9.5 8.5 L11 13 L7 10 L3 13 L4.5 8.5 L1 5.5 L5.5 5.5 Z" fill="#9d4edd" />
  </Svg>
);

export default function HomeScreen({ navigation }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const blob1Y = useRef(new Animated.Value(0)).current;
  const blob2Y = useRef(new Animated.Value(0)).current;
  const blob3Y = useRef(new Animated.Value(0)).current;
  const blob1X = useRef(new Animated.Value(0)).current;
  const blob2X = useRef(new Animated.Value(0)).current;
  const [lastSession, setLastSession] = useState(null);
  const [stats, setStats] = useState({ streak: 0, sessions: 0, prs: 0 });

  useEffect(() => {
    fetchHomeData();
    Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }).start();
    Animated.loop(Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.02, duration: 1800, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 1800, useNativeDriver: true }),
    ])).start();
    Animated.loop(Animated.sequence([
      Animated.timing(blob1Y, { toValue: -30, duration: 7000, useNativeDriver: true }),
      Animated.timing(blob1Y, { toValue: 20, duration: 7000, useNativeDriver: true }),
    ])).start();
    Animated.loop(Animated.sequence([
      Animated.timing(blob1X, { toValue: 20, duration: 9000, useNativeDriver: true }),
      Animated.timing(blob1X, { toValue: -20, duration: 9000, useNativeDriver: true }),
    ])).start();
    Animated.loop(Animated.sequence([
      Animated.timing(blob2Y, { toValue: 40, duration: 10000, useNativeDriver: true }),
      Animated.timing(blob2Y, { toValue: -20, duration: 10000, useNativeDriver: true }),
    ])).start();
    Animated.loop(Animated.sequence([
      Animated.timing(blob2X, { toValue: -30, duration: 8000, useNativeDriver: true }),
      Animated.timing(blob2X, { toValue: 15, duration: 8000, useNativeDriver: true }),
    ])).start();
    Animated.loop(Animated.sequence([
      Animated.timing(blob3Y, { toValue: -25, duration: 11000, useNativeDriver: true }),
      Animated.timing(blob3Y, { toValue: 35, duration: 11000, useNativeDriver: true }),
    ])).start();
  }, []);

  const fetchHomeData = async () => {
    try {
      const response = await fetch(
        'https://lurl0xn2b7.execute-api.us-east-1.amazonaws.com/history?userId=user-test-001'
      );
      const data = await response.json();
      const sets = data.sets || [];

      if (sets.length > 0) {
        const lastSet = sets[0];
        const lastDate = lastSet.timestamp?.split('T')[0];
        const sessionSets = sets.filter(s => s.timestamp?.split('T')[0] === lastDate);
        const uniqueExercises = [...new Set(sessionSets.map(s => s.exercise))];

        setLastSession({
          split: lastSet.split || 'Workout',
          date: lastDate,
          exercises: uniqueExercises.length,
          sets: sessionSets.length,
        });

        const uniqueDates = [...new Set(sets.map(s => s.timestamp?.split('T')[0]))];
        setStats({
          streak: uniqueDates.length,
          sessions: sets.length,
        prs: sets.filter(s => s.isPR === true || s.isPR === 'true').length,
        });
      }
    } catch (err) {
      console.error('Failed to fetch home data:', err);
    }
  };

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.blob, {
        width: 320, height: 320, borderRadius: 160,
        backgroundColor: 'rgba(60, 0, 100, 0.5)',
        top: -80, left: -60,
        transform: [{ translateY: blob1Y }, { translateX: blob1X }]
      }]} />
      <Animated.View style={[styles.blob, {
        width: 260, height: 260, borderRadius: 130,
        backgroundColor: 'rgba(40, 0, 80, 0.45)',
        bottom: 200, right: -70,
        transform: [{ translateY: blob2Y }, { translateX: blob2X }]
      }]} />
      <Animated.View style={[styles.blob, {
        width: 180, height: 180, borderRadius: 90,
        backgroundColor: 'rgba(80, 10, 120, 0.3)',
        top: height * 0.4, left: width * 0.25,
        transform: [{ translateY: blob3Y }]
      }]} />

      <LinearGradient
        colors={['rgba(8,0,16,0.55)', 'rgba(8,0,16,0.2)', 'rgba(8,0,16,0.65)', 'rgba(8,0,16,1)']}
        locations={[0, 0.3, 0.65, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <View style={styles.header}>
        <Text style={styles.logo}>UP</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.settingsBtn}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={styles.settingsBtnText}>⚙</Text>
          </TouchableOpacity>
          <View style={styles.streakBadge}>
            <StreakIcon />
            <Text style={styles.streakText}>{stats.streak} day streak</Text>
          </View>
        </View>
      </View>

        <View style={styles.greeting}>
          <Text style={styles.greetingSub}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase()}
          </Text>
          <Text style={styles.greetingMain}>Let's get{'\n'}after it.</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.lastSession}>
          <Text style={styles.lastSessionLabel}>LAST SESSION</Text>
          {lastSession ? (
            <>
              <View style={styles.lastSessionRow}>
                <Text style={styles.lastSessionName}>{lastSession.split}</Text>
                <Text style={styles.lastSessionTime}>{lastSession.sets} sets</Text>
              </View>
              <View style={styles.prRow}>
                <View style={styles.prBadge}>
                  <Text style={styles.prBadgeText}>{lastSession.exercises} exercises</Text>
                </View>
                <Text style={styles.lastSessionMeta}>{lastSession.date}</Text>
              </View>
            </>
          ) : (
            <Text style={styles.lastSessionName}>No sessions yet</Text>
          )}
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.streak}</Text>
            <Text style={styles.statLabel}>days</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.sessions}</Text>
            <Text style={styles.statLabel}>total sets</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.prs}</Text>
            <Text style={styles.statLabel}>total PRs</Text>
          </View>
        </View>

        <View style={{ flex: 1 }} />

        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('Split')}>
            <LinearGradient
              colors={['#7b2cbf', '#4a0080']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.startBtn}
            >
              <Text style={styles.startBtnText}>START WORKOUT</Text>
              <Text style={styles.startBtnSub}>
                {lastSession ? `Last: ${lastSession.split}` : 'Begin your first session'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        <TouchableOpacity style={styles.historyBtn} activeOpacity={0.7} onPress={() => navigation.navigate('History')}>
          <Text style={styles.historyBtnText}>View History</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#080010', overflow: 'hidden' },
  blob: { position: 'absolute' },
  container: { flex: 1, paddingHorizontal: 28, paddingTop: 64, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 52 },
  logo: { fontSize: 26, fontWeight: '900', color: '#ffffff', letterSpacing: 4 },
  streakBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(157,78,221,0.08)', borderWidth: 1, borderColor: 'rgba(157,78,221,0.2)', borderRadius: 100, paddingHorizontal: 14, paddingVertical: 8, gap: 6 },
  streakText: { color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: '600', letterSpacing: 0.5 },
  greeting: { marginBottom: 40 },
  greetingSub: { fontSize: 12, fontWeight: '500', color: 'rgba(255,255,255,0.3)', marginBottom: 12, letterSpacing: 2, textTransform: 'uppercase' },
  greetingMain: { fontSize: 46, fontWeight: '800', color: '#ffffff', lineHeight: 52, letterSpacing: -1 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginBottom: 32 },
  lastSession: { marginBottom: 32 },
  lastSessionLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 3, color: 'rgba(255,255,255,0.25)', marginBottom: 12 },
  lastSessionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 },
  lastSessionName: { fontSize: 22, fontWeight: '700', color: '#ffffff' },
  lastSessionTime: { fontSize: 14, fontWeight: '400', color: 'rgba(255,255,255,0.35)' },
  prRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  prBadge: { backgroundColor: 'rgba(157,78,221,0.12)', borderWidth: 1, borderColor: 'rgba(157,78,221,0.25)', borderRadius: 100, paddingHorizontal: 10, paddingVertical: 4 },
  prBadgeText: { fontSize: 11, fontWeight: '600', color: '#9d4edd', letterSpacing: 0.5 },
  lastSessionMeta: { fontSize: 12, color: 'rgba(255,255,255,0.25)' },
  statsRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', borderRadius: 20, paddingVertical: 22, paddingHorizontal: 8 },
  statItem: { flex: 1, alignItems: 'center' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  settingsBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' },
  settingsBtnText: { fontSize: 16 },
  statDivider: { width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.06)' },
  statValue: { fontSize: 24, fontWeight: '700', color: '#ffffff', marginBottom: 3, letterSpacing: -0.5 },
  statLabel: { fontSize: 11, fontWeight: '400', color: 'rgba(255,255,255,0.25)', letterSpacing: 0.5 },
  startBtn: { width: '100%', paddingVertical: 22, borderRadius: 18, alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: 'rgba(157,78,221,0.2)' },
  startBtnText: { color: 'white', fontSize: 15, fontWeight: '800', letterSpacing: 3, marginBottom: 4 },
  startBtnSub: { color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: '400', letterSpacing: 0.5 },
  historyBtn: { width: '100%', paddingVertical: 16, alignItems: 'center' },
  historyBtnText: { color: 'rgba(255,255,255,0.2)', fontSize: 13, fontWeight: '500', letterSpacing: 1 },
});