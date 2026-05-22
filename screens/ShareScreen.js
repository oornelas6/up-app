import { StyleSheet, Text, View, TouchableOpacity, Dimensions, ScrollView, Alert, Image, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useRef } from 'react';
import ViewShot from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 48;

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

  const formatDuration = (s) => { if (!s) return null; return `${Math.floor(s / 60)}m`; };
  const formatVolume = (vol) => { if (vol >= 1000) return `${(vol / 1000).toFixed(1)}k`; return Math.round(vol).toString(); };
  const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();

  const handleSave = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') { Alert.alert('Permission needed', 'Allow access to save to your camera roll.'); return; }
      const uri = await cardRef.current.capture();
      await MediaLibrary.saveToLibraryAsync(uri);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) { Alert.alert('Error', 'Failed to save: ' + err.message); }
  };

  const handleCopyImage = async () => {
    try {
      const uri = await cardRef.current.capture();
      await Clipboard.setImageAsync(uri);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      Alert.alert('Copy failed', 'Image copy is not supported on this device. Use Save to Camera Roll instead.');
    }
  };

  const CARDS = ['Recap', 'PR', 'Minimal', 'Clear'];

  // ─── CARD 1: RECAP ────────────────────────────────────────────
  // Clean scorecard. Works for everyone, every workout.
  const RecapCard = ({ forCapture = false }) => (
    <View style={[styles.recapCard, forCapture && { margin: 0 }]}>
      <LinearGradient colors={['#1a0035', '#080010']} style={StyleSheet.absoluteFillObject} borderRadius={24} />

      {/* Large watermark logo */}
      <Image
        source={require('../assets/logo.png')}
        style={styles.recapWatermark}
        resizeMode="contain"
      />

      {/* Header */}
      <View style={styles.recapHeader}>
        <View>
          <Text style={styles.recapDate}>{today}</Text>
          <Text style={styles.recapSplit}>{split} Day</Text>
        </View>
      </View>





      {/* Stats strip */}
      <View style={styles.sharedStrip}>
        <View style={styles.sharedStat}>
          <Text style={styles.sharedVal}>{totalSets}</Text>
          <Text style={styles.sharedLbl}>SETS</Text>
        </View>
        <View style={styles.sharedDiv} />
        <View style={styles.sharedStat}>
          <Text style={styles.sharedVal}>{totalReps}</Text>
          <Text style={styles.sharedLbl}>REPS</Text>
        </View>
        <View style={styles.sharedDiv} />
        <View style={styles.sharedStat}>
          <Text style={styles.sharedVal}>{formatVolume(totalVolume)}</Text>
          <Text style={styles.sharedLbl}>VOLUME</Text>
        </View>
        <View style={styles.sharedDiv} />
        <View style={styles.sharedStat}>
          <Text style={styles.sharedVal}>{uniqueExercises.length}</Text>
          <Text style={styles.sharedLbl}>EXERCISES</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.recapFooter}>
        {prs > 0 && <Text style={styles.recapPRBadge}>🏆 {prs} PR{prs > 1 ? 's' : ''}</Text>}
        <Text style={styles.recapSlogan}>get UP.</Text>
      </View>
    </View>
  );

  // ─── CARD 2: PR ───────────────────────────────────────────────
  // The flex card. Big number. For when you hit something real.
  const PRCard = ({ forCapture = false }) => (
    <View style={[styles.prCard, forCapture && { margin: 0 }]}>
      <LinearGradient colors={['#3c096c', '#10002b']} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={StyleSheet.absoluteFillObject} borderRadius={24} />
      <View style={styles.prGlowOrb} />

      <View style={styles.prTop}>
        <Text style={styles.prDate}>{today}</Text>
        <Image source={require('../assets/logo.png')} style={[styles.prLogo, { tintColor: '#e0aaff' }]} resizeMode="contain" />
      </View>

      <View style={styles.prHero}>
        <View style={styles.prBadgeRow}>
          <Text style={styles.prBadgeLabel}>{isPRSession ? 'PERSONAL RECORD' : 'BEST SET'}</Text>
        </View>
        <Text style={styles.prNumber}>{heroSet?.weight}</Text>
        <Text style={styles.prUnit}>{heroSet?.unit} × {heroSet?.reps} reps</Text>
        <Text style={styles.prExercise}>{heroSet?.exercise}</Text>
      </View>

      <View style={[styles.sharedStrip, { borderTopColor: 'rgba(255,255,255,0.1)', marginBottom: 16 }]}>
        <View style={styles.sharedStat}>
          <Text style={styles.sharedVal}>{totalSets}</Text>
          <Text style={styles.sharedLbl}>SETS</Text>
        </View>
        <View style={styles.sharedDiv} />
        <View style={styles.sharedStat}>
          <Text style={styles.sharedVal}>{totalReps}</Text>
          <Text style={styles.sharedLbl}>REPS</Text>
        </View>
        <View style={styles.sharedDiv} />
        <View style={styles.sharedStat}>
          <Text style={styles.sharedVal}>{formatVolume(totalVolume)}</Text>
          <Text style={styles.sharedLbl}>VOLUME</Text>
        </View>
        <View style={styles.sharedDiv} />
        <View style={styles.sharedStat}>
          <Text style={styles.sharedVal}>{uniqueExercises.length}</Text>
          <Text style={styles.sharedLbl}>EXERCISES</Text>
        </View>
      </View>
      <View style={styles.prBottom}>
        <Text style={styles.prSplit}>{split}</Text>
        <Text style={styles.prSlogan}>get UP.</Text>
      </View>
    </View>
  );

  // ─── CARD 3: MINIMAL ──────────────────────────────────────────
  // For the aesthetic crowd. Almost nothing. Luxury brand energy.
  const MinimalCard = ({ forCapture = false }) => (
    <View style={[styles.minimalCard, forCapture && { margin: 0 }]}>
      <View style={styles.minimalInner}>
        <View style={styles.minimalTop}>
          <Text style={styles.minimalDate}>{today}</Text>
          <Image source={require('../assets/logo.png')} style={[styles.minimalLogo, { tintColor: '#1a0035' }]} resizeMode="contain" />
        </View>

        <View style={styles.minimalCenter}>
          <Text style={styles.minimalSplit}>{split}</Text>
          <View style={styles.minimalLine} />
          <View style={[styles.sharedStrip, { borderTopColor: 'rgba(26,0,53,0.08)', marginTop: 0 }]}>
            <View style={styles.sharedStat}><Text style={[styles.sharedVal, { color: '#1a0035' }]}>{totalSets}</Text><Text style={[styles.sharedLbl, { color: 'rgba(26,0,53,0.35)' }]}>SETS</Text></View>
            <View style={[styles.sharedDiv, { backgroundColor: 'rgba(26,0,53,0.1)' }]} />
            <View style={styles.sharedStat}><Text style={[styles.sharedVal, { color: '#1a0035' }]}>{totalReps}</Text><Text style={[styles.sharedLbl, { color: 'rgba(26,0,53,0.35)' }]}>REPS</Text></View>
            <View style={[styles.sharedDiv, { backgroundColor: 'rgba(26,0,53,0.1)' }]} />
            <View style={styles.sharedStat}><Text style={[styles.sharedVal, { color: '#1a0035' }]}>{formatVolume(totalVolume)}</Text><Text style={[styles.sharedLbl, { color: 'rgba(26,0,53,0.35)' }]}>VOLUME</Text></View>
            <View style={[styles.sharedDiv, { backgroundColor: 'rgba(26,0,53,0.1)' }]} />
            <View style={styles.sharedStat}><Text style={[styles.sharedVal, { color: '#1a0035' }]}>{uniqueExercises.length}</Text><Text style={[styles.sharedLbl, { color: 'rgba(26,0,53,0.35)' }]}>EXERCISES</Text></View>
          </View>
        </View>

        <View style={styles.minimalBottom}>
          <Text style={styles.minimalSlogan}>get UP.</Text>
        </View>
      </View>
    </View>
  );

  // ─── CARD 4: CLEAR ────────────────────────────────────────────
  // Transparent. Paste into IG story over your gym photo.
  const ClearCard = ({ forCapture = false }) => (
    <View style={[styles.clearCard, forCapture && { margin: 0, borderWidth: 0 }]}>
      <View style={styles.clearInner}>
        <View style={styles.clearTop}>
          <Text style={styles.clearDate}>{today}</Text>
          <Image source={require('../assets/logo.png')} style={[styles.clearLogo, { tintColor: '#ffffff' }]} resizeMode="contain" />
        </View>

        <View style={styles.clearCenter}>
          <Text style={styles.clearSplit}>{split}</Text>
          <View style={[styles.sharedStrip, { borderTopColor: 'rgba(255,255,255,0.2)', marginTop: 12 }]}>
            <View style={styles.sharedStat}><Text style={[styles.sharedVal, { color: '#ffffff' }]}>{totalSets}</Text><Text style={[styles.sharedLbl, { color: 'rgba(255,255,255,0.7)' }]}>SETS</Text></View>
            <View style={[styles.sharedDiv, { backgroundColor: 'rgba(255,255,255,0.2)' }]} />
            <View style={styles.sharedStat}><Text style={[styles.sharedVal, { color: '#ffffff' }]}>{totalReps}</Text><Text style={[styles.sharedLbl, { color: 'rgba(255,255,255,0.7)' }]}>REPS</Text></View>
            <View style={[styles.sharedDiv, { backgroundColor: 'rgba(255,255,255,0.2)' }]} />
            <View style={styles.sharedStat}><Text style={[styles.sharedVal, { color: '#ffffff' }]}>{formatVolume(totalVolume)}</Text><Text style={[styles.sharedLbl, { color: 'rgba(255,255,255,0.7)' }]}>VOLUME</Text></View>
            <View style={[styles.sharedDiv, { backgroundColor: 'rgba(255,255,255,0.2)' }]} />
            <View style={styles.sharedStat}><Text style={[styles.sharedVal, { color: '#ffffff' }]}>{uniqueExercises.length}</Text><Text style={[styles.sharedLbl, { color: 'rgba(255,255,255,0.7)' }]}>EXERCISES</Text></View>
          </View>
          {isPRSession && <Text style={styles.clearPR}>{prs} PR{prs > 1 ? 's' : ''} today</Text>}
        </View>

        <View style={styles.clearBottom}>
          <Text style={styles.clearSlogan}>get UP.</Text>
        </View>
      </View>
    </View>
  );

  const CARD_COMPONENTS = [RecapCard, PRCard, MinimalCard, ClearCard];
  const CAPTURE_MAP = {
    0: () => <RecapCard forCapture />,
    1: () => <PRCard forCapture />,
    2: () => <MinimalCard forCapture />,
    3: () => <ClearCard forCapture />,
  };
  const ActiveCaptureCard = CAPTURE_MAP[activeCard];

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#0d0020', '#080010']} style={StyleSheet.absoluteFillObject} />

      {/* Hidden capture */}
      <ViewShot ref={cardRef} options={{ format: 'png', quality: 1.0, result: 'tmpfile' }}
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

  // ── RECAP card
  recapCard: { width: CARD_WIDTH, borderRadius: 24, padding: 24, overflow: 'hidden', marginBottom: 24, minHeight: 320 },
  recapHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 },
  recapDate: { fontSize: 10, fontWeight: '700', letterSpacing: 2, color: 'rgba(255,255,255,0.35)', marginBottom: 4 },
  recapSplit: { fontSize: 72, fontWeight: '900', color: '#ffffff', letterSpacing: -3, lineHeight: 68, marginTop: 8 },
  recapLogo: { width: 52, height: 52, opacity: 0.9 },
  recapWatermark: { position: 'absolute', width: '95%', height: '95%', top: '2.5%', right: '-15%', tintColor: '#ffffff', opacity: 0.04 },
  recapGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  recapGridItem: { width: '47%', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: 16 },
  recapGridVal: { fontSize: 28, fontWeight: '900', color: '#ffffff', letterSpacing: -0.5, marginBottom: 3 },
  recapGridLbl: { fontSize: 8, fontWeight: '700', letterSpacing: 2, color: 'rgba(255,255,255,0.3)' },
  recapPills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 20 },
  recapPill: { borderWidth: 1, borderColor: 'rgba(157,78,221,0.3)', borderRadius: 100, paddingHorizontal: 10, paddingVertical: 5 },
  recapPillText: { fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: '500' },
  recapFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 },
  recapPRBadge: { fontSize: 11, color: '#f0a500', fontWeight: '700' },
  recapSlogan: { fontSize: 20, fontWeight: '900', color: 'rgba(157,78,221,0.7)', letterSpacing: 2 },

  // ── PR card
  prCard: { width: CARD_WIDTH, borderRadius: 24, overflow: 'hidden', marginBottom: 24, minHeight: 360, padding: 24 },
  prGlowOrb: { position: 'absolute', width: 260, height: 260, borderRadius: 130, backgroundColor: 'rgba(123,44,191,0.3)', top: 80, right: -70 },
  prTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  prDate: { fontSize: 10, fontWeight: '700', letterSpacing: 2, color: 'rgba(224,170,255,0.6)' },
  prLogo: { width: 52, height: 52, opacity: 0.9 },
  prHero: { flex: 1, justifyContent: 'center', marginBottom: 32 },
  prBadgeRow: { marginBottom: 12 },
  prBadgeLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 3, color: '#f0a500' },
  prNumber: { fontSize: 96, fontWeight: '900', color: '#ffffff', letterSpacing: -5, lineHeight: 96, marginBottom: 8 },
  prUnit: { fontSize: 18, fontWeight: '600', color: 'rgba(255,255,255,0.5)', letterSpacing: -0.3, marginBottom: 6 },
  prExercise: { fontSize: 12, fontWeight: '500', color: 'rgba(255,255,255,0.4)', letterSpacing: 0.5 },
  prBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  prSplit: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.3)', letterSpacing: 1 },
  prSlogan: { fontSize: 20, fontWeight: '900', color: 'rgba(224,170,255,0.8)', letterSpacing: 2 },

  // ── MINIMAL card
  minimalCard: { width: CARD_WIDTH, borderRadius: 24, overflow: 'hidden', marginBottom: 24, backgroundColor: '#f5f2ff' },
  minimalInner: { padding: 28, minHeight: 280, justifyContent: 'space-between' },
  minimalTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  minimalDate: { fontSize: 11, fontWeight: '700', letterSpacing: 2, color: 'rgba(26,0,53,0.45)' },
  minimalLogo: { width: 52, height: 52, opacity: 0.85 },
  minimalCenter: { flex: 1, justifyContent: 'flex-start', paddingTop: 8 },
  minimalSplit: { fontSize: 72, fontWeight: '900', color: '#1a0035', letterSpacing: -3, lineHeight: 68, marginBottom: 24 },
  minimalLine: { height: 1, backgroundColor: 'rgba(26,0,53,0.07)', marginBottom: 20 },
  minimalStats: { fontSize: 15, fontWeight: '500', color: 'rgba(26,0,53,0.45)', letterSpacing: 0.3 },
  minimalBottom: { marginTop: 40, alignItems: 'flex-end' },
  minimalSlogan: { fontSize: 20, fontWeight: '900', color: 'rgba(123,44,191,0.65)', letterSpacing: 2 },

  // ── CLEAR card
  clearCard: { width: CARD_WIDTH, borderRadius: 24, overflow: 'hidden', marginBottom: 24, backgroundColor: 'transparent', borderWidth: 0 },
  clearInner: { padding: 28, minHeight: 280, justifyContent: 'space-between', backgroundColor: 'rgba(0,0,0,0.35)', borderRadius: 24 },
  clearTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 },
  clearDate: { fontSize: 10, fontWeight: '700', letterSpacing: 2, color: '#ffffff' },
  clearLogo: { width: 52, height: 52, opacity: 1 },
  clearCenter: { flex: 1, justifyContent: 'center' },
  clearSplit: { fontSize: 52, fontWeight: '900', color: '#ffffff', letterSpacing: -1.5, lineHeight: 52, marginBottom: 14, textShadowColor: 'rgba(0,0,0,0.4)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 8 },
  clearStats: { fontSize: 15, fontWeight: '600', color: '#ffffff', letterSpacing: 0.3, marginBottom: 8, textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 6 },
  clearPR: { fontSize: 12, fontWeight: '700', color: '#f0a500', letterSpacing: 1 },
  clearBottom: { marginTop: 40, alignItems: 'flex-end' },
  clearSlogan: { fontSize: 20, fontWeight: '900', color: '#ffffff', letterSpacing: 2 },

  // Selector
  selectorRow: { flexDirection: 'row', justifyContent: 'center', gap: 24, marginBottom: 32 },
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
  sharedStrip: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, paddingTop: 16, marginTop: 16 },
  sharedStat: { flex: 1, alignItems: 'center' },
  sharedVal: { fontSize: 20, fontWeight: '900', color: '#ffffff', letterSpacing: -0.3 },
  sharedLbl: { fontSize: 9, fontWeight: '700', letterSpacing: 2, color: 'rgba(255,255,255,0.35)', marginTop: 4 },
  sharedDiv: { width: 1, height: 20, backgroundColor: 'rgba(255,255,255,0.08)' },
});
