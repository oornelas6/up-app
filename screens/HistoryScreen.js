import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator, Modal, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Logo from '../components/Logo';
import { useEffect, useState, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import * as Haptics from 'expo-haptics';

const API_BASE = 'https://lurl0xn2b7.execute-api.us-east-1.amazonaws.com';

export default function HistoryScreen({ navigation }) {
  const theme = useTheme();
  const styles = getStyles(theme);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const slideAnim = useRef(new Animated.Value(800)).current;

  useEffect(() => { fetchHistory(); }, []);

  const fetchHistory = async () => {
    try {
      const userId = await AsyncStorage.getItem('user_id') || 'user-test-001';
      const response = await fetch(`${API_BASE}/history?userId=${userId}`);
      const data = await response.json();
      setSessions(groupIntoSessions(data.sets || []));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const groupIntoSessions = (sets) => {
    const groups = {};
    sets.forEach(set => {
      const date = set.timestamp?.split('T')[0] || 'Unknown';
      if (!groups[date]) {
        groups[date] = { date, split: set.split || 'Workout', sets: [], exercises: new Set(), prs: 0, volume: 0 };
      }
      groups[date].sets.push(set);
      groups[date].exercises.add(set.exercise);
      if (set.isPR === true || set.isPR === 'true') groups[date].prs++;
      groups[date].volume += (parseFloat(set.weight) || 0) * (parseInt(set.reps) || 0);
    });
    return Object.values(groups)
      .sort((a, b) => b.date.localeCompare(a.date))
      .map(g => ({ ...g, exercises: [...g.exercises] }));
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr + 'T12:00:00');
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (dateStr === today.toISOString().split('T')[0]) return 'Today';
    if (dateStr === yesterday.toISOString().split('T')[0]) return 'Yesterday';
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  };

  const formatVolume = (vol) => {
    if (vol >= 1000) return `${(vol / 1000).toFixed(1)}k`;
    return Math.round(vol).toString();
  };

  const openSession = (session) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedSession(session);
    setShowDetail(true);
    Animated.spring(slideAnim, { toValue: 0, tension: 65, friction: 11, useNativeDriver: true }).start();
  };

  const closeDetail = () => {
    Animated.timing(slideAnim, { toValue: 800, duration: 280, useNativeDriver: true }).start(() => {
      setShowDetail(false);
      setSelectedSession(null);
    });
  };

  const shareSession = (session) => {
    closeDetail();
    setTimeout(() => {
      navigation.navigate('Share', {
        sets: session.sets,
        split: session.split,
        duration: 0,
      });
    }, 300);
  };

  // Group sets by exercise for detail view
  const getExerciseBreakdown = (session) => {
    if (!session) return [];
    const map = {};
    session.sets.forEach(set => {
      if (!map[set.exercise]) map[set.exercise] = [];
      map[set.exercise].push(set);
    });
    return Object.entries(map);
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <LinearGradient colors={theme.gradientBg} style={StyleSheet.absoluteFillObject} />
      <View style={styles.container}>
        <View style={styles.header}>
<View style={{ width: 60 }} />
          <Logo size={36} onPress={() => navigation.navigate('HomeTab')} />
        </View>

        <Text style={[styles.title, { color: theme.text }]}>History</Text>

        {loading ? (
          <ActivityIndicator color="#9d4edd" style={{ marginTop: 40 }} />
        ) : sessions.length === 0 ? (
          <Text style={styles.empty}>No workouts yet. Get after it.</Text>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 24 }}>
            {sessions.map((session, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.sessionCard, { backgroundColor: theme.bgCard, borderColor: theme.bgCardBorder }]}
                onPress={() => openSession(session)}
                activeOpacity={0.75}
              >
                <View style={styles.sessionHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.sessionDate, { color: theme.text }]}>{formatDate(session.date)}</Text>
                    <Text style={[styles.sessionSplit, { color: theme.textSecondary }]}>{session.split}</Text>
                  </View>
                  <View style={styles.sessionRight}>
                    {session.prs > 0 && (
                      <View style={styles.prBadge}>
                        <Text style={styles.prBadgeText}>🏆 {session.prs} PR</Text>
                      </View>
                    )}
                    <Text style={[styles.chevron, { color: theme.textTertiary }]}>›</Text>
                  </View>
                </View>

                <View style={styles.sessionStats}>
                  <View style={styles.sessionStat}>
                    <Text style={[styles.sessionStatVal, { color: theme.text }]}>{session.sets.length}</Text>
                    <Text style={[styles.sessionStatLbl, { color: theme.textTertiary }]}>sets</Text>
                  </View>
                  <View style={[styles.sessionStatDivider, { backgroundColor: theme.bgCardBorder }]} />
                  <View style={styles.sessionStat}>
                    <Text style={[styles.sessionStatVal, { color: theme.text }]}>{session.exercises.length}</Text>
                    <Text style={[styles.sessionStatLbl, { color: theme.textTertiary }]}>exercises</Text>
                  </View>
                  <View style={[styles.sessionStatDivider, { backgroundColor: theme.bgCardBorder }]} />
                  <View style={styles.sessionStat}>
                    <Text style={[styles.sessionStatVal, { color: theme.text }]}>{formatVolume(session.volume)}</Text>
                    <Text style={[styles.sessionStatLbl, { color: theme.textTertiary }]}>volume</Text>
                  </View>
                </View>

                <View style={styles.exerciseList}>
                  {session.exercises.slice(0, 4).map((ex, j) => (
                    <View key={j} style={styles.exerciseTag}>
                      <Text style={[styles.exerciseTagText, { color: theme.textSecondary }]}>{ex}</Text>
                    </View>
                  ))}
                  {session.exercises.length > 4 && (
                    <View style={styles.exerciseTag}>
                      <Text style={[styles.exerciseTagText, { color: theme.textSecondary }]}>+{session.exercises.length - 4} more</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
            <View style={{ height: 40 }} />
          </ScrollView>
        )}
      </View>

      {/* Session detail modal */}
      <Modal visible={showDetail} transparent animationType="none" onRequestClose={closeDetail}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={closeDetail} />
        <Animated.View style={[styles.sheet, { backgroundColor: theme.bgSecondary, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.sheetHandle} />

          {selectedSession && (
            <>
              {/* Sheet header */}
              <View style={styles.sheetHeader}>
                <View>
                  <Text style={[styles.sheetDate, { color: theme.textTertiary }]}>{formatDate(selectedSession.date)}</Text>
                  <Text style={[styles.sheetSplit, { color: theme.text }]}>{selectedSession.split} Day</Text>
                </View>
                {selectedSession.prs > 0 && (
                  <View style={styles.prBadge}>
                    <Text style={styles.prBadgeText}>🏆 {selectedSession.prs} PR</Text>
                  </View>
                )}
              </View>

              {/* Stats strip */}
              <View style={[styles.sheetStats, { backgroundColor: theme.bgCard, borderColor: theme.bgCardBorder }]}>
                <View style={styles.sheetStat}>
                  <Text style={[styles.sheetStatVal, { color: theme.text }]}>{selectedSession.sets.length}</Text>
                  <Text style={[styles.sheetStatLbl, { color: theme.textTertiary }]}>SETS</Text>
                </View>
                <View style={[styles.sheetStatDiv, { backgroundColor: theme.bgCardBorder }]} />
                <View style={styles.sheetStat}>
                  <Text style={[styles.sheetStatVal, { color: theme.text }]}>{selectedSession.exercises.length}</Text>
                  <Text style={[styles.sheetStatLbl, { color: theme.textTertiary }]}>EXERCISES</Text>
                </View>
                <View style={[styles.sheetStatDiv, { backgroundColor: theme.bgCardBorder }]} />
                <View style={styles.sheetStat}>
                  <Text style={[styles.sheetStatVal, { color: theme.text }]}>{formatVolume(selectedSession.volume)}</Text>
                  <Text style={[styles.sheetStatLbl, { color: theme.textTertiary }]}>VOLUME</Text>
                </View>
              </View>

              {/* Exercise breakdown */}
              <ScrollView style={styles.sheetScroll} showsVerticalScrollIndicator={false}>
                {getExerciseBreakdown(selectedSession).map(([exercise, sets], i) => {
                  const best = sets.reduce((b, s) => parseFloat(s.weight) > parseFloat(b.weight) ? s : b, sets[0]);
                  const hasPR = sets.some(s => s.isPR === true || s.isPR === 'true');
                  return (
                    <View key={i} style={[styles.exRow, { borderBottomColor: theme.bgCardBorder }]}>
                      <View style={styles.exLeft}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                          {hasPR && <Text style={styles.prDot}>PR</Text>}
                          <Text style={[styles.exName, { color: theme.text }]}>{exercise}</Text>
                        </View>
                        <Text style={[styles.exMeta, { color: theme.textTertiary }]}>
                          {sets.length} sets · Best: {best?.weight} {best?.unit} × {best?.reps}
                        </Text>
                      </View>
                    </View>
                  );
                })}
                <View style={{ height: 20 }} />
              </ScrollView>

              {/* Share button */}
              <TouchableOpacity
                style={styles.shareBtn}
                onPress={() => shareSession(selectedSession)}
                activeOpacity={0.85}
              >
                <LinearGradient colors={theme.gradientBtn} style={styles.shareBtnGradient}>
                  <Text style={[styles.shareBtnText, { color: theme.btnText }]}>SHARE THIS WORKOUT</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.closeBtn} onPress={closeDetail}>
                <Text style={[styles.closeBtnText, { color: theme.textTertiary }]}>Close</Text>
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
  sessionCard: { borderWidth: 1, borderRadius: 20, padding: 20, marginBottom: 12 },
  sessionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  sessionDate: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  sessionSplit: { fontSize: 12, fontWeight: '500' },
  sessionRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  chevron: { fontSize: 22, fontWeight: '300' },
  prBadge: { backgroundColor: 'rgba(240,165,0,0.15)', borderWidth: 1, borderColor: 'rgba(240,165,0,0.3)', borderRadius: 100, paddingHorizontal: 10, paddingVertical: 4 },
  prBadgeText: { fontSize: 11, fontWeight: '700', color: '#f0a500' },
  sessionStats: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  sessionStat: { flex: 1, alignItems: 'center' },
  sessionStatVal: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  sessionStatLbl: { fontSize: 10, fontWeight: '500', letterSpacing: 1, marginTop: 2 },
  sessionStatDivider: { width: 1, height: 24 },
  exerciseList: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  exerciseTag: { backgroundColor: 'rgba(157,78,221,0.1)', borderWidth: 1, borderColor: 'rgba(157,78,221,0.2)', borderRadius: 100, paddingHorizontal: 10, paddingVertical: 4 },
  exerciseTagText: { fontSize: 11, fontWeight: '500' },
  // Modal
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: { position: 'absolute', bottom: 0, left: 0, right: 0, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 48, maxHeight: '85%' },
  sheetHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.15)', alignSelf: 'center', marginBottom: 20 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  sheetDate: { fontSize: 11, fontWeight: '600', letterSpacing: 1, marginBottom: 4 },
  sheetSplit: { fontSize: 26, fontWeight: '900', letterSpacing: -0.5 },
  sheetStats: { flexDirection: 'row', borderRadius: 14, borderWidth: 1, paddingVertical: 14, marginBottom: 20 },
  sheetStat: { flex: 1, alignItems: 'center' },
  sheetStatVal: { fontSize: 20, fontWeight: '900', letterSpacing: -0.5 },
  sheetStatLbl: { fontSize: 8, fontWeight: '700', letterSpacing: 2, marginTop: 3 },
  sheetStatDiv: { width: 1, height: 24 },
  sheetScroll: { maxHeight: 240 },
  exRow: { paddingVertical: 12, borderBottomWidth: 1 },
  exLeft: { flex: 1 },
  exName: { fontSize: 15, fontWeight: '600' },
  exMeta: { fontSize: 12, fontWeight: '400' },
  prDot: { fontSize: 8, fontWeight: '800', color: '#f0a500', backgroundColor: 'rgba(240,165,0,0.15)', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4 },
  shareBtn: { marginTop: 20, marginBottom: 8 },
  shareBtnGradient: { paddingVertical: 18, borderRadius: 16, alignItems: 'center' },
  shareBtnText: { fontSize: 14, fontWeight: '800', letterSpacing: 2 },
  closeBtn: { paddingVertical: 12, alignItems: 'center' },
  closeBtnText: { fontSize: 14, fontWeight: '500' },
});
