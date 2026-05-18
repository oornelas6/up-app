import { StyleSheet, Text, View, TouchableOpacity, Dimensions, ScrollView, Alert, Image, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useRef } from 'react';
import ViewShot from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 48;
const CARD_HEIGHT = CARD_WIDTH * 1.6;

export default function ShareScreen({ navigation, route }) {
  const { sets = [], split = 'Workout', duration = 0 } = route.params || {};
  const [activeCard, setActiveCard] = useState(0);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const cardRef = useRef(null);
  const flatListRef = useRef(null);

  const totalSets = sets.length;
  const totalReps = sets.reduce((sum, s) => sum + (parseInt(s.reps) || 0), 0);
  const totalVolume = sets.reduce((sum, s) => sum + ((parseFloat(s.weight) || 0) * (parseInt(s.reps) || 0)), 0);
  const prs = sets.filter(s => s.isPR === true || s.isPR === 'true').length;
  const uniqueExercises = [...new Set(sets.map(s => s.exercise))];

  const bestSet = sets.reduce((best, s) => {
    const est = parseFloat(s.weight) * (1 + parseInt(s.reps) / 30);
    const bestEst = parseFloat(best?.weight || 0) * (1 + parseInt(best?.reps || 0) / 30);
    return est > bestEst ? s : best;
  }, sets[0]);

  const isPRSession = prs > 0;
  const prSet = sets.find(s => s.isPR === true || s.isPR === 'true') || bestSet;
  const heroSet = isPRSession ? prSet : bestSet;

  const formatDuration = (s) => {
    if (!s) return null;
    return `${Math.floor(s / 60)}m`;
  };

  const formatVolume = (vol) => {
    if (vol >= 1000) return `${(vol / 1000).toFixed(1)}k`;
    return Math.round(vol).toString();
  };

  const today = new Date().toLocaleDateString('en-US', {
    month: 'short', day: 'numeric'
  }).toUpperCase();

  const handleSave = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Allow access to save to your camera roll.');
        return;
      }
      const uri = await cardRef.current.capture();
      await MediaLibrary.saveToLibraryAsync(uri);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      Alert.alert('Error', 'Failed to save: ' + err.message);
    }
  };

  const handleCopyImage = async () => {
    try {
      const uri = await cardRef.current.capture();
      await Clipboard.setImageAsync(uri);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      Alert.alert('Could not copy image', 'Try saving to camera roll instead.');
    }
  };

  const CARDS = ['Dark', 'Glow', 'Light', 'Clear'];

  const CardContent = ({ textColor, subColor, accentColor, dividerColor }) => (
    <View style={[styles.cardInner, { height: CARD_HEIGHT }]}>

      {/* Top — date + split */}
      <View style={styles.cardTop}>
        <View>
          <Text style={[styles.cardDate, { color: subColor }]}>{today}</Text>
          <Text style={[styles.cardSplit, { color: textColor }]}>{split}</Text>
        </View>
        <Image
          source={require('../assets/logo.png')}
          style={[styles.cardLogo, { tintColor: textColor }]}
          resizeMode="contain"
        />
      </View>

      {/* Hero — the flex */}
      <View style={styles.heroSection}>
        {isPRSession && (
          <View style={[styles.prBadge, { borderColor: accentColor }]}>
            <Text style={[styles.prBadgeText, { color: accentColor }]}>PERSONAL RECORD</Text>
          </View>
        )}
        {!isPRSession && (
          <Text style={[styles.heroLabel, { color: subColor }]}>BEST SET</Text>
        )}
        <Text style={[styles.heroWeight, { color: textColor }]}>{heroSet?.weight}</Text>
        <Text style={[styles.heroMeta, { color: subColor }]}>
          {heroSet?.unit}  ·  {heroSet?.reps} reps
        </Text>
        <Text style={[styles.heroExercise, { color: subColor }]}>{heroSet?.exercise}</Text>
      </View>

      {/* Stats strip */}
      <View style={[styles.statsStrip, { borderTopColor: dividerColor }]}>
        <View style={styles.stripStat}>
          <Text style={[styles.stripVal, { color: textColor }]}>{totalSets}</Text>
          <Text style={[styles.stripLbl, { color: subColor }]}>SETS</Text>
        </View>
        <View style={[styles.stripDivider, { backgroundColor: dividerColor }]} />
        <View style={styles.stripStat}>
          <Text style={[styles.stripVal, { color: textColor }]}>{formatVolume(totalVolume)}</Text>
          <Text style={[styles.stripLbl, { color: subColor }]}>VOLUME</Text>
        </View>
        <View style={[styles.stripDivider, { backgroundColor: dividerColor }]} />
        <View style={styles.stripStat}>
          <Text style={[styles.stripVal, { color: textColor }]}>{uniqueExercises.length}</Text>
          <Text style={[styles.stripLbl, { color: subColor }]}>EXERCISES</Text>
        </View>
        {formatDuration(duration) && (
          <>
            <View style={[styles.stripDivider, { backgroundColor: dividerColor }]} />
            <View style={styles.stripStat}>
              <Text style={[styles.stripVal, { color: textColor }]}>{formatDuration(duration)}</Text>
              <Text style={[styles.stripLbl, { color: subColor }]}>TIME</Text>
            </View>
          </>
        )}
      </View>

      {/* Brand footer */}
      <View style={styles.cardFooter}>
        <Text style={[styles.cardSlogan, { color: subColor }]}>get UP.</Text>
      </View>
    </View>
  );

  const DarkCard = () => (
    <View style={[styles.card, { backgroundColor: '#08000f', borderColor: 'rgba(157,78,221,0.25)' }]}>
      <CardContent textColor="#ffffff" subColor="rgba(255,255,255,0.35)" accentColor="#f0a500" dividerColor="rgba(255,255,255,0.08)" />
    </View>
  );

  const GlowCard = () => (
    <View style={[styles.card, { borderColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' }]}>
      <LinearGradient colors={['#2d0060', '#08000f']} start={{ x: 0.2, y: 0 }} end={{ x: 0.8, y: 1 }} style={StyleSheet.absoluteFillObject} />
      <View style={styles.glowOrb} />
      <View style={styles.glowOrb2} />
      <CardContent textColor="#ffffff" subColor="rgba(255,255,255,0.4)" accentColor="#f0a500" dividerColor="rgba(255,255,255,0.1)" />
    </View>
  );

  const LightCard = () => (
    <View style={[styles.card, { backgroundColor: '#f8f5ff', borderColor: 'rgba(0,0,0,0.05)' }]}>
      <CardContent textColor="#0d001a" subColor="rgba(13,0,26,0.38)" accentColor="#7b2cbf" dividerColor="rgba(0,0,0,0.07)" />
    </View>
  );

  const ClearCard = () => (
    <View style={[styles.card, { backgroundColor: 'rgba(0,0,0,0.12)', borderColor: 'rgba(255,255,255,0.18)' }]}>
      <CardContent textColor="#ffffff" subColor="rgba(255,255,255,0.55)" accentColor="#f0a500" dividerColor="rgba(255,255,255,0.15)" />
    </View>
  );

  const CARD_COMPONENTS = [DarkCard, GlowCard, LightCard, ClearCard];
  const ActiveCaptureCard = CARD_COMPONENTS[activeCard];

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#0d0020', '#080010']} style={StyleSheet.absoluteFillObject} />

      {/* Hidden capture */}
      <ViewShot ref={cardRef} options={{ format: 'png', quality: 1.0 }}
        style={{ position: 'absolute', top: -9999, left: 24, width: CARD_WIDTH }}>
        <ActiveCaptureCard />
      </ViewShot>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SHARE</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        <FlatList
          ref={flatListRef}
          data={CARD_COMPONENTS}
          horizontal
          pagingEnabled={false}
          snapToInterval={width}
          snapToAlignment="center"
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          style={{ marginHorizontal: -24 }}
          onLayout={() => setTimeout(() => flatListRef.current?.scrollToOffset({ offset: 0, animated: false }), 50)}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / width);
            setActiveCard(index);
          }}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item: CardComponent }) => (
            <View style={{ width, paddingHorizontal: 24 }}>
              <CardComponent />
            </View>
          )}
        />

        <View style={styles.selectorRow}>
          {CARDS.map((name, i) => (
            <TouchableOpacity key={i} style={styles.selectorBtn} onPress={() => {
              setActiveCard(i);
              flatListRef.current?.scrollToOffset({ offset: width * i, animated: true });
            }}>
              <View style={[styles.selectorDot, activeCard === i && styles.selectorDotActive]} />
              <Text style={[styles.selectorLabel, activeCard === i && styles.selectorLabelActive]}>{name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.primaryBtn} onPress={handleSave} activeOpacity={0.85}>
          <LinearGradient colors={saved ? ['#4caf50', '#2e7d32'] : ['#7b2cbf', '#4a0080']} style={styles.primaryBtnGradient}>
            <Text style={styles.primaryBtnText}>{saved ? '✓ Saved to Camera Roll' : 'Save to Camera Roll'}</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn} onPress={handleCopyImage} activeOpacity={0.8}>
          <Text style={styles.secondaryBtnText}>{copied ? '✓ Copied to Clipboard' : 'Copy to Clipboard'}</Text>
        </TouchableOpacity>

        <View style={{ height: 48 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#080010' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 64, paddingBottom: 20 },
  back: { color: 'rgba(255,255,255,0.4)', fontSize: 15, fontWeight: '600', width: 60 },
  headerTitle: { fontSize: 12, fontWeight: '800', color: 'rgba(255,255,255,0.6)', letterSpacing: 3 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 40 },
  card: { width: CARD_WIDTH, borderRadius: 28, borderWidth: 1, overflow: 'hidden', marginBottom: 24 },
  cardInner: { padding: 28, justifyContent: 'space-between' },
  glowOrb: { position: 'absolute', width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(123,44,191,0.45)', top: -100, right: -80 },
  glowOrb2: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(60,0,120,0.3)', bottom: -60, left: -60 },
  // Card top
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardDate: { fontSize: 10, fontWeight: '700', letterSpacing: 2, marginBottom: 5 },
  cardSplit: { fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
  cardLogo: { width: 32, height: 32, opacity: 0.85 },
  // Hero
  heroSection: { flex: 1, justifyContent: 'center', paddingVertical: 8 },
  prBadge: { borderWidth: 1, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start', marginBottom: 16 },
  prBadgeText: { fontSize: 9, fontWeight: '800', letterSpacing: 2.5 },
  heroLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 3, marginBottom: 10 },
  heroWeight: { fontSize: 96, fontWeight: '900', letterSpacing: -5, lineHeight: 96, marginBottom: 10 },
  heroMeta: { fontSize: 17, fontWeight: '600', letterSpacing: -0.3, marginBottom: 6 },
  heroExercise: { fontSize: 12, fontWeight: '500', letterSpacing: 0.5 },
  // Stats strip
  statsStrip: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, paddingTop: 18 },
  stripStat: { flex: 1, alignItems: 'center' },
  stripVal: { fontSize: 17, fontWeight: '900', letterSpacing: -0.5 },
  stripLbl: { fontSize: 7, fontWeight: '700', letterSpacing: 2, marginTop: 3 },
  stripDivider: { width: 1, height: 22 },
  // Brand footer
  cardFooter: { alignItems: 'flex-end', marginTop: 16 },
  cardSlogan: { fontSize: 14, fontWeight: '700', letterSpacing: 2 },
  // Selector
  selectorRow: { flexDirection: 'row', justifyContent: 'center', gap: 28, marginBottom: 32 },
  selectorBtn: { alignItems: 'center', gap: 6 },
  selectorDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.15)' },
  selectorDotActive: { backgroundColor: '#9d4edd', width: 20, borderRadius: 3 },
  selectorLabel: { fontSize: 11, color: 'rgba(255,255,255,0.25)', fontWeight: '600', letterSpacing: 1 },
  selectorLabelActive: { color: '#ffffff' },
  // Buttons
  primaryBtn: { marginBottom: 12 },
  primaryBtnGradient: { paddingVertical: 18, borderRadius: 16, alignItems: 'center' },
  primaryBtnText: { color: '#ffffff', fontSize: 14, fontWeight: '800', letterSpacing: 2 },
  secondaryBtn: { paddingVertical: 16, alignItems: 'center' },
  secondaryBtnText: { color: 'rgba(255,255,255,0.25)', fontSize: 14, fontWeight: '600', letterSpacing: 0.5 },
});
