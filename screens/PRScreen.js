import { StyleSheet, Text, View, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useEffect, useRef } from 'react';
import * as Haptics from 'expo-haptics';
import { useSettings } from '../context/SettingsContext';


const MESSAGES = [
  { title: "Set locked in.", sub: "Every rep is a deposit into your future self." },
  { title: "Volume up.", sub: "Progressive overload is working. Trust the process." },
  { title: "One more down.", sub: "You're closer than you were 60 seconds ago." },
  { title: "That's the work.", sub: "Consistency builds the physique. Keep going." },
  { title: "Noted.", sub: "Your body is adapting. Show up again tomorrow." },
];

const REST_TIMES = {
  default: 90,
  heavy: 180,    // squats, deadlifts, bench
  moderate: 120, // most exercises
  light: 60,     // isolation movements
};

export default function PRScreen({ navigation, route }) {
  const { exercise, weight, reps, setNum, split, isPR } = route.params;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { restTimer } = useSettings();
  const [timeLeft, setTimeLeft] = useState(restTimer || 90);
  const [timerDone, setTimerDone] = useState(false);
  const timerRef = useRef(null);
  

  const msg = MESSAGES[(setNum - 1) % MESSAGES.length];

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 6, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();

    // Start rest timer
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setTimerDone(true);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          return 0;
        }
        if (t === 10) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, []);

  const skipTimer = () => {
    clearInterval(timerRef.current);
    setTimerDone(true);
    setTimeLeft(0);
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

const progress = timeLeft / (restTimer || 90);

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['rgba(40,0,80,0.8)', 'rgba(8,0,16,1)']}
        style={StyleSheet.absoluteFillObject}
      />
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>

        {/* Badge */}
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

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>{weight}</Text>
            <Text style={styles.statLbl}>lbs</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statVal}>{reps}</Text>
            <Text style={styles.statLbl}>reps</Text>
          </View>
        </View>

        {/* Message */}
        <View style={styles.msgContainer}>
          {isPR ? (
            <>
              <Text style={styles.prTitle}>New personal{'\n'}record.</Text>
              <Text style={styles.msgSub}>
                {weight} lbs × {reps} reps on {exercise}.{'\n'}
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
            <TouchableOpacity
              style={styles.adjustBtn}
              onPress={() => setTimeLeft(t => Math.max(t - 15, 0))}
            >
              <Text style={styles.adjustBtnText}>−15</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.adjustBtn}
              onPress={() => setTimeLeft(t => t + 15)}
            >
              <Text style={styles.adjustBtnText}>+15</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={skipTimer}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          </View>
        </View>

          {/* Progress bar */}
          <View style={styles.progressBar}>
            <Animated.View style={[styles.progressFill, {
              width: `${progress * 100}%`,
              backgroundColor: timerDone ? '#4caf50' : timeLeft <= 10 ? '#f0a500' : '#7b2cbf',
            }]} />
          </View>

          <Text style={[styles.timerCount, {
            color: timerDone ? '#4caf50' : timeLeft <= 10 ? '#f0a500' : '#ffffff'
          }]}>
            {timerDone ? "REST DONE" : formatTime(timeLeft)}
          </Text>
        </View>

        {/* Actions */}
        <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.goBack()}>
          <LinearGradient
            colors={timerDone ? ['#4caf50', '#2e7d32'] : ['#7b2cbf', '#4a0080']}
            style={styles.continueBtn}
          >
            <Text style={styles.continueBtnText}>
              {timerDone ? "LET'S GO" : "NEXT SET"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.doneBtn}
          onPress={() => navigation.navigate('Workout', { 
            split,
            lastLoggedExercise: exercise,
          })}
        >
          <Text style={styles.doneBtnText}>Back to Exercises</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.finishBtn}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.finishBtnText}>Finish Workout</Text>
        </TouchableOpacity>

      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#080010' },
  container: { flex: 1, paddingHorizontal: 28, paddingTop: 80, paddingBottom: 40, alignItems: 'center' },
  badge: { marginBottom: 28 },
  badgeInner: { paddingHorizontal: 28, paddingVertical: 14, borderRadius: 100 },
  badgeText: { color: 'white', fontSize: 12, fontWeight: '800', letterSpacing: 3 },
  statsRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(157,78,221,0.2)', borderRadius: 24, paddingVertical: 24, paddingHorizontal: 40, gap: 40, marginBottom: 28, width: '100%', justifyContent: 'center' },
  statBox: { alignItems: 'center' },
  statVal: { fontSize: 42, fontWeight: '900', color: '#ffffff', letterSpacing: -1 },
  statLbl: { fontSize: 12, color: 'rgba(255,255,255,0.3)', fontWeight: '500', letterSpacing: 1, marginTop: 4 },
  statDivider: { width: 1, height: 50, backgroundColor: 'rgba(255,255,255,0.08)' },
  msgContainer: { alignItems: 'center', paddingHorizontal: 20, width: '100%' },
  msgTitle: { fontSize: 24, fontWeight: '800', color: '#ffffff', letterSpacing: -0.5, textAlign: 'center', marginBottom: 8 },
  msgSub: { fontSize: 13, color: 'rgba(255,255,255,0.3)', textAlign: 'center', lineHeight: 20, fontWeight: '400' },
  prTitle: { fontSize: 32, fontWeight: '900', color: '#f0a500', letterSpacing: -1, textAlign: 'center', marginBottom: 10, lineHeight: 38 },
  timerContainer: { width: '100%', marginBottom: 20 },
  timerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  timerLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 3, color: 'rgba(255,255,255,0.25)' },
  skipText: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.25)' },
  progressBar: { height: 3, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 2, marginBottom: 10, overflow: 'hidden', width: '100%' },
  progressFill: { height: '100%', borderRadius: 2 },
  timerCount: { fontSize: 32, fontWeight: '900', letterSpacing: -1, textAlign: 'center' },
  continueBtn: { width: '100%', paddingVertical: 22, borderRadius: 18, alignItems: 'center', marginBottom: 12 },
  continueBtnText: { color: 'white', fontSize: 15, fontWeight: '800', letterSpacing: 3 },
  doneBtn: { paddingVertical: 14, alignItems: 'center' },
  doneBtnText: { color: 'rgba(255,255,255,0.3)', fontSize: 14, fontWeight: '500' },
  finishBtn: { paddingVertical: 10, alignItems: 'center' },
  finishBtnText: { color: 'rgba(255,255,255,0.15)', fontSize: 13, fontWeight: '500', letterSpacing: 0.5 },
  timerAdjust: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  adjustBtn: { backgroundColor: 'rgba(157,78,221,0.15)', borderWidth: 1, borderColor: 'rgba(157,78,221,0.2)', borderRadius: 100, paddingHorizontal: 10, paddingVertical: 4 },
  adjustBtnText: { color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: '700' },
});
