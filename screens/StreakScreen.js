import { StyleSheet, Text, View, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import * as Haptics from 'expo-haptics';


const { width } = Dimensions.get('window');
const API_BASE = 'https://lurl0xn2b7.execute-api.us-east-1.amazonaws.com';

const RING_SIZE = width * 0.65;
const STROKE = 12;
const RADIUS = (RING_SIZE - STROKE * 2) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function StreakScreen({ navigation, route }) {
  const { streak = 0 } = route.params || {};
  const theme = useTheme();
  const styles = getStyles(theme);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [recentDays, setRecentDays] = useState([]);

  useEffect(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(progressAnim, {
        toValue: Math.min(streak / 30, 1), // full ring at 30 days
        duration: 1200,
        delay: 300,
        useNativeDriver: false,
      }),
    ]).start();
    loadRecentDays();
  }, []);

  const loadRecentDays = async () => {
    try {
      const userId = await AsyncStorage.getItem('user_id') || 'user-test-001';
      const response = await fetch(`${API_BASE}/history?userId=${userId}`);
      const data = await response.json();
      const sets = data.sets || [];
      const uniqueDates = [...new Set(sets.map(s => s.timestamp?.split('T')[0]))].sort((a, b) => b.localeCompare(a));
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const trained = uniqueDates.includes(dateStr);
        const label = i === 0 ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' });
        days.push({ date: dateStr, trained, label });
      }
      setRecentDays(days);
    } catch (err) {}
  };

  const strokeDashoffset = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [CIRCUMFERENCE, 0],
  });

  const getCopy = () => {
    if (streak === 0) return { main: "Day one starts now.", sub: "Track your first workout to start your streak." };
    if (streak === 1) return { main: "One down.", sub: "Come back tomorrow to keep it going." };
    if (streak < 5) return { main: "Building momentum.", sub: "The best thing you can do for your body is be consistent." };
    if (streak < 10) return { main: `${streak} days in.`, sub: "This is what showing up looks like." };
    if (streak < 21) return { main: "Locked in.", sub: "Your body is adapting. Keep the pressure on." };
    if (streak < 30) return { main: "This is a lifestyle.", sub: "Not a phase. Not a resolution. A lifestyle." };
    if (streak < 60) return { main: "Built different.", sub: "Most people talk about it. You do it." };
    return { main: `${streak} days.`, sub: "That number speaks for itself." };
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <LinearGradient colors={theme.gradientBg} style={StyleSheet.absoluteFillObject} />

      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <Text style={[styles.backText, { color: theme.textSecondary }]}>← Back</Text>
      </TouchableOpacity>

      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>

        {/* Ring */}
        <View style={styles.ringContainer}>
          <View style={{
            width: RING_SIZE, height: RING_SIZE,
            borderRadius: RING_SIZE / 2,
            borderWidth: 10,
            borderColor: 'rgba(157,78,221,0.2)',
            position: 'absolute',
          }} />
          <View style={{
            width: RING_SIZE - 20, height: RING_SIZE - 20,
            borderRadius: (RING_SIZE - 20) / 2,
            borderWidth: 10,
            borderColor: '#9d4edd',
            borderTopColor: 'transparent',
            borderRightColor: 'transparent',
            position: 'absolute',
            transform: [{ rotate: '-45deg' }],
          }} />
          {/* Center content */}
          <View style={styles.ringCenter}>
            <Text style={[styles.streakNum, { color: theme.text }]}>{streak}</Text>
            <Text style={[styles.streakLabel, { color: theme.accent }]}>DAYS</Text>
          </View>
        </View>

        {/* Copy */}
        <Text style={[styles.copy, { color: theme.text }]}>{getCopy().main}</Text>
        <Text style={[styles.copySub, { color: theme.textSecondary }]}>{getCopy().sub}</Text>

        {/* 7 day calendar */}
        <View style={[styles.calendar, { backgroundColor: theme.bgCard, borderColor: theme.bgCardBorder }]}>
          <Text style={[styles.calendarLabel, { color: theme.textTertiary }]}>THIS WEEK</Text>
          <View style={styles.daysRow}>
            {recentDays.map((day, i) => (
              <View key={i} style={styles.dayCol}>
                <View style={[styles.dayDot, {
                  backgroundColor: day.trained ? '#9d4edd' : 'transparent',
                  borderColor: day.trained ? '#9d4edd' : theme.bgCardBorder,
                }]}>
                  {day.trained && <Text style={styles.dayCheck}>✓</Text>}
                </View>
                <Text style={[styles.dayLabel, {
                  color: day.label === 'Today' ? theme.text : theme.textTertiary,
                  fontWeight: day.label === 'Today' ? '700' : '400',
                }]}>{day.label}</Text>
              </View>
            ))}
          </View>
        </View>

      </Animated.View>
    </View>
  );
}

const getStyles = (theme) => ({
  root: { flex: 1 },
  back: { position: 'absolute', top: 64, left: 24, zIndex: 10 },
  backText: { fontSize: 15, fontWeight: '600' },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  ringContainer: { position: 'relative', alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
  ringCenter: { position: 'absolute', alignItems: 'center' },
  streakNum: { fontSize: 72, fontWeight: '900', letterSpacing: -3, lineHeight: 72 },
  streakLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 4, marginTop: 4 },
  copy: { fontSize: 26, fontWeight: '900', letterSpacing: -0.5, textAlign: 'center', marginBottom: 8 },
  copySub: { fontSize: 14, fontWeight: '400', textAlign: 'center', lineHeight: 20, marginBottom: 36, paddingHorizontal: 8 },
  calendar: { width: '100%', borderRadius: 20, borderWidth: 1, padding: 20 },
  calendarLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 3, marginBottom: 16, textAlign: 'center' },
  daysRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dayCol: { alignItems: 'center', gap: 6 },
  dayDot: { width: 32, height: 32, borderRadius: 16, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  dayCheck: { fontSize: 13, fontWeight: '800', color: '#ffffff' },
  dayLabel: { fontSize: 9, letterSpacing: 0.3 },
});
