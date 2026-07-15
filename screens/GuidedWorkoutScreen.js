import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Logo from '../components/Logo';
import { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { useSettings } from '../context/SettingsContext';
import * as Haptics from 'expo-haptics';

const API_URL = 'https://lurl0xn2b7.execute-api.us-east-1.amazonaws.com/log-set';

export default function GuidedWorkoutScreen({ navigation, route }) {
  const { workout } = route.params;
  const theme = useTheme();
  const styles = getStyles(theme);
  const { sessionSets, clearSession } = useSettings();

  const [currentIdx, setCurrentIdx] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [loggedPerExercise, setLoggedPerExercise] = useState({});

  // When returning from Revolver, update logged sets display
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      const routes = navigation.getState()?.routes;
      const prevRoute = routes?.[routes.length - 2];
      if (prevRoute?.name === 'PR' || prevRoute?.name === 'Revolver') {
        // Update logged sets from sessionSets
        const map = {};
        sessionSets.forEach(set => {
          if (!map[set.exercise]) map[set.exercise] = [];
          map[set.exercise].push(set);
        });
        setLoggedPerExercise(map);
      }
    });
    return unsubscribe;
  }, [navigation, sessionSets]);
  const timerRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const currentExercise = workout.exercises[currentIdx];
  const isLast = currentIdx === workout.exercises.length - 1;
  const loggedSets = loggedPerExercise[currentExercise?.name] || [];

  useEffect(() => {
    timerRef.current = setInterval(() => setElapsedTime(t => t + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const goToExercise = (idx) => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      setCurrentIdx(idx);
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const logSet = () => {
    // Navigate to Revolver for this exercise
    navigation.navigate('Revolver', {
      exercise: currentExercise.name,
      split: workout.name,
      guidedMode: true,
      guidedWorkout: workout,
      guidedIdx: currentIdx,
    });
  };

  const nextExercise = () => {
    if (!isLast) {
      goToExercise(currentIdx + 1);
    } else {
      finishWorkout();
    }
  };

  const finishWorkout = () => {
    clearSession();
    navigation.navigate('Summary', {
      sets: sessionSets,
      split: workout.name,
      duration: elapsedTime,
    });
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <LinearGradient colors={theme.gradientBg} style={StyleSheet.absoluteFillObject} />
      <View style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.back}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.timer}>{formatTime(elapsedTime)}</Text>
          <Logo size={36} onPress={() => navigation.navigate('HomeTab')} />
        </View>

        {/* Workout name + progress */}
        <Text style={[styles.workoutName, { color: theme.textTertiary }]}>{workout.name}</Text>
        <View style={styles.progressBar}>
          {workout.exercises.map((_, i) => (
            <View
              key={i}
              style={[styles.progressSeg, {
                backgroundColor: i < currentIdx ? theme.accent : i === currentIdx ? theme.accent : theme.bgCardBorder,
                opacity: i === currentIdx ? 1 : i < currentIdx ? 0.6 : 0.2,
              }]}
            />
          ))}
        </View>

        {/* Current exercise */}
        <Animated.View style={[styles.exerciseBlock, { opacity: fadeAnim }]}>
          <Text style={[styles.exerciseCounter, { color: theme.accent }]}>
            EXERCISE {currentIdx + 1} OF {workout.exercises.length}
          </Text>
          <Text style={[styles.exerciseName, { color: theme.text }]}>{currentExercise?.name}</Text>

          {/* Logged sets for this exercise */}
          {loggedSets.length > 0 && (
            <View style={[styles.loggedSets, { backgroundColor: theme.bgCard, borderColor: theme.bgCardBorder }]}>
              <Text style={[styles.loggedSetsTitle, { color: theme.textTertiary }]}>LOGGED</Text>
              {loggedSets.map((set, i) => (
                <Text key={i} style={[styles.loggedSet, { color: theme.textSecondary }]}>
                  Set {i + 1}: {set.weight} {set.unit} × {set.reps}
                </Text>
              ))}
            </View>
          )}
        </Animated.View>

        {/* Exercise list - mini navigator */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.exNav}
          contentContainerStyle={styles.exNavContent}
        >
          {workout.exercises.map((ex, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.exNavItem, {
                backgroundColor: i === currentIdx ? theme.accent : theme.bgCard,
                borderColor: i === currentIdx ? theme.accent : theme.bgCardBorder,
              }]}
              onPress={() => goToExercise(i)}
            >
              <Text style={[styles.exNavText, { color: i === currentIdx ? '#fff' : theme.textSecondary }]}>
                {ex.name.split(' ')[0]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={{ flex: 1 }} />

        {/* Actions */}
        <TouchableOpacity style={styles.logBtn} onPress={logSet} activeOpacity={0.9}>
          <LinearGradient colors={theme.gradientBtn} style={styles.logBtnGradient}>
            <Text style={[styles.logBtnText, { color: theme.btnText }]}>LOG SET</Text>
            <Text style={[styles.logBtnSub, { color: theme.btnText, opacity: 0.6 }]}>{currentExercise?.name}</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.nextBtn} onPress={nextExercise} activeOpacity={0.8}>
          <Text style={[styles.nextBtnText, { color: theme.textSecondary }]}>
            {isLast ? 'Finish Workout' : `Next → ${workout.exercises[currentIdx + 1]?.name}`}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.finishBtn} onPress={finishWorkout}>
          <Text style={[styles.finishBtnText, { color: theme.textTertiary }]}>Finish Workout Early</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}

const getStyles = (theme) => ({
  root: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 28, paddingTop: 64, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  back: { color: theme.textSecondary, fontSize: 15, fontWeight: '600' },
  timer: { fontSize: 14, fontWeight: '700', color: 'rgba(157,78,221,0.7)', letterSpacing: 1 },
  workoutName: { fontSize: 11, fontWeight: '700', letterSpacing: 3, marginBottom: 12 },
  progressBar: { flexDirection: 'row', gap: 4, marginBottom: 28 },
  progressSeg: { flex: 1, height: 3, borderRadius: 2 },
  exerciseBlock: { flex: 1 },
  exerciseCounter: { fontSize: 10, fontWeight: '700', letterSpacing: 3, marginBottom: 8 },
  exerciseName: { fontSize: 32, fontWeight: '900', letterSpacing: -0.5, marginBottom: 20 },
  loggedSets: { borderRadius: 14, borderWidth: 1, padding: 14 },
  loggedSetsTitle: { fontSize: 9, fontWeight: '700', letterSpacing: 2, marginBottom: 8 },
  loggedSet: { fontSize: 13, fontWeight: '500', marginBottom: 4 },
  exNav: { marginBottom: 20, flexGrow: 0 },
  exNavContent: { gap: 8, paddingVertical: 4 },
  exNavItem: { borderRadius: 100, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 8 },
  exNavText: { fontSize: 12, fontWeight: '600' },
  logBtn: { marginBottom: 10 },
  logBtnGradient: { paddingVertical: 22, borderRadius: 18, alignItems: 'center' },
  logBtnText: { fontSize: 15, fontWeight: '800', letterSpacing: 3, marginBottom: 3 },
  logBtnSub: { fontSize: 11, fontWeight: '400' },
  nextBtn: { paddingVertical: 14, alignItems: 'center' },
  nextBtnText: { fontSize: 14, fontWeight: '600' },
  finishBtn: { paddingVertical: 8, alignItems: 'center' },
  finishBtnText: { fontSize: 12, fontWeight: '500' },
});
