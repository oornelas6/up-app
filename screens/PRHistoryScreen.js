import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';

const API_BASE = 'https://lurl0xn2b7.execute-api.us-east-1.amazonaws.com';

export default function PRHistoryScreen({ navigation, route }) {
  const { exercise } = route.params;
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPRHistory();
  }, []);

  const fetchPRHistory = async () => {
    try {
      const response = await fetch(`${API_BASE}/history?userId=user-test-001`);
      const data = await response.json();
      const allSets = data.sets || [];
      const exerciseSets = allSets
        .filter(s => s.exercise === exercise)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setSets(exerciseSets);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const bestSet = sets.reduce((best, s) => {
    if (!best) return s;
    return parseFloat(s.weight) > parseFloat(best.weight) ? s : best;
  }, null);

  const estimated1RM = bestSet
    ? Math.round(parseFloat(bestSet.weight) * (1 + parseInt(bestSet.reps) / 30))
    : 0;

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

        <Text style={styles.title}>{exercise}</Text>
        <Text style={styles.subtitle}>{sets.length} sets logged</Text>

        {/* Best set banner */}
        {bestSet && (
          <View style={styles.bestBanner}>
            <LinearGradient
              colors={['rgba(240,165,0,0.15)', 'rgba(240,165,0,0.05)']}
              style={styles.bestBannerGradient}
            >
              <Text style={styles.bestLabel}>PERSONAL BEST</Text>
              <Text style={styles.bestWeight}>
                {bestSet.weight} {bestSet.unit} × {bestSet.reps} reps
              </Text>
              <Text style={styles.bestRM}>Est. 1RM: {estimated1RM} {bestSet.unit}</Text>
            </LinearGradient>
          </View>
        )}

        {loading ? (
          <ActivityIndicator color="#9d4edd" style={{ marginTop: 40 }} />
        ) : sets.length === 0 ? (
          <Text style={styles.empty}>No sets logged yet for this exercise.</Text>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 16 }}>
            <Text style={styles.sectionLabel}>ALL SETS</Text>
            {sets.map((set, i) => (
              <View key={i} style={[styles.setRow, set.isPR && styles.setRowPR]}>
                <View style={styles.setLeft}>
                  <Text style={styles.setDate}>
                    {new Date(set.timestamp).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric'
                    })}
                  </Text>
                  <Text style={styles.setSplit}>{set.split}</Text>
                </View>
                <View style={styles.setRight}>
                  <Text style={styles.setWeight}>{set.weight} {set.unit}</Text>
                  <Text style={styles.setReps}>{set.reps} reps</Text>
                </View>
                {(set.isPR === true || set.isPR === 'true') && (
                  <View style={styles.prBadge}>
                    <Text style={styles.prBadgeText}>PR</Text>
                  </View>
                )}
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  back: { color: 'rgba(255,255,255,0.4)', fontSize: 15, fontWeight: '600' },
  logo: { fontSize: 26, fontWeight: '900', color: '#ffffff', letterSpacing: 4 },
  title: { fontSize: 32, fontWeight: '900', color: '#ffffff', letterSpacing: -1, marginBottom: 4 },
  subtitle: { fontSize: 13, color: 'rgba(255,255,255,0.3)', marginBottom: 20 },
  bestBanner: { borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(240,165,0,0.3)', marginBottom: 8 },
  bestBannerGradient: { padding: 20 },
  bestLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 3, color: '#f0a500', marginBottom: 8 },
  bestWeight: { fontSize: 28, fontWeight: '900', color: '#ffffff', letterSpacing: -0.5 },
  bestRM: { fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 },
  sectionLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 3, color: 'rgba(255,255,255,0.25)', marginBottom: 12 },
  empty: { fontSize: 15, color: 'rgba(255,255,255,0.3)', marginTop: 40, textAlign: 'center' },
  setRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: 16, marginBottom: 8 },
  setRowPR: { borderColor: 'rgba(240,165,0,0.3)', backgroundColor: 'rgba(240,165,0,0.05)' },
  setLeft: { flex: 1 },
  setDate: { fontSize: 14, fontWeight: '600', color: '#ffffff', marginBottom: 2 },
  setSplit: { fontSize: 11, color: 'rgba(255,255,255,0.25)' },
  setRight: { alignItems: 'flex-end', marginRight: 12 },
  setWeight: { fontSize: 16, fontWeight: '800', color: '#9d4edd' },
  setReps: { fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 },
  prBadge: { backgroundColor: 'rgba(240,165,0,0.15)', borderWidth: 1, borderColor: 'rgba(240,165,0,0.4)', borderRadius: 100, paddingHorizontal: 8, paddingVertical: 3 },
  prBadgeText: { fontSize: 10, fontWeight: '800', color: '#f0a500', letterSpacing: 1 },
});