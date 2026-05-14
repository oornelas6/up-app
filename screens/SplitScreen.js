import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Logo from '../components/Logo';
import { useEffect, useRef, useState } from 'react';
import { Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

const SPLITS = [
  { name: 'Push', label: 'Chest · Shoulders · Triceps', count: 12 },
  { name: 'Pull', label: 'Back · Biceps · Rear Delts', count: 11 },
  { name: 'Legs', label: 'Quads · Hamstrings · Glutes · Calves', count: 11 },
  { name: 'Arms', label: 'Biceps · Triceps · Shoulders', count: 10 },
  { name: 'Upper', label: 'Full Upper Body', count: 7 },
  { name: 'Lower', label: 'Full Lower Body', count: 7 },
  { name: 'Full Body', label: 'Everything', count: 8 },
  { name: 'Custom', label: 'Build your own', count: 0 },
];

const SplitCard = ({ split, index, onPress, recommended }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, delay: index * 60, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, delay: index * 60, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <TouchableOpacity
        style={[styles.card, recommended && styles.cardRecommended]}
        activeOpacity={0.7}
        onPress={onPress}
      >
        <View style={styles.cardLeft}>
          <View style={styles.cardNameRow}>
            <Text style={styles.cardName}>{split.name}</Text>
            {recommended && (
              <View style={styles.todayBadge}>
                <Text style={styles.todayBadgeText}>TODAY</Text>
              </View>
            )}
          </View>
          <Text style={styles.cardLabel}>{split.label}</Text>
        </View>
        <View style={styles.cardRight}>
          <Text style={styles.cardCount}>{split.count}</Text>
          <Text style={styles.cardCountLabel}>exercises</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function SplitScreen({ navigation }) {
  const theme = useTheme();
  const [recommendedSplit, setRecommendedSplit] = useState(null);
  const [lastSplit, setLastSplit] = useState(null);

  useEffect(() => {
    loadRecommendation();
  }, []);

  const loadRecommendation = async () => {
    try {
      const activeSplitStr = await AsyncStorage.getItem('active_split');
      if (activeSplitStr) {
        const activeSplit = JSON.parse(activeSplitStr);
        const dayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
        const todaysSplit = activeSplit.schedule[dayIndex];
        if (todaysSplit && todaysSplit !== 'Rest') {
          setRecommendedSplit(todaysSplit);
        }
      }

      const userId = await AsyncStorage.getItem('user_id') || 'user-test-001';
      const response = await fetch(
        `https://lurl0xn2b7.execute-api.us-east-1.amazonaws.com/history?userId=${userId}`
      );
      const data = await response.json();
      const sets = data.sets || [];
      if (sets.length > 0) {
        setLastSplit(sets[0].split);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <LinearGradient colors={theme.gradientBg} style={StyleSheet.absoluteFillObject} />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.back}>← Back</Text>
          </TouchableOpacity>
          <Logo size={36} />
        </View>

        <Text style={[styles.title, { color: theme.text }]}>What are we{'\n'}training?</Text>

        {recommendedSplit && (
          <TouchableOpacity
            style={styles.recommendBanner}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Workout', { split: recommendedSplit })}
          >
            <LinearGradient colors={['#7b2cbf', '#4a0080']} style={styles.recommendBannerGradient}>
              <View>
                <Text style={styles.recommendLabel}>RECOMMENDED FOR TODAY</Text>
                <Text style={styles.recommendSplit}>{recommendedSplit} Day →</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {lastSplit && !recommendedSplit && (
          <View style={styles.lastSessionBanner}>
            <Text style={styles.lastSessionBannerText}>Last session: {lastSplit}</Text>
          </View>
        )}

        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ marginTop: 16 }}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {SPLITS.map((split, index) => (
            <SplitCard
              key={split.name}
              split={split}
              index={index}
              recommended={split.name === recommendedSplit}
              onPress={() => navigation.navigate('Workout', { split: split.name })}
            />
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#080010' },
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 64, paddingBottom: 0 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  back: { color: 'rgba(255,255,255,0.4)', fontSize: 15, fontWeight: '600' },
  title: { fontSize: 38, fontWeight: '900', color: '#ffffff', letterSpacing: -1, lineHeight: 44 },
  recommendBanner: { marginTop: 20, marginBottom: 4, borderRadius: 16, overflow: 'hidden' },
  recommendBannerGradient: { paddingVertical: 16, paddingHorizontal: 20, borderRadius: 16 },
  recommendLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 3, color: 'rgba(255,255,255,0.6)', marginBottom: 4 },
  recommendSplit: { fontSize: 22, fontWeight: '900', color: '#ffffff', letterSpacing: -0.5 },
  lastSessionBanner: { marginTop: 16, marginBottom: 4 },
  lastSessionBannerText: { fontSize: 12, color: 'rgba(255,255,255,0.25)', letterSpacing: 0.5 },
  card: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 20, paddingHorizontal: 20, marginBottom: 10, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderRadius: 18 },
  cardRecommended: { borderColor: 'rgba(157,78,221,0.4)', backgroundColor: 'rgba(123,44,191,0.08)' },
  cardLeft: { flex: 1 },
  cardNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  cardName: { fontSize: 20, fontWeight: '800', color: '#ffffff', letterSpacing: -0.3 },
  todayBadge: { backgroundColor: 'rgba(157,78,221,0.2)', borderWidth: 1, borderColor: 'rgba(157,78,221,0.4)', borderRadius: 100, paddingHorizontal: 8, paddingVertical: 2 },
  todayBadgeText: { fontSize: 9, fontWeight: '800', color: '#9d4edd', letterSpacing: 2 },
  cardLabel: { fontSize: 12, color: 'rgba(255,255,255,0.25)', fontWeight: '400', letterSpacing: 0.3 },
  cardRight: { alignItems: 'flex-end', marginLeft: 16 },
  cardCount: { fontSize: 22, fontWeight: '800', color: 'rgba(157,78,221,0.7)', letterSpacing: -0.5 },
  cardCountLabel: { fontSize: 10, color: 'rgba(255,255,255,0.2)', fontWeight: '500', letterSpacing: 1, marginTop: 2 },
});
