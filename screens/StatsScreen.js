import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator, Dimensions, Modal, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Logo from '../components/Logo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');
const API_BASE = 'https://lurl0xn2b7.execute-api.us-east-1.amazonaws.com';

const STAT_INFO = {
  'TOTAL VOLUME': {
    title: 'Total Volume',
    description: 'The sum of weight × reps across every set you\'ve ever logged. It\'s the single best measure of how much total work your muscles have done.',
    insight: 'Elite lifters track volume progression over weeks — not just weight on the bar.',
  },
  'TOTAL SETS': {
    title: 'Total Sets',
    description: 'Every set you\'ve logged in the app. Each one represents a conscious decision to show up and do the work.',
    insight: 'Research shows 10–20 sets per muscle group per week is the sweet spot for hypertrophy.',
  },
  'TOTAL PRS': {
    title: 'Personal Records',
    description: 'Any time you logged a higher weight × reps combination than your previous best on that exercise.',
    insight: 'PRs don\'t have to be massive. A PR is a PR — your body got stronger.',
  },
  'DAYS TRAINED': {
    title: 'Days Trained',
    description: 'The number of unique days you\'ve logged at least one set. Consistency over time is what builds the physique.',
    insight: '3–5 days per week is optimal for most people. More isn\'t always better.',
  },
};

