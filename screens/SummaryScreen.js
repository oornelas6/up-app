import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export default function SummaryScreen({ navigation, route }) {
  const { sets = [], split = 'Workout', duration = 0 } = route.params || {};

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  const [displaySets, setDisplaySets] = useState(0);
  const [displayVolume, setDisplayVolume] = useState(0);
  const [displayReps, setDisplayReps] = useState(0);

  const totalSets = sets.length;
  const totalReps = sets.reduce((sum, s) => sum + (parseInt(s.reps) || 0), 0);
  const totalVolume = sets.reduce((sum, s) =>
    sum + ((parseFloat(s.weight) || 0) * (parseInt(s.reps) || 0)), 0);
  const prs = sets.filter(s => s.isPR).length;
  const uniqueExercises = [...new Set(sets.map(s => s.exercise))];

  const formatDuration = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return s > 0 ? `${m}m ${s}s` : `${m}m`;
  };

  const getMotivationalMessage = () => {
    if (prs > 0) return `${prs} new PR${prs > 1 ? 's' : ''}. The work is compounding.`;
    if (totalSets >= 15) return 'High volume session. Recovery is part of the process.';
    if (totalSets >= 8) return 'Solid work. Consistency is the strategy.';
    return 'Every session counts. Same time tomorrow.';
  };

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
    ]).start();

    // Count up animations
    const duration_ms = 1200;
    const steps = 30;
    const interval = duration_ms / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      setDisplaySets(Math.round(totalSets * progress));
      setDisplayVolume(Math.round(totalVolume * progress));
      setDisplayReps(Math.round(totalReps * progress));
      if (step >= steps) clearInterval(timer);
    }, interval);

    return () => clearInterval(timer);
  }, []);

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#1a0035', '#0a000f']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Background glow */}
      <View style={styles.glow} />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.completedLabel}>WORKOUT COMPLETE</Text>
            <Animated.Text style={[styles.splitTitle, { transform: [{ scale: scaleAnim }] }]}>
              {split}
            </Animated.Text>
            {duration > 0 && (
              <Text style={styles.duration}>{formatDuration(duration)}</Text>
            )}
          </View>

          {/* PR Banner */}
          {prs > 0 && (
            <View style={styles.prBanner}>
              <LinearGradient
                colors={['rgba(240,165,0,0.2)', 'rgba(240,165,0,0.05)']}
                style={styles.prBannerGradient}
              >
                <Text style={styles.prBannerText}>
                  🏆 {prs} NEW PERSONAL RECORD{prs > 1 ? 'S' : ''}
                </Text>
              </LinearGradient>
            </View>
          )}

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>{displaySets}</Text>
              <Text style={styles.statLbl}>SETS</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>{displayReps}</Text>
              <Text style={styles.statLbl}>REPS</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>{Math.round(displayVolume / 1000 * 10) / 10}k</Text>
              <Text style={styles.statLbl}>VOLUME</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>{uniqueExercises.length}</Text>
              <Text style={styles.statLbl}>EXERCISES</Text>
            </View>
          </View>

          {/* Exercise Breakdown */}
          {uniqueExercises.length > 0 && (
            <>
              <Text style={styles.sectionLabel}>EXERCISES</Text>
              {uniqueExercises.map((exercise, i) => {
                const exSets = sets.filter(s => s.exercise === exercise);
                const bestSet = exSets.reduce((best, s) =>
                  (parseFloat(s.weight) > parseFloat(best.weight)) ? s : best, exSets[0]);
                const hasPR = exSets.some(s => s.isPR);
                return (
                  <View key={i} style={[styles.exerciseRow, hasPR && styles.exerciseRowPR]}>
                    <View style={styles.exerciseLeft}>
                      <Text style={styles.exerciseName}>{exercise}</Text>
                      <Text style={styles.exerciseMeta}>
                        {exSets.length} sets · Best: {bestSet?.weight} {bestSet?.unit || 'lbs'} × {bestSet?.reps} reps
                      </Text>
                    </View>
                    {hasPR && (
                      <View style={styles.prBadge}>
                        <Text style={styles.prBadgeText}>PR</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </>
          )}

          {/* Motivational message */}
          <View style={styles.msgBox}>
            <Text style={styles.msgText}>{getMotivationalMessage()}</Text>
          </View>

        </Animated.View>

        {/* Done button */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate('Home')}
        >
          <LinearGradient
            colors={['#7b2cbf', '#4a0080']}
            style={styles.doneBtn}
          >
            <Text style={styles.doneBtnText}>DONE</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a000f' },
  glow: {
    position: 'absolute',
    width: 300, height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(123,44,191,0.15)',
    top: -50, alignSelf: 'center',
  },
  container: { paddingHorizontal: 28, paddingTop: 80, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 32 },
  completedLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 4, color: '#9d4edd', marginBottom: 12 },
  splitTitle: { fontSize: 48, fontWeight: '900', color: '#ffffff', letterSpacing: -1, textAlign: 'center', marginBottom: 8 },
  duration: { fontSize: 14, color: 'rgba(255,255,255,0.3)', fontWeight: '500', letterSpacing: 1 },
  prBanner: { marginBottom: 24, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(240,165,0,0.3)' },
  prBannerGradient: { paddingVertical: 14, alignItems: 'center' },
  prBannerText: { fontSize: 13, fontWeight: '800', color: '#f0a500', letterSpacing: 2 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 32 },
  statBox: { flex: 1, minWidth: '45%', backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderRadius: 20, paddingVertical: 24, alignItems: 'center' },
  statVal: { fontSize: 40, fontWeight: '900', color: '#ffffff', letterSpacing: -1 },
  statLbl: { fontSize: 10, color: 'rgba(255,255,255,0.25)', fontWeight: '700', letterSpacing: 2, marginTop: 4 },
  sectionLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 3, color: 'rgba(255,255,255,0.25)', marginBottom: 12 },
  exerciseRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: 16, marginBottom: 8 },
  exerciseRowPR: { borderColor: 'rgba(240,165,0,0.3)', backgroundColor: 'rgba(240,165,0,0.05)' },
  exerciseLeft: { flex: 1 },
  exerciseName: { fontSize: 15, fontWeight: '700', color: '#ffffff', marginBottom: 3 },
  exerciseMeta: { fontSize: 12, color: 'rgba(255,255,255,0.25)', fontWeight: '400' },
  prBadge: { backgroundColor: 'rgba(240,165,0,0.15)', borderWidth: 1, borderColor: 'rgba(240,165,0,0.4)', borderRadius: 100, paddingHorizontal: 10, paddingVertical: 4 },
  prBadgeText: { fontSize: 11, fontWeight: '800', color: '#f0a500', letterSpacing: 1 },
  msgBox: { backgroundColor: 'rgba(123,44,191,0.08)', borderWidth: 1, borderColor: 'rgba(157,78,221,0.15)', borderRadius: 16, padding: 20, marginTop: 8, marginBottom: 32 },
  msgText: { fontSize: 15, color: 'rgba(255,255,255,0.4)', textAlign: 'center', lineHeight: 24, fontWeight: '400', fontStyle: 'italic' },
  doneBtn: { paddingVertical: 22, borderRadius: 18, alignItems: 'center' },
  doneBtnText: { color: 'white', fontSize: 15, fontWeight: '800', letterSpacing: 3 },
});