import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRef, useState } from 'react';

const WEIGHTS = Array.from({ length: 81 }, (_, i) => i * 5);
const REPS = Array.from({ length: 30 }, (_, i) => i + 1);

export default function RevolverScreen({ navigation, route }) {
  const { exercise } = route.params;
  const [setNum, setSetNum] = useState(1);
  const [lastWeight, setLastWeight] = useState(null);
  const [lastReps, setLastReps] = useState(null);
  const weightRef = useRef(null);
  const repsRef = useRef(null);
  const [selectedWeight, setSelectedWeight] = useState(135);
  const [selectedReps, setSelectedReps] = useState(8);

  const logSet = () => {
    setLastWeight(selectedWeight);
    setLastReps(selectedReps);
    setSetNum(s => s + 1);
    navigation.navigate('PR', { exercise, weight: selectedWeight, reps: selectedReps, setNum });
  };

  const sameAsLast = () => {
    setSetNum(s => s + 1);
    navigation.navigate('PR', { exercise, weight: lastWeight, reps: lastReps, setNum });
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['rgba(60,0,100,0.4)', 'rgba(8,0,16,0.98)']}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.back}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.logo}>UP</Text>
        </View>

        <Text style={styles.exName}>{exercise}</Text>
        <Text style={styles.setLabel}>SET {setNum}</Text>

        <View style={styles.revolverWrapper}>
          <View style={styles.highlight} />
          <View style={styles.revolverRow}>
            {/* Weight wheel */}
            <View style={styles.wheelContainer}>
              <Text style={styles.wheelLabel}>WEIGHT</Text>
              <ScrollView
                ref={weightRef}
                style={styles.wheel}
                showsVerticalScrollIndicator={false}
                snapToInterval={56}
                decelerationRate="fast"
                onMomentumScrollEnd={(e) => {
                  const idx = Math.round(e.nativeEvent.contentOffset.y / 56);
                  setSelectedWeight(WEIGHTS[Math.min(idx, WEIGHTS.length - 1)]);
                }}
              >
                <View style={{ height: 112 }} />
                {WEIGHTS.map((w) => (
                  <View key={w} style={styles.wheelItem}>
                    <Text style={[styles.wheelText, selectedWeight === w && styles.wheelTextActive]}>
                      {w} lbs
                    </Text>
                  </View>
                ))}
                <View style={{ height: 112 }} />
              </ScrollView>
            </View>

            <View style={styles.wheelDivider} />

            {/* Reps wheel */}
            <View style={styles.wheelContainer}>
              <Text style={styles.wheelLabel}>REPS</Text>
              <ScrollView
                ref={repsRef}
                style={styles.wheel}
                showsVerticalScrollIndicator={false}
                snapToInterval={56}
                decelerationRate="fast"
                onMomentumScrollEnd={(e) => {
                  const idx = Math.round(e.nativeEvent.contentOffset.y / 56);
                  setSelectedReps(REPS[Math.min(idx, REPS.length - 1)]);
                }}
              >
                <View style={{ height: 112 }} />
                {REPS.map((r) => (
                  <View key={r} style={styles.wheelItem}>
                    <Text style={[styles.wheelText, selectedReps === r && styles.wheelTextActive]}>
                      {r} reps
                    </Text>
                  </View>
                ))}
                <View style={{ height: 112 }} />
              </ScrollView>
            </View>
          </View>
        </View>

        <View style={{ flex: 1 }} />

        <TouchableOpacity activeOpacity={0.9} onPress={logSet}>
          <LinearGradient
            colors={['#7b2cbf', '#4a0080']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logBtn}
          >
            <Text style={styles.logBtnText}>LOG SET</Text>
            <Text style={styles.logBtnSub}>{selectedWeight} lbs × {selectedReps} reps</Text>
          </LinearGradient>
        </TouchableOpacity>

        {lastWeight && (
          <TouchableOpacity style={styles.sameBtn} onPress={sameAsLast}>
            <Text style={styles.sameBtnText}>↩ Same as Last Set · {lastWeight} lbs × {lastReps} reps</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.doneBtn} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.doneBtnText}>Done with Exercise</Text>
        </TouchableOpacity>
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
  exName: { fontSize: 28, fontWeight: '800', color: '#ffffff', letterSpacing: -0.5, marginBottom: 6 },
  setLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 3, color: '#9d4edd', marginBottom: 32 },
  revolverWrapper: { height: 280, backgroundColor: 'rgba(255,255,255,0.02)', borderWidth: 1, borderColor: 'rgba(157,78,221,0.2)', borderRadius: 24, overflow: 'hidden', position: 'relative' },
  highlight: { position: 'absolute', top: '50%', left: 16, right: 16, height: 56, marginTop: -28, backgroundColor: 'rgba(157,78,221,0.1)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(157,78,221,0.3)', zIndex: 1, pointerEvents: 'none' },
  revolverRow: { flex: 1, flexDirection: 'row' },
  wheelContainer: { flex: 1, alignItems: 'center', paddingTop: 8 },
  wheelLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 3, color: 'rgba(255,255,255,0.2)', marginBottom: 8 },
  wheel: { flex: 1, width: '100%' },
  wheelItem: { height: 56, justifyContent: 'center', alignItems: 'center' },
  wheelText: { fontSize: 20, fontWeight: '600', color: 'rgba(255,255,255,0.2)', letterSpacing: -0.5 },
  wheelTextActive: { color: '#ffffff', fontSize: 22, fontWeight: '800' },
  wheelDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginVertical: 20 },
  logBtn: { paddingVertical: 22, borderRadius: 18, alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: 'rgba(157,78,221,0.2)' },
  logBtnText: { color: 'white', fontSize: 15, fontWeight: '800', letterSpacing: 3, marginBottom: 4 },
  logBtnSub: { color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: '400' },
  sameBtn: { backgroundColor: 'rgba(157,78,221,0.08)', borderWidth: 1, borderColor: 'rgba(157,78,221,0.2)', borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginBottom: 10 },
  sameBtnText: { color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: '600' },
  doneBtn: { paddingVertical: 14, alignItems: 'center' },
  doneBtnText: { color: 'rgba(255,255,255,0.2)', fontSize: 13, fontWeight: '500', letterSpacing: 1 },
});