export default function StatsScreen({ navigation }) {
  const theme = useTheme();
  const styles = getStyles(theme);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [selectedStat, setSelectedStat] = useState(null);
  const [showStatModal, setShowStatModal] = useState(false);
  const slideAnim = useRef(new Animated.Value(400)).current;

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      const userId = await AsyncStorage.getItem('user_id') || 'user-test-001';
      const response = await fetch(`${API_BASE}/history?userId=${userId}`);
      const data = await response.json();
      const allSets = data.sets || [];
      setStats(calculateStats(allSets));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openStatInfo = (label) => {
    setSelectedStat(STAT_INFO[label]);
    setShowStatModal(true);
    Animated.spring(slideAnim, { toValue: 0, tension: 65, friction: 11, useNativeDriver: true }).start();
  };

  const closeStatModal = () => {
    Animated.timing(slideAnim, { toValue: 400, duration: 250, useNativeDriver: true }).start(() => {
      setShowStatModal(false);
      setSelectedStat(null);
    });
  };

  const calculateStats = (sets) => {
    if (sets.length === 0) return null;
    const totalVolume = sets.reduce((sum, s) => sum + ((parseFloat(s.weight) || 0) * (parseInt(s.reps) || 0)), 0);
    const totalSets = sets.length;
    const totalPRs = sets.filter(s => s.isPR === true || s.isPR === 'true').length;
    const uniqueDays = [...new Set(sets.map(s => s.timestamp?.split('T')[0]))];
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
      'Calf Raises': 'Calves', 'Hanging Leg Raises': 'Abs', 'Weighted Sit Ups': 'Abs',
    };
    const muscleCounts = {};
    sets.forEach(s => {
      const muscle = muscleMap[s.exercise] || 'Other';
      muscleCounts[muscle] = (muscleCounts[muscle] || 0) + 1;
    });
    const topMuscles = Object.entries(muscleCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const maxMuscleCount = Math.max(...topMuscles.map(m => m[1]));
    const exerciseVolume = {};
    sets.forEach(s => {
      const vol = (parseFloat(s.weight) || 0) * (parseInt(s.reps) || 0);
      exerciseVolume[s.exercise] = (exerciseVolume[s.exercise] || 0) + vol;
    });
    const topExercises = Object.entries(exerciseVolume).sort((a, b) => b[1] - a[1]).slice(0, 5);
    return { totalVolume, totalSets, totalPRs, daysTraining: uniqueDays.length, topMuscles, maxMuscleCount, topExercises };
  };

  const formatVolume = (vol) => {
    if (vol >= 1000000) return `${(vol / 1000000).toFixed(1)}M`;
    if (vol >= 1000) return `${(vol / 1000).toFixed(1)}k`;
    return vol.toString();
  };

  const OVERVIEW_ITEMS = stats ? [
    { val: formatVolume(stats.totalVolume), label: 'TOTAL VOLUME' },
    { val: stats.totalSets, label: 'TOTAL SETS' },
    { val: stats.totalPRs, label: 'TOTAL PRS' },
    { val: stats.daysTraining, label: 'DAYS TRAINED' },
  ] : [];

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

        <Text style={[styles.title, { color: theme.text }]}>Stats</Text>

        {loading ? (
          <ActivityIndicator color="#9d4edd" style={{ marginTop: 40 }} />
        ) : !stats ? (
          <Text style={styles.empty}>No data yet. Start training.</Text>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 24 }}>

            {/* Overview — tappable */}
            <View style={styles.overviewGrid}>
              {OVERVIEW_ITEMS.map(({ val, label }) => (
                <TouchableOpacity
                  key={label}
                  style={styles.overviewCard}
                  activeOpacity={0.75}
                  onPress={() => openStatInfo(label)}
                >
                  <Text style={styles.overviewVal}>{val}</Text>
                  <Text style={styles.overviewLbl}>{label}</Text>
                  <Text style={styles.overviewTap}>tap to learn more</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Muscle frequency */}
            <Text style={styles.sectionLabel}>MUSCLE FREQUENCY</Text>
            <View style={[styles.card, { backgroundColor: theme.bgCard, borderColor: theme.bgCardBorder }]}>
              {stats.topMuscles.map(([muscle, count], i) => (
                <View key={i} style={styles.muscleRow}>
                  <Text style={styles.muscleName}>{muscle}</Text>
                  <View style={[styles.muscleBarContainer, { backgroundColor: theme.bgCardBorder }]}>
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
            <View style={[styles.card, { backgroundColor: theme.bgCard, borderColor: theme.bgCardBorder }]}>
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

      {/* Stat breakdown modal */}
      <Modal visible={showStatModal} transparent animationType="none" onRequestClose={closeStatModal}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={closeStatModal} />
        <Animated.View style={[styles.sheet, { backgroundColor: theme.bgSecondary, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.sheetHandle} />
          {selectedStat && (
            <>
              <Text style={[styles.sheetTitle, { color: theme.text }]}>{selectedStat.title}</Text>
              <Text style={[styles.sheetBody, { color: theme.textSecondary }]}>{selectedStat.description}</Text>
              <View style={[styles.insightBox, { backgroundColor: theme.bgCard, borderColor: theme.bgCardBorder }]}>
                <Text style={[styles.insightLabel, { color: theme.accent }]}>INSIGHT</Text>
                <Text style={[styles.insightText, { color: theme.textSecondary }]}>{selectedStat.insight}</Text>
              </View>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={closeStatModal}
                activeOpacity={0.8}
              >
                <LinearGradient colors={theme.gradientBtn} style={styles.closeBtnGradient}>
                  <Text style={[styles.closeBtnText, { color: theme.btnText }]}>Got it</Text>
                </LinearGradient>
              </TouchableOpacity>
            </>
          )}
        </Animated.View>
      </Modal>
    </View>
  );
}

const getStyles = (theme) => ({
  root: { flex: 1, backgroundColor: '#080010' },
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 64 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  back: { color: theme.textSecondary, fontSize: 15, fontWeight: '600' },
  title: { fontSize: 38, fontWeight: '900', color: theme.text, letterSpacing: -1 },
  empty: { fontSize: 16, color: theme.textSecondary, marginTop: 40, textAlign: 'center' },
  sectionLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 3, color: theme.textTertiary, marginBottom: 12, marginTop: 24 },
  overviewGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  overviewCard: { flex: 1, minWidth: '45%', backgroundColor: theme.bgCard, borderWidth: 1, borderColor: theme.bgCardBorder, borderRadius: 20, paddingVertical: 20, alignItems: 'center' },
  overviewVal: { fontSize: 32, fontWeight: '900', color: theme.text, letterSpacing: -1 },
  overviewLbl: { fontSize: 9, color: theme.textTertiary, fontWeight: '700', letterSpacing: 2, marginTop: 4 },
  overviewTap: { fontSize: 9, color: theme.accent, fontWeight: '500', marginTop: 6, opacity: 0.6 },
  card: { backgroundColor: theme.bgCard, borderWidth: 1, borderColor: theme.bgCardBorder, borderRadius: 20, padding: 20 },
  muscleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  muscleName: { fontSize: 13, fontWeight: '600', color: theme.text, width: 80 },
  muscleBarContainer: { flex: 1, height: 6, borderRadius: 3, marginHorizontal: 12, overflow: 'hidden' },
  muscleBar: { height: '100%', borderRadius: 3 },
  muscleCount: { fontSize: 12, color: theme.textSecondary, fontWeight: '600', width: 24, textAlign: 'right' },
  exerciseRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  exerciseRank: { width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(157,78,221,0.2)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  exerciseRankText: { fontSize: 11, fontWeight: '800', color: '#9d4edd' },
  exerciseName: { flex: 1, fontSize: 14, fontWeight: '600', color: theme.text },
  exerciseVolume: { fontSize: 13, fontWeight: '700', color: 'rgba(157,78,221,0.8)' },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: { position: 'absolute', bottom: 0, left: 0, right: 0, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 28, paddingBottom: 48 },
  sheetHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.15)', alignSelf: 'center', marginBottom: 24 },
  sheetTitle: { fontSize: 26, fontWeight: '900', letterSpacing: -0.5, marginBottom: 12 },
  sheetBody: { fontSize: 15, lineHeight: 24, fontWeight: '400', marginBottom: 20 },
  insightBox: { borderRadius: 14, padding: 16, marginBottom: 24, borderWidth: 1 },
  insightLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 2, marginBottom: 6 },
  insightText: { fontSize: 13, lineHeight: 20, fontWeight: '400' },
  closeBtn: { borderRadius: 16, overflow: 'hidden' },
  closeBtnGradient: { paddingVertical: 18, alignItems: 'center', borderRadius: 16 },
  closeBtnText: { fontSize: 15, fontWeight: '800', letterSpacing: 2 },
});
