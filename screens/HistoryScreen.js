import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';

const API_BASE = 'https://lurl0xn2b7.execute-api.us-east-1.amazonaws.com';

export default function HistoryScreen({ navigation }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch(`${API_BASE}/history?userId=user-test-001`);
      const data = await response.json();
      const sets = data.sets || [];
      setSessions(groupIntoSessions(sets));
    } catch (err) {
      console.error('Failed to fetch history:', err);
    } finally {
      setLoading(false);
    }
  };

  const groupIntoSessions = (sets) => {
    const groups = {};
    sets.forEach(set => {
      const date = set.timestamp?.split('T')[0] || 'Unknown';
      if (!groups[date]) {
        groups[date] = {
          date,
          split: set.split || 'Workout',
          sets: [],
          exercises: new Set(),
          prs: 0,
          volume: 0,
        };
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

        <Text style={styles.title}>History</Text>

        {loading ? (
          <ActivityIndicator color="#9d4edd" style={{ marginTop: 40 }} />
        ) : sessions.length === 0 ? (
          <Text style={styles.empty}>No workouts yet. Get after it.</Text>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 24 }}>
            {sessions.map((session, i) => (
              <View key={i} style={styles.sessionCard}>
                <View style={styles.sessionHeader}>
                  <View>
                    <Text style={styles.sessionDate}>{formatDate(session.date)}</Text>
                    <Text style={styles.sessionSplit}>{session.split}</Text>
                  </View>
                  {session.prs > 0 && (
                    <View style={styles.prBadge}>
                      <Text style={styles.prBadgeText}>🏆 {session.prs} PR</Text>
                    </View>
                  )}
                </View>

                <View style={styles.sessionStats}>
                  <View style={styles.sessionStat}>
                    <Text style={styles.sessionStatVal}>{session.sets.length}</Text>
                    <Text style={styles.sessionStatLbl}>sets</Text>
                  </View>
                  <View style={styles.sessionStatDivider} />
                  <View style={styles.sessionStat}>
                    <Text style={styles.sessionStatVal}>{session.exercises.length}</Text>
                    <Text style={styles.sessionStatLbl}>exercises</Text>
                  </View>
                  <View style={styles.sessionStatDivider} />
                  <View style={styles.sessionStat}>
                    <Text style={styles.sessionStatVal}>
                      {Math.round(session.volume / 1000 * 10) / 10}k
                    </Text>
                    <Text style={styles.sessionStatLbl}>volume</Text>
                  </View>
                </View>

                <View style={styles.exerciseList}>
                  {session.exercises.slice(0, 4).map((ex, j) => (
                    <View key={j} style={styles.exerciseTag}>
                      <Text style={styles.exerciseTagText}>{ex}</Text>
                    </View>
                  ))}
                  {session.exercises.length > 4 && (
                    <View style={styles.exerciseTag}>
                      <Text style={styles.exerciseTagText}>+{session.exercises.length - 4} more</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
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
  sessionCard: { backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderRadius: 20, padding: 20, marginBottom: 12 },
  sessionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  sessionDate: { fontSize: 16, fontWeight: '700', color: '#ffffff', marginBottom: 2 },
  sessionSplit: { fontSize: 12, color: 'rgba(255,255,255,0.3)', fontWeight: '500' },
  prBadge: { backgroundColor: 'rgba(240,165,0,0.15)', borderWidth: 1, borderColor: 'rgba(240,165,0,0.3)', borderRadius: 100, paddingHorizontal: 10, paddingVertical: 4 },
  prBadgeText: { fontSize: 11, fontWeight: '700', color: '#f0a500' },
  sessionStats: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  sessionStat: { flex: 1, alignItems: 'center' },
  sessionStatVal: { fontSize: 22, fontWeight: '800', color: '#ffffff', letterSpacing: -0.5 },
  sessionStatLbl: { fontSize: 10, color: 'rgba(255,255,255,0.25)', fontWeight: '500', letterSpacing: 1, marginTop: 2 },
  sessionStatDivider: { width: 1, height: 24, backgroundColor: 'rgba(255,255,255,0.06)' },
  exerciseList: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  exerciseTag: { backgroundColor: 'rgba(157,78,221,0.1)', borderWidth: 1, borderColor: 'rgba(157,78,221,0.2)', borderRadius: 100, paddingHorizontal: 10, paddingVertical: 4 },
  exerciseTagText: { fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: '500' },
});