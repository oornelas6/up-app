import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';

export default function SummaryScreen({ navigation, route }) {
  const { sets, split, duration } = route.params || { sets: [], split: 'Workout', duration: 0 };
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  const totalSets = sets.length;
  const totalReps = sets.reduce((sum, s) => sum + (parseInt(s.reps) || 0), 0);
  const totalVolume = sets.reduce((sum, s) => sum + ((parseFloat(s.weight) || 0) * (parseInt(s.reps) || 0)), 0);
  const prs = sets.filter(s => s.isPR).length;
  const uniqueExercises = [...new Set(sets.map(s => s.exercise))];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
    ]).start();
  }, []);

  const formatDuration = (seconds) => {
    const m = Math.floor(seconds / 60);
    return `${m} min`;
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['rgba(60,0,100,0.6)', 'rgba(8,0,16,1)']}
        style={StyleSheet.absoluteFillObject}
      />
      <ScrollView contentContainerStyle={styles.container}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.label}>WORKOUT COMPLETE</Text>
            <Text style={styles.title}>{split} Day</Text>
            {duration > 0 && <Text style={styles.duration}>{formatDuration(duration)}</Text>}
          </View>

          {/* Stats */}
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>{totalSets}</Text>
              <Text style={styles.statLbl}>Sets</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>{totalReps}</Text>
              <Text style={styles.statLbl}>Reps</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>{Math.round(totalVolume).toLocaleString()}</Text>
              <Text style={styles.statLbl}>Volume</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statVal, prs > 0 && { color: '#f0a500' }]}>{prs}</Text>
              <Text style={styles.statLbl}>PRs</Text>
            </View>
          </View>

          {/* Exercises */}
          <Text style={styles.sectionLabel}>EXERCISES</Text>
          {uniqueExercises.map((exercise, i) => {
            const exerciseSets = sets.filter(s => s.exercise === exercise);
            const bestSet = exerciseSets.reduce((best, s) =>
              (parseFloat(s.weight) > parseFloat(best.weight)) ? s : best, exerciseSets[0]);
            const hasPR = exerciseSets.some(s => s.isPR);
            return (
              <View key={i} style={styles.exerciseRow}>
                <View style={styles.exerciseLeft}>
                  <Text style={styles.exerciseName}>{exercise}</Text>
                  <Text style={styles.exerciseMeta}>{exerciseSets.length} sets · Best: {bestSet?.weight} lbs × {bestSet?.reps} reps</Text>
                </View>
                {hasPR && (
                  <View style={styles.prBadge}>
                    <Text style={styles.prBadgeText}>PR</Text>
                  </View>
                )}
              </View>
            );
          })}

          {/* Motivational message */}
          <View style={styles.msgBox}>
            <Text style={styles.msgText}>
              {prs > 0
                ? `${prs} new PR${prs > 1 ? 's' : ''} today. The work is paying off.`
                : 'Consistent effort compounds. Same time tomorrow.'}
            </Text>
          </View>

        </Animated.View>

        {/* Actions */}
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
  root: { flex: 1, backgroundColor: '#080010' },
  container: { paddingHorizontal: 28, paddingTop: 80, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 40 },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 3, color: '#9d4edd', marginBottom: 10 },
  title: { fontSize: 42, fontWeight: '900', color: '#ffffff', letterSpacing: -1, textAlign: 'center' },
  duration: { fontSize: 16, color: 'rgba(255,255,255,0.3)', marginTop: 8, fontWeight: '400' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 40 },
  statBox: { flex: 1, minWidth: '45%', backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderRadius: 20, padding: 20, alignItems: 'center' },
  statVal: { fontSize: 36, fontWeight: '900', color: '#ffffff', letterSpacing: -1 },
  statLbl: { fontSize: 11, color: 'rgba(255,255,255,0.25)', fontWeight: '500', letterSpacing: 1, marginTop: 4 },
  sectionLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 3, color: 'rgba(255,255,255,0.25)', marginBottom: 12 },
  exerciseRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: 16, marginBottom: 8 },
  exerciseLeft: { flex: 1 },
  exerciseName: { fontSize: 15, fontWeight: '700', color: '#ffffff', marginBottom: 3 },
  exerciseMeta: { fontSize: 12, color: 'rgba(255,255,255,0.25)', fontWeight: '400' },
  prBadge: { backgroundColor: 'rgba(240,165,0,0.15)', borderWidth: 1, borderColor: 'rgba(240,165,0,0.4)', borderRadius: 100, paddingHorizontal: 10, paddingVertical: 4 },
  prBadgeText: { fontSize: 11, fontWeight: '800', color: '#f0a500', letterSpacing: 1 },
  msgBox: { backgroundColor: 'rgba(123,44,191,0.1)', borderWidth: 1, borderColor: 'rgba(157,78,221,0.2)', borderRadius: 16, padding: 20, marginTop: 24, marginBottom: 32 },
  msgText: { fontSize: 15, color: 'rgba(255,255,255,0.5)', textAlign: 'center', lineHeight: 24, fontWeight: '400' },
  doneBtn: { paddingVertical: 22, borderRadius: 18, alignItems: 'center' },
  doneBtnText: { color: 'white', fontSize: 15, fontWeight: '800', letterSpacing: 3 },
});