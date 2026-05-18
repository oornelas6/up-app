import { StyleSheet, Text, View, TouchableOpacity, Animated, AppState } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Logo from '../components/Logo';
import { useTheme } from '../context/ThemeContext';
import { useState, useEffect, useRef } from 'react';
import * as Haptics from 'expo-haptics';
import { useSettings } from '../context/SettingsContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MESSAGES = [
  { title: "Set locked in.", sub: "Every rep is a deposit into your future self." },
  { title: "Volume up.", sub: "Progressive overload is working. Trust the process." },
  { title: "One more down.", sub: "You're closer than you were 60 seconds ago." },
  { title: "That's the work.", sub: "Consistency builds the physique. Keep going." },
  { title: "Noted.", sub: "Your body is adapting. Show up again tomorrow." },
];

export default function PRScreen({ navigation, route }) {
  const { exercise, weight, reps, setNum, split, isPR } = route.params;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { restTimer, addSetToSession } = useSettings();
  const theme = useTheme();
  const styles = getStyles(theme);

  const duration = restTimer || 90;
  const endTimeRef = useRef(Date.now() + duration * 1000);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [timerDone, setTimerDone] = useState(false);
  const timerRef = useRef(null);
  const appStateRef = useRef(AppState.currentState);

  const msg = MESSAGES[(setNum - 1) % MESSAGES.length];

  const tick = () => {
    const remaining = Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000));
    setTimeLeft(remaining);
    if (remaining <= 0) {
      clearInterval(timerRef.current);
      setTimerDone(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else if (remaining === 10) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 6, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();

    addSetToSession({ exercise, weight, reps, unit: route.params.unit || 'lbs', isPR });

    // Start timer
    endTimeRef.current = Date.now() + duration * 1000;
    timerRef.current = setInterval(tick, 500);

    // When app comes back from background, recalculate from end time
    const sub = AppState.addEventListener('change', nextState => {
      if (appStateRef.current.match(/inactive|background/) && nextState === 'active') {
        tick(); // immediate recalc on resume
      }
      appStateRef.current = nextState;
    });

    return () => {
      clearInterval(timerRef.current);
      sub.remove();
    };
  }, []);

  const skipTimer = () => {
    clearInterval(timerRef.current);
    setTimerDone(true);
    setTimeLeft(0);
  };

  const adjustTimer = (delta) => {
    endTimeRef.current = endTimeRef.current + delta * 1000;
    setTimeLeft(t => Math.max(0, t + delta));
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const progress = timeLeft / duration;

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <LinearGradient colors={theme.gradientBg} style={StyleSheet.absoluteFillObject} />
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>

        <Animated.View style={[styles.badge, { transform: [{ scale: scaleAnim }] }]}>
          {isPR ? (
            <LinearGradient colors={['#f0a500', '#e07000']} style={styles.badgeInner}>
              <Text style={styles.badgeText}>NEW PR</Text>
            </LinearGradient>
          ) : (
            <LinearGradient colors={['#7b2cbf', '#4a0080']} style={styles.badgeInner}>
              <Text style={styles.badgeText}>SET {setNum} LOGGED</Text>
            </LinearGradient>
          )}
        </Animated.View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>{weight}</Text>
            <Text style={styles.statLbl}>{route.params.unit || 'lbs'}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statVal}>{reps}</Text>
            <Text style={styles.statLbl}>reps</Text>
          </View>
        </View>

        <View style={styles.msgContainer}>
          {isPR ? (
            <>
              <Text style={styles.prTitle}>New personal{'\n'}record.</Text>
              <Text style={styles.msgSub}>
                {weight} {route.params.unit || 'lbs'} × {reps} reps on {exercise}.{'\n'}
                That's what the work is for.
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.msgTitle}>{msg.title}</Text>
              <Text style={styles.msgSub}>{msg.sub}</Text>
            </>
          )}
        </View>

        <View style={{ flex: 1 }} />

        <View style={styles.timerContainer}>
          <View style={styles.timerHeader}>
            <Text style={styles.timerLabel}>REST</Text>
            <View style={styles.timerAdjust}>
              <TouchableOpacity style={styles.adjustBtn} onPress={() => adjustTimer(-15)}>
                <Text style={styles.adjustBtnText}>−15</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.adjustBtn} onPress={() => adjustTimer(15)}>
                <Text style={styles.adjustBtnText}>+15</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={skipTimer}>
                <Text style={styles.skipText}>Skip</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.progressBar}>
            <View style={[styles.progressFill, {
              width: `${progress * 100}%`,
              backgroundColor: timerDone ? '#4caf50' : timeLeft <= 10 ? '#f0a500' : '#7b2cbf',
            }]} />
          </View>

          <Text style={[styles.timerCount, {
            color: timerDone ? '#4caf50' : timeLeft <= 10 ? '#f0a500' : '#ffffff'
          }]}>
            {timerDone ? 'REST DONE' : formatTime(timeLeft)}
          </Text>
        </View>

        <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.goBack()}>
          <LinearGradient
            colors={timerDone ? ['#4caf50', '#2e7d32'] : ['#7b2cbf', '#4a0080']}
            style={styles.continueBtn}
          >
            <Text style={styles.continueBtnText}>
              {timerDone ? "LET'S GO" : 'NEXT SET'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.doneBtn} onPress={() => navigation.navigate('Workout', { split })}>
          <Text style={styles.doneBtnText}>Back to Exercises</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.finishBtn}
          onPress={async () => {
            try {
              const userId = await AsyncStorage.getItem('user_id') || 'user-test-001';
              const response = await fetch(
                `https://lurl0xn2b7.execute-api.us-east-1.amazonaws.com/history?userId=${userId}`
              );
              const data = await response.json();
              const allSets = data.sets || [];
              const today = new Date().toISOString().split('T')[0];
              const todaySets = allSets.filter(s => s.timestamp?.startsWith(today));
              navigation.navigate('Summary', { sets: todaySets, split, duration: 0 });
            } catch (err) {
              navigation.navigate('Summary', { sets: [], split, duration: 0 });
            }
          }}
        >
          <Text style={styles.finishBtnText}>Finish Workout</Text>
        </TouchableOpacity>

      </Animated.View>
    </View>
  );
}

