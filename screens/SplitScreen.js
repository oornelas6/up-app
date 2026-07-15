import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Dimensions, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Logo from '../components/Logo';
import { useEffect, useRef, useState } from 'react';
import { Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import * as Haptics from 'expo-haptics';

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

const SplitCard = ({ split, index, onPress, styles, recommended }) => {
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
  const styles = getStyles(theme);
  const [recommendedSplit, setRecommendedSplit] = useState(null);
  const [lastSplit, setLastSplit] = useState(null);
  const [lastSplitSets, setLastSplitSets] = useState([]);
  const [selectedSplit, setSelectedSplit] = useState(null);
  const [showLoadout, setShowLoadout] = useState(false);
  const slideAnim = useRef(new Animated.Value(400)).current;

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
        if (todaysSplit && todaysSplit !== 'Rest') setRecommendedSplit(todaysSplit);
      }
      const userId = await AsyncStorage.getItem('user_id') || 'user-test-001';
      const response = await fetch(
        `https://lurl0xn2b7.execute-api.us-east-1.amazonaws.com/history?userId=${userId}`
      );
      const data = await response.json();
      const sets = data.sets || [];
      if (sets.length > 0) {
        setLastSplit(sets[0].split);
        setLastSplitSets(sets.filter(s => s.split === sets[0].split).slice(0, 4));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openLoadout = (split) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedSplit(split);
    setShowLoadout(true);
    Animated.spring(slideAnim, { toValue: 0, tension: 65, friction: 11, useNativeDriver: true }).start();
  };

  const closeLoadout = () => {
    Animated.timing(slideAnim, { toValue: 400, duration: 250, useNativeDriver: true }).start(() => {
      setShowLoadout(false);
      setSelectedSplit(null);
    });
  };

  const startWorkout = (split) => {
    closeLoadout();
    setTimeout(() => navigation.navigate('Workout', { split }), 280);
  };

  const splitData = SPLITS.find(s => s.name === selectedSplit);
  const isLastSplit = selectedSplit === lastSplit;

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <LinearGradient colors={theme.gradientBg} style={StyleSheet.absoluteFillObject} />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.back}>← Back</Text>
          </TouchableOpacity>
          <Logo size={36} onPress={() => navigation.navigate('HomeTab')} />
        </View>

        <Text style={[styles.title, { color: theme.text }]}>What are we{'\n'}training?</Text>

        {recommendedSplit && (
          <TouchableOpacity
            style={styles.recommendBanner}
            activeOpacity={0.8}
            onPress={() => openLoadout(recommendedSplit)}
          >
            <LinearGradient colors={theme.gradientBtn} style={styles.recommendBannerGradient}>
              <View>
                <Text style={[styles.recommendLabel, { color: theme.btnText === '#1a0035' ? 'rgba(26,0,53,0.6)' : 'rgba(255,255,255,0.6)' }]}>RECOMMENDED FOR TODAY</Text>
                <Text style={[styles.recommendSplit, { color: theme.btnText }]}>{recommendedSplit} Day →</Text>
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
              onPress={() => openLoadout(split.name)}
              styles={styles}
            />
          ))}
        </ScrollView>
      </View>

      {/* Loadout bottom sheet */}
      <Modal visible={showLoadout} transparent animationType="none" onRequestClose={closeLoadout}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={closeLoadout} />
        <Animated.View style={[styles.sheet, { backgroundColor: theme.bgSecondary, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.sheetHandle} />

          <View style={styles.sheetHeader}>
            <View>
              <Text style={[styles.sheetTitle, { color: theme.text }]}>{selectedSplit} Day</Text>
              <Text style={[styles.sheetSub, { color: theme.textTertiary }]}>
                {splitData?.label} · {splitData?.count} exercises
              </Text>
            </View>
          </View>

          {/* Last session preview */}
          {isLastSplit && lastSplitSets.length > 0 && (
            <View style={[styles.lastPreview, { backgroundColor: theme.bgCard, borderColor: theme.bgCardBorder }]}>
              <Text style={[styles.lastPreviewLabel, { color: theme.textTertiary }]}>LAST SESSION</Text>
              <View style={styles.lastPreviewExercises}>
                {lastSplitSets.map((s, i) => (
                  <Text key={i} style={[styles.lastPreviewEx, { color: theme.textSecondary }]}>
                    {s.exercise} — {s.weight} {s.unit} × {s.reps}
                  </Text>
                ))}
              </View>
            </View>
          )}

          {/* Options */}
          <TouchableOpacity
            style={styles.loadoutOption}
            activeOpacity={0.8}
            onPress={() => startWorkout(selectedSplit)}
          >
            <LinearGradient colors={theme.gradientBtn} style={styles.loadoutOptionGradient}>
              <Text style={[styles.loadoutOptionTitle, { color: theme.btnText }]}>
                {selectedSplit === recommendedSplit ? "Start Today's Session" : "Let's Work"}
              </Text>
              <Text style={[styles.loadoutOptionSub, { color: theme.btnText === '#1a0035' ? 'rgba(26,0,53,0.55)' : 'rgba(255,255,255,0.55)' }]}>
                Your weights are ready
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loadoutSecondary, { borderColor: theme.bgCardBorder }]}
            activeOpacity={0.7}
            onPress={closeLoadout}
          >
            <Text style={[styles.loadoutSecondaryText, { color: theme.textSecondary }]}>Maybe later</Text>
          </TouchableOpacity>

        </Animated.View>
      </Modal>
    </View>
  );
}

