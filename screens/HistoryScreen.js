import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';

const API_BASE = 'https://lurl0xn2b7.execute-api.us-east-1.amazonaws.com';

export default function HistoryScreen({ navigation }) {
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch(`${API_BASE}/history?userId=user-test-001`);
      const data = await response.json();
      setSets(data.sets || []);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    } finally {
      setLoading(false);
    }
  };

  const groupByDate = (sets) => {
    const groups = {};
    sets.forEach(set => {
      const date = set.timestamp?.split('T')[0] || 'Unknown';
      if (!groups[date]) groups[date] = [];
      groups[date].push(set);
    });
    return groups;
  };

  const grouped = groupByDate(sets);
  const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

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
        ) : sets.length === 0 ? (
          <Text style={styles.empty}>No workouts yet. Get after it.</Text>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 24 }}>
            {dates.map(date => (
              <View key={date} style={styles.dateGroup}>
                <Text style={styles.dateLabel}>{date}</Text>
                {grouped[date].map((set, i) => (
                  <View key={i} style={styles.setCard}>
                    <View style={styles.setLeft}>
                      <Text style={styles.setExercise}>{set.exercise}</Text>
                      <Text style={styles.setSplit}>{set.split}</Text>
                    </View>
                    <View style={styles.setRight}>
                      <Text style={styles.setWeight}>{set.weight} {set.unit}</Text>
                      <Text style={styles.setReps}>{set.reps} reps</Text>
                    </View>
                  </View>
                ))}
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
  dateGroup: { marginBottom: 24 },
  dateLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 3, color: 'rgba(255,255,255,0.25)', marginBottom: 10, textTransform: 'uppercase' },
  setCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: 16, marginBottom: 8 },
  setLeft: { flex: 1 },
  setExercise: { fontSize: 15, fontWeight: '700', color: '#ffffff', marginBottom: 2 },
  setSplit: { fontSize: 11, color: 'rgba(255,255,255,0.25)', fontWeight: '400' },
  setRight: { alignItems: 'flex-end' },
  setWeight: { fontSize: 16, fontWeight: '800', color: '#9d4edd' },
  setReps: { fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 },
});