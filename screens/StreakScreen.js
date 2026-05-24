import { StyleSheet, Text, View, TouchableOpacity, Animated, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import * as Haptics from 'expo-haptics';

const API_BASE = 'https://lurl0xn2b7.execute-api.us-east-1.amazonaws.com';

export default function StreakScreen({ navigation, route }) {
  const { streak = 0 } = route.params || {};
  const theme = useTheme();
  const styles = getStyles(theme);
  const flameAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [recentDays, setRecentDays] = useState([]);

  useEffect(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Flame pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(flameAnim, { toValue: 1.08, duration: 800, useNativeDriver: true }),
        Animated.timing(flameAnim, { toValue: 0.95, duration: 800, useNativeDriver: true }),
      ])
    ).start();

    // Fade in
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();

    loadRecentDays();
  }, []);

  const loadRecentDays = async () => {
    try {
      const userId = await AsyncStorage.getItem('user_id') || 'user-test-001';
      const response = await fetch(`${API_BASE}/history?userId=${userId}`);
      const data = await response.json();
      const sets = data.sets || [];
      const uniqueDates = [...new Set(sets.map(s => s.timestamp?.split('T')[0]))].sort((a, b) => b.localeCompare(a));
      
      // Build last 7 days
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const trained = uniqueDates.includes(dateStr);
        const dayName = i === 0 ? 'Today' : i === 1 ? 'Yesterday' : d.toLocaleDateString('en-US', { weekday: 'short' });
        days.push({ date: dateStr, trained, label: dayName });
      }
      setRecentDays(days);
    } catch (err) {
      console.error(err);
    }
  };

  const getMotivationalCopy = () => {
    if (streak === 0) return { title: "Start your streak.", sub: "Every legend starts at zero. Today is day one." };
    if (streak === 1) return { title: "Day one done.", sub: "The hardest part is starting. You did it." };
    if (streak < 5) return { title: "You\'re building something.", sub: "Keep showing up. The streak is just the proof." };
    if (streak < 10) return { title: "This is a habit now.", sub: "Most people quit by day 3. You\'re past that." };
    if (streak < 30) return { title: "Locked in.", sub: "This is what consistency looks like. Don\'t stop now." };
    if (streak < 60) return { title: "Elite level.", sub: "You\'ve been showing up longer than most people last. Keep going." };
    return { title: "Unstoppable.", sub: "This kind of dedication changes lives. Keep going." };
  };

  const copy = getMotivationalCopy();

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <LinearGradient colors={theme.gradientBg} style={StyleSheet.absoluteFillObject} />
      
      <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
        <Text style={[styles.closeText, { color: theme.textSecondary }]}>← Back</Text>
      </TouchableOpacity>

      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        
        {/* Flame */}
        <Animated.Text style={[styles.flame, { transform: [{ scale: flameAnim }] }]}>
          🔥
        </Animated.Text>

        {/* Streak number */}
        <Text style={[styles.streakNum, { color: theme.text }]}>{streak}</Text>
        <Text style={[styles.streakLabel, { color: theme.accent }]}>DAY STREAK</Text>

        {/* Motivational copy */}
        <Text style={[styles.copyTitle, { color: theme.text }]}>{copy.title}</Text>
        <Text style={[styles.copySub, { color: theme.textSecondary }]}>{copy.sub}</Text>

        {/* Last 7 days */}
        <View style={[styles.daysContainer, { backgroundColor: theme.bgCard, borderColor: theme.bgCardBorder }]}>
          <Text style={[styles.daysLabel, { color: theme.textTertiary }]}>LAST 7 DAYS</Text>
          <View style={styles.daysRow}>
            {recentDays.map((day, i) => (
              <View key={i} style={styles.dayItem}>
                <View style={[styles.dayCircle, {
                  backgroundColor: day.trained ? theme.accent : 'transparent',
                  borderColor: day.trained ? theme.accent : theme.bgCardBorder,
                }]}>
                  <Text style={[styles.dayCheck, { color: day.trained ? '#ffffff' : theme.textTertiary }]}>
                    {day.trained ? '✓' : '·'}
                  </Text>
                </View>
                <Text style={[styles.dayName, { color: day.trained ? theme.text : theme.textTertiary }]}>
                  {day.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* CTA */}
        {streak > 0 && (
          <Text style={[styles.cta, { color: theme.textTertiary }]}>
            Come back tomorrow to keep your streak alive.
          </Text>
        )}

      </Animated.View>
    </View>
  );
}

const getStyles = (theme) => ({
  root: { flex: 1 },
  closeBtn: { position: 'absolute', top: 64, left: 24, zIndex: 10 },
  closeText: { fontSize: 15, fontWeight: '600' },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, paddingBottom: 40 },
  flame: { fontSize: 80, marginBottom: 16 },
  streakNum: { fontSize: 96, fontWeight: '900', letterSpacing: -4, lineHeight: 96 },
  streakLabel: { fontSize: 12, fontWeight: '800', letterSpacing: 4, marginBottom: 28 },
  copyTitle: { fontSize: 28, fontWeight: '900', letterSpacing: -0.5, textAlign: 'center', marginBottom: 8 },
  copySub: { fontSize: 15, fontWeight: '400', textAlign: 'center', lineHeight: 22, marginBottom: 36 },
  daysContainer: { width: '100%', borderRadius: 20, borderWidth: 1, padding: 20, marginBottom: 28 },
  daysLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 3, marginBottom: 16, textAlign: 'center' },
  daysRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dayItem: { alignItems: 'center', gap: 6 },
  dayCircle: { width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  dayCheck: { fontSize: 14, fontWeight: '800' },
  dayName: { fontSize: 9, fontWeight: '600', letterSpacing: 0.5 },
  cta: { fontSize: 13, fontWeight: '500', textAlign: 'center', lineHeight: 20 },
});