const getStyles = (theme) => ({
  root: { flex: 1, backgroundColor: '#080010' },
  container: { flex: 1, paddingHorizontal: 28, paddingTop: 80, paddingBottom: 40, alignItems: 'center' },
  badge: { marginBottom: 28 },
  badgeInner: { paddingHorizontal: 28, paddingVertical: 14, borderRadius: 100 },
  badgeText: { color: theme.text, fontSize: 12, fontWeight: '800', letterSpacing: 3 },
  statsRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(157,78,221,0.2)', borderRadius: 24, paddingVertical: 24, paddingHorizontal: 40, gap: 40, marginBottom: 28, width: '100%', justifyContent: 'center' },
  statBox: { alignItems: 'center' },
  statVal: { fontSize: 42, fontWeight: '900', color: theme.text, letterSpacing: -1 },
  statLbl: { fontSize: 12, color: theme.textSecondary, fontWeight: '500', letterSpacing: 1, marginTop: 4 },
  statDivider: { width: 1, height: 50, backgroundColor: 'rgba(255,255,255,0.08)' },
  msgContainer: { alignItems: 'center', paddingHorizontal: 20, width: '100%' },
  msgTitle: { fontSize: 24, fontWeight: '800', color: theme.text, letterSpacing: -0.5, textAlign: 'center', marginBottom: 8 },
  msgSub: { fontSize: 13, color: theme.textSecondary, textAlign: 'center', lineHeight: 20, fontWeight: '400' },
  prTitle: { fontSize: 32, fontWeight: '900', color: '#f0a500', letterSpacing: -1, textAlign: 'center', marginBottom: 10, lineHeight: 38 },
  timerContainer: { width: '100%', marginBottom: 20 },
  timerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  timerLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 3, color: theme.textTertiary },
  skipText: { fontSize: 13, fontWeight: '600', color: theme.textTertiary },
  progressBar: { height: 3, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 2, marginBottom: 10, overflow: 'hidden', width: '100%' },
  progressFill: { height: '100%', borderRadius: 2 },
  timerCount: { fontSize: 32, fontWeight: '900', letterSpacing: -1, textAlign: 'center' },
  continueBtn: { width: '100%', paddingVertical: 22, borderRadius: 18, alignItems: 'center', marginBottom: 12 },
  continueBtnText: { color: theme.text, fontSize: 15, fontWeight: '800', letterSpacing: 3 },
  doneBtn: { paddingVertical: 14, alignItems: 'center' },
  doneBtnText: { color: theme.textSecondary, fontSize: 14, fontWeight: '500' },
  finishBtn: { paddingVertical: 10, alignItems: 'center' },
  finishBtnText: { color: theme.textTertiary, fontSize: 13, fontWeight: '500', letterSpacing: 0.5 },
  timerAdjust: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  adjustBtn: { backgroundColor: 'rgba(157,78,221,0.15)', borderWidth: 1, borderColor: 'rgba(157,78,221,0.2)', borderRadius: 100, paddingHorizontal: 10, paddingVertical: 4 },
  adjustBtnText: { color: theme.textSecondary, fontSize: 12, fontWeight: '700' },
});