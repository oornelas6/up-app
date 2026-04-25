import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';

const { width } = Dimensions.get('window');
const API_BASE = 'https://lurl0xn2b7.execute-api.us-east-1.amazonaws.com';

export default function StatsScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [sets, setSets] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/history?userId=user-test-001`);
      const data = await response.json();
      const allSets = data.sets || [];
      setSets(allSets);
      setStats(calculateStats(allSets));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (sets) => {
    if (sets.length === 0) return null;

    // Total volume
    const totalVolume = sets.reduce((sum, s) =>
      sum + ((parseFloat(s.weight) || 0) * (parseInt(s.reps) || 0)), 0);

    // Total sets and reps
    const totalSets = sets.length;
    const totalReps = sets.reduce((sum, s) => sum + (parseInt(s.reps) || 0), 0);

    // PRs
    const totalPRs = sets.filter(s => s.isPR === true || s.isPR === 'true').length;

    // Unique days trained
    const uniqueDays = [...new Set(sets.map(s => s.timestamp?.split('T')[0]))];

    // Muscle group frequency
    const muscleMap = {
      'Flat Barbell Bench': 'Chest', 'Incline DB Bench': 'Chest', 'Incline Smith Bench': 'Chest',
      'Flat DB Bench': 'Chest', 'Chest Fly Machine': 'Chest',
      'Overhead Press': 'Shoulders', 'Lateral Raise DB': 'Shoulders', 'Lateral Raise Machine': 'Shoulders',
      'Tricep Overhead Extension': 'Triceps', 'Cable Pushdown': 'Triceps', 'Weighted Dips': 'Triceps',
      'Chest Supported Row': 'Back', 'Bent Over Barbell Row': 'Back', 'Seated Cable Row': 'Back',
      'Wide Grip Lat Pulldown': 'Back', 'Straight Arm Lat Pulldown': 'Back',
      'Hammer Curl': 'Biceps', 'Preacher Curl': 'Biceps', 'Incline Curl': 'Biceps',
      'Back Squat': 'Quads', 'Belt Squat': 'Quads', 'Leg Extension': 'Quads', 'Walking Lunges': 'Quads',
      'RDL': 'Hamstrings', 'Seated Hamstring Curl': 'Hamstrings',
      'Calf Raises': 'Calves',
      'Hanging Leg Raises': 'Abs', 'Weighted Sit Ups': 'Abs',
    };

    const muscleCounts = {};
    sets.forEach(s => {
      const muscle = muscleMap[s.exercise] || 'Other';
      muscleCounts[muscle] = (muscleCounts[muscle] || 0) + 1;
    });

    const topMuscles = Object.entries(muscleCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    const maxMuscleCount = Math.max(...topMuscles.map(m => m[1]));

    // Top exercises by volume
    const exerciseVolume = {};
    sets.forEach(s => {
      const vol = (parseFloat(s.weight) || 0) * (parseInt(s.reps) || 0);
      exerciseVolume[s.exercise] = (exerciseVolume[s.exercise] || 0) + vol;
    });

    const topExercises = Object.entries(exerciseVolume)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Weekly volume (last 4 weeks)
    const weeklyVolume = {};
    sets.forEach(s => {
      const date = new Date(s.timestamp);
      const week = getWeekNumber(date);
      weeklyVolume[week] = (weeklyVolume[week] || 0) + ((parseFloat(s.weight) || 0) * (parseInt(s.reps) || 0));
    });

    return {
      totalVolume, totalSets, totalReps, totalPRs,
      daysTraining: uniqueDays.length,
      topMuscles, maxMuscleCount,
      topExercises,
      weeklyVolume,
    };
  };

  const getWeekNumber = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
    const week1 = new Date(d.getFullYear(), 0, 4);
    return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  };

  const formatVolume = (vol) => {
    if (vol >= 1000000) return `${(vol / 1000000).toFixed(1)}M`;
    if (vol >= 1000) return `${(vol / 1000).toFixed(1)}k`;
    return vol.toString();
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['rgba(50,0,90,0.5)', 'rgba(8,0,16,1)']}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.back}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.logo}>UP</Text>
        </View>

        <Text style={styles.title}>Stats</Text>

        {loading ? (
          <ActivityIndicator color="#9d4edd" style={{ marginTop: 40 }} />
        ) : !stats ? (
          <Text style={styles.empty}>No data yet. Start training.</Text>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 24 }}>

            {/* Overview */}
            <View style={styles.overviewGrid}>
              <View style={styles.overviewCard}>
                <Text style={styles.overviewVal}>{formatVolume(stats.totalVolume)}</Text>
                <Text style={styles.overviewLbl}>TOTAL VOLUME</Text>
              </View>
              <View style={styles.overviewCard}>
                <Text style={styles.overviewVal}>{stats.totalSets}</Text>
                <Text style={styles.overviewLbl}>TOTAL SETS</Text>
              </View>
              <View style={styles.overviewCard}>
                <Text style={styles.overviewVal}>{stats.totalPRs}</Text>
                <Text style={styles.overviewLbl}>TOTAL PRS</Text>
              </View>
              <View style={styles.overviewCard}>
                <Text style={styles.overviewVal}>{stats.daysTraining}</Text>
                <Text style={styles.overviewLbl}>DAYS TRAINED</Text>
              </View>
            </View>

            {/* Muscle frequency */}
            <Text style={styles.sectionLabel}>MUSCLE FREQUENCY</Text>
            <View style={styles.card}>
              {stats.topMuscles.map(([muscle, count], i) => (
                <View key={i} style={styles.muscleRow}>
                  <Text style={styles.muscleName}>{muscle}</Text>
                  <View style={styles.muscleBarContainer}>
                    <View style={[styles.muscleBar, {
                      width: `${(count / stats.maxMuscleCount) * 100}%`,
                      backgroundColor: i === 0 ? '#7b2cbf' : i === 1 ? '#9d4edd' : 'rgba(157,78,221,0.5)',
                    }]} />
                  </View>
                  <Text style={styles.muscleCount}>{count}</Text>
                </View>
              ))}
            </View>

            {/* Top exercises */}
            <Text style={styles.sectionLabel}>TOP EXERCISES BY VOLUME</Text>
            <View style={styles.card}>
              {stats.topExercises.map(([exercise, volume], i) => (
                <View key={i} style={styles.exerciseRow}>
                  <View style={styles.exerciseRank}>
                    <Text style={styles.exerciseRankText}>{i + 1}</Text>
                  </View>
                  <Text style={styles.exerciseName}>{exercise}</Text>
                  <Text style={styles.exerciseVolume}>{formatVolume(volume)}</Text>
                </View>
              ))}
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#080010' },
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 64 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  back: { color: 'rgba(255,255,255,0.4)', fontSize: 15, fontWeight: '600' },
  logo: { fontSize: 26, fontWeight: '900', color: '#ffffff', letterSpacing: 4 },
  title: { fontSize: 38, fontWeight: '900', color: '#ffffff', letterSpacing: -1 },
  empty: { fontSize: 16, color: 'rgba(255,255,255,0.3)', marginTop: 40, textAlign: 'center' },
  sectionLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 3, color: 'rgba(255,255,255,0.25)', marginBottom: 12, marginTop: 24 },
  overviewGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  overviewCard: { flex: 1, minWidth: '45%', backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderRadius: 20, paddingVertical: 20, alignItems: 'center' },
  overviewVal: { fontSize: 32, fontWeight: '900', color: '#ffffff', letterSpacing: -1 },
  overviewLbl: { fontSize: 9, color: 'rgba(255,255,255,0.25)', fontWeight: '700', letterSpacing: 2, marginTop: 4 },
  card: { backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderRadius: 20, padding: 20 },
  muscleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  muscleName: { fontSize: 13, fontWeight: '600', color: '#ffffff', width: 80 },
  muscleBarContainer: { flex: 1, height: 6, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 3, marginHorizontal: 12, overflow: 'hidden' },
  muscleBar: { height: '100%', borderRadius: 3 },
  muscleCount: { fontSize: 12, color: 'rgba(255,255,255,0.3)', fontWeight: '600', width: 24, textAlign: 'right' },
  exerciseRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  exerciseRank: { width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(157,78,221,0.2)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  exerciseRankText: { fontSize: 11, fontWeight: '800', color: '#9d4edd' },
  exerciseName: { flex: 1, fontSize: 14, fontWeight: '600', color: '#ffffff' },
  exerciseVolume: { fontSize: 13, fontWeight: '700', color: 'rgba(157,78,221,0.8)' },
});