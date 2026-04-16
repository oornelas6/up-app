import { StyleSheet, Text, View, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';

export default function PRScreen({ navigation, route }) {
  const { exercise, weight, reps, setNum } = route.params;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 6, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['rgba(74,0,128,0.6)', 'rgba(8,0,16,1)']}
        style={StyleSheet.absoluteFillObject}
      />
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>

        <Animated.View style={[styles.badge, { transform: [{ scale: scaleAnim }] }]}>
          <LinearGradient colors={['#7b2cbf', '#4a0080']} style={styles.badgeInner}>
            <Text style={styles.badgeText}>SET {setNum}</Text>
          </LinearGradient>
        </Animated.View>

        <Text style={styles.title}>That was{'\n'}insane.</Text>
        <Text style={styles.subtitle}>{exercise}</Text>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>{weight}</Text>
            <Text style={styles.statLbl}>lbs</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statVal}>{reps}</Text>
            <Text style={styles.statLbl}>reps</Text>
          </View>
        </View>

        <View style={{ flex: 1 }} />

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.goBack()}
        >
          <LinearGradient
            colors={['#7b2cbf', '#4a0080']}
            style={styles.continueBtn}
          >
            <Text style={styles.continueBtnText}>NEXT SET</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.doneBtn}
          onPress={() => navigation.navigate('Workout', { split: route.params.split })}>
          <Text style={styles.doneBtnText}>Back to Exercises</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.finishBtn}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.finishBtnText}>Finish Workout</Text>
        </TouchableOpacity>

      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#080010' },
  container: { flex: 1, paddingHorizontal: 28, paddingTop: 100, paddingBottom: 40, alignItems: 'center' },
  badge: { marginBottom: 40 },
  badgeInner: { paddingHorizontal: 28, paddingVertical: 14, borderRadius: 100 },
  badgeText: { color: 'white', fontSize: 13, fontWeight: '800', letterSpacing: 3 },
  title: { fontSize: 52, fontWeight: '900', color: '#ffffff', letterSpacing: -1.5, textAlign: 'center', lineHeight: 56, marginBottom: 12 },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.4)', fontWeight: '500', marginBottom: 48, textAlign: 'center' },
  statsRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(157,78,221,0.2)', borderRadius: 24, paddingVertical: 28, paddingHorizontal: 40, gap: 40 },
  statBox: { alignItems: 'center' },
  statVal: { fontSize: 42, fontWeight: '900', color: '#ffffff', letterSpacing: -1 },
  statLbl: { fontSize: 12, color: 'rgba(255,255,255,0.3)', fontWeight: '500', letterSpacing: 1, marginTop: 4 },
  statDivider: { width: 1, height: 50, backgroundColor: 'rgba(255,255,255,0.08)' },
  continueBtn: { width: '100%', paddingVertical: 22, borderRadius: 18, alignItems: 'center', marginBottom: 12 },
  continueBtnText: { color: 'white', fontSize: 15, fontWeight: '800', letterSpacing: 3 },
  doneBtn: { paddingVertical: 14, alignItems: 'center' },
  doneBtnText: { color: 'rgba(255,255,255,0.3)', fontSize: 14, fontWeight: '500' },
  finishBtn: { paddingVertical: 10, alignItems: 'center' },
  finishBtnText: { color: 'rgba(255,255,255,0.15)', fontSize: 13, fontWeight: '500', letterSpacing: 0.5 },
});
