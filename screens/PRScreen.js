import { StyleSheet, Text, View, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';

const MESSAGES = [
  { title: "Set locked in.", sub: "Every rep is a deposit into your future self." },
  { title: "Volume up.", sub: "Progressive overload is working. Trust the process." },
  { title: "One more down.", sub: "You're closer than you were 60 seconds ago." },
  { title: "That's the work.", sub: "Consistency builds the physique. Keep going." },
  { title: "Noted.", sub: "Your body is adapting. Show up again tomorrow." },
];

export default function PRScreen({ navigation, route }) {
  const { exercise, weight, reps, setNum, split } = route.params;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const isPR = route.params.isPR;
  const msg = MESSAGES[(setNum - 1) % MESSAGES.length];
  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 6, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['rgba(40,0,80,0.8)', 'rgba(8,0,16,1)']}
        style={StyleSheet.absoluteFillObject}
      />
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>

       {/* Set badge */}
        <Animated.View style={[styles.badge, { transform: [{ scale: scaleAnim }] }]}>
          {isPR ? (
            <LinearGradient colors={['#f0a500', '#e07000']} style={styles.badgeInner}>
              <Text style={styles.badgeText}>NEW PR</Text>
            </LinearGradient>
          ) : (
            <LinearGradient colors={['#7b2cbf', '#4a0080']} style={styles.badgeInner}>
              <Text style={styles.badgeText}>SET {setNum} LOGGED</Text>
            </LinearGradient>
          )}
        </Animated.View>

        {/* Stats */}
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

        {/* Message */}
        <View style={styles.msgContainer}>
          {isPR ? (
            <>
              <Text style={styles.prTitle}>New personal{'\n'}record.</Text>
              <Text style={styles.msgSub}>
                {weight} lbs × {reps} reps on {exercise}.{'\n'}
                That's what the work is for.
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.msgTitle}>{msg.title}</Text>
              <Text style={styles.msgSub}>{msg.sub}</Text>
            </>
          )}
        </View>

        <View style={{ flex: 1 }} />

        {/* Actions */}
        <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.goBack()}>
          <LinearGradient
            colors={['#7b2cbf', '#4a0080']}
            style={styles.continueBtn}
          >
            <Text style={styles.continueBtnText}>NEXT SET</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.doneBtn}
          onPress={() => navigation.navigate('Workout', { split })}
        >
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
  badgeText: { color: 'white', fontSize: 12, fontWeight: '800', letterSpacing: 3 },
  statsRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(157,78,221,0.2)', borderRadius: 24, paddingVertical: 28, paddingHorizontal: 40, gap: 40, marginBottom: 40 },
  statBox: { alignItems: 'center' },
  statVal: { fontSize: 48, fontWeight: '900', color: '#ffffff', letterSpacing: -1 },
  statLbl: { fontSize: 12, color: 'rgba(255,255,255,0.3)', fontWeight: '500', letterSpacing: 1, marginTop: 4 },
  statDivider: { width: 1, height: 50, backgroundColor: 'rgba(255,255,255,0.08)' },
  msgContainer: { alignItems: 'center', paddingHorizontal: 20 },
  msgTitle: { fontSize: 28, fontWeight: '800', color: '#ffffff', letterSpacing: -0.5, textAlign: 'center', marginBottom: 10 },
  msgSub: { fontSize: 14, color: 'rgba(255,255,255,0.35)', textAlign: 'center', lineHeight: 22, fontWeight: '400' },
  continueBtn: { width: '100%', paddingVertical: 22, borderRadius: 18, alignItems: 'center', marginBottom: 12 },
  continueBtnText: { color: 'white', fontSize: 15, fontWeight: '800', letterSpacing: 3 },
  doneBtn: { paddingVertical: 14, alignItems: 'center' },
  doneBtnText: { color: 'rgba(255,255,255,0.3)', fontSize: 14, fontWeight: '500' },
  finishBtn: { paddingVertical: 10, alignItems: 'center' },
  finishBtnText: { color: 'rgba(255,255,255,0.15)', fontSize: 13, fontWeight: '500', letterSpacing: 0.5 },
  prTitle: { fontSize: 36, fontWeight: '900', color: '#f0a500', letterSpacing: -1, textAlign: 'center', marginBottom: 10, lineHeight: 42 },
});