const getStyles = (theme) => ({
  root: { flex: 1, backgroundColor: '#080010' },
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 64, paddingBottom: 0 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  back: { color: theme.textSecondary, fontSize: 15, fontWeight: '600' },
  title: { fontSize: 38, fontWeight: '900', color: theme.text, letterSpacing: -1, lineHeight: 44 },
  recommendBanner: { marginTop: 20, marginBottom: 4, borderRadius: 16, overflow: 'hidden' },
  recommendBannerGradient: { paddingVertical: 16, paddingHorizontal: 20, borderRadius: 16 },
  recommendLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 3, marginBottom: 4 },
  recommendSplit: { fontSize: 22, fontWeight: '900', letterSpacing: -0.5 },
  lastSessionBanner: { marginTop: 16, marginBottom: 4 },
  lastSessionBannerText: { fontSize: 12, color: theme.textTertiary, letterSpacing: 0.5 },
  card: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 20, paddingHorizontal: 20, marginBottom: 10, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderRadius: 18 },
  cardRecommended: { borderColor: 'rgba(157,78,221,0.4)', backgroundColor: 'rgba(123,44,191,0.08)' },
  cardLeft: { flex: 1 },
  cardNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  cardName: { fontSize: 20, fontWeight: '800', color: theme.text, letterSpacing: -0.3 },
  todayBadge: { backgroundColor: 'rgba(157,78,221,0.2)', borderWidth: 1, borderColor: 'rgba(157,78,221,0.4)', borderRadius: 100, paddingHorizontal: 8, paddingVertical: 2 },
  todayBadgeText: { fontSize: 9, fontWeight: '800', color: '#9d4edd', letterSpacing: 2 },
  cardLabel: { fontSize: 12, color: theme.textTertiary, fontWeight: '400', letterSpacing: 0.3 },
  cardRight: { alignItems: 'flex-end', marginLeft: 16 },
  cardCount: { fontSize: 22, fontWeight: '800', color: 'rgba(157,78,221,0.7)', letterSpacing: -0.5 },
  cardCountLabel: { fontSize: 10, color: theme.textTertiary, fontWeight: '500', letterSpacing: 1, marginTop: 2 },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: { position: 'absolute', bottom: 0, left: 0, right: 0, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 28, paddingBottom: 48 },
  sheetHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.15)', alignSelf: 'center', marginBottom: 24 },
  sheetHeader: { marginBottom: 20 },
  sheetTitle: { fontSize: 28, fontWeight: '900', letterSpacing: -0.5, marginBottom: 4 },
  sheetSub: { fontSize: 13, fontWeight: '400', letterSpacing: 0.3 },
  lastPreview: { borderRadius: 14, padding: 14, marginBottom: 20, borderWidth: 1 },
  lastPreviewLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 2, marginBottom: 8 },
  lastPreviewExercises: { gap: 4 },
  lastPreviewEx: { fontSize: 13, fontWeight: '500' },
  loadoutOption: { borderRadius: 18, overflow: 'hidden', marginBottom: 12 },
  loadoutOptionGradient: { paddingVertical: 20, paddingHorizontal: 24, borderRadius: 18 },
  loadoutOptionTitle: { fontSize: 17, fontWeight: '800', letterSpacing: -0.3, marginBottom: 3 },
  loadoutOptionSub: { fontSize: 12, fontWeight: '400' },
  loadoutSecondary: { paddingVertical: 16, alignItems: 'center', borderRadius: 14, borderWidth: 1 },
  loadoutSecondaryText: { fontSize: 14, fontWeight: '600' },
});
