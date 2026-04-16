import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const SPLITS = [
  { name: 'Push', emoji: '💪', count: 12, color: '#7b2cbf' },
  { name: 'Pull', emoji: '🦾', count: 11, color: '#6a0dad' },
  { name: 'Legs', emoji: '🦵', count: 9, color: '#4a0080' },
  { name: 'Arms', emoji: '💪', count: 10, color: '#7b2cbf' },
  { name: 'Upper', emoji: '🏋️', count: 7, color: '#6a0dad' },
  { name: 'Lower', emoji: '⚡', count: 7, color: '#4a0080' },
  { name: 'Full Body', emoji: '🔥', count: 8, color: '#7b2cbf' },
  { name: 'Custom', emoji: '✏️', count: 0, color: '#3a0060' },
];

export default function SplitScreen({ navigation }) {
  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['rgba(60,0,100,0.4)', 'rgba(8,0,16,0.95)']}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.back}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.logo}>UP</Text>
        </View>

        <Text style={styles.title}>Choose Split</Text>
        <Text style={styles.subtitle}>What are we training today?</Text>

        <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 24 }}>
          <View style={styles.grid}>
            {SPLITS.map((split) => (
              <TouchableOpacity
                key={split.name}
                style={styles.card}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('Workout', { split: split.name })}
              >
                <LinearGradient
                  colors={[`${split.color}40`, `${split.color}15`]}
                  style={styles.cardGradient}
                >
                  <Text style={styles.cardName}>{split.name}</Text>
                  <Text style={styles.cardCount}>{split.count} exercises</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#080010' },
  container: { flex: 1, paddingHorizontal: 28, paddingTop: 64, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  back: { color: 'rgba(255,255,255,0.4)', fontSize: 15, fontWeight: '600' },
  logo: { fontSize: 26, fontWeight: '900', color: '#ffffff', letterSpacing: 4 },
  title: { fontSize: 36, fontWeight: '800', color: '#ffffff', letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.3)', marginTop: 6, fontWeight: '400' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: { width: '47%', borderRadius: 20, overflow: 'hidden' },
  cardGradient: { padding: 24, borderWidth: 1, borderColor: 'rgba(157,78,221,0.2)', borderRadius: 20 },
  cardName: { fontSize: 18, fontWeight: '800', color: '#ffffff', marginBottom: 4 },
  cardCount: { fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: '500', letterSpacing: 0.5 },
});