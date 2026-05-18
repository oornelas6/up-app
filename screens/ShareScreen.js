import { StyleSheet, Text, View, TouchableOpacity, Dimensions, ScrollView, Alert, Image } from 'react-native';
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
  const [activeCard, setActiveCard] = useState(3); // default to Transparent
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const cardRef = useRef(null);

  const totalSets = sets.length;
  const totalReps = sets.reduce((sum, s) => sum + (parseInt(s.reps) || 0), 0);
  const totalVolume = sets.reduce((sum, s) => sum + ((parseFloat(s.weight) || 0) * (parseInt(s.reps) || 0)), 0);
  const prs = sets.filter(s => s.isPR === true || s.isPR === 'true').length;
  const uniqueExercises = [...new Set(sets.map(s => s.exercise))];

  const formatDuration = (seconds) => {
    if (!seconds) return null;
    const m = Math.floor(seconds / 60);
    return `${m}m`;
  };

  const formatVolume = (vol) => {
    if (vol >= 1000) return `${(vol / 1000).toFixed(1)}k`;
    return Math.round(vol).toString();
  };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric'
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
      // fallback to text copy
      handleCopyText();
    }
  };

  const handleCopyText = () => {
    const line1 = `${split} — ${today}`;
    const line2 = `${totalSets} sets · ${totalReps} reps · ${formatVolume(totalVolume)} lbs`;
    const line4 = prs > 0 ? `🏆 ${prs} PR${prs > 1 ? 's' : ''}` : '';
    const exercises = uniqueExercises.map(ex => {
      const exSets = sets.filter(s => s.exercise === ex);
      const best = exSets.reduce((b, s) => parseFloat(s.weight) > parseFloat(b.weight) ? s : b, exSets[0]);
      return `• ${ex} — ${best?.weight} ${best?.unit} × ${best?.reps}`;
    }).join('\n');
    const text = [line1, line2, line4, '', exercises, '', 'Tracked with UP'].filter(Boolean).join('\n');
    Clipboard.setStringAsync(text);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const CARDS = ['Dark', 'Glow', 'Light', 'Clear'];
  const isTransparent = activeCard === 3;

  const StatBlock = ({ val, label, textColor, subColor }) => (
    <View style={styles.statItem}>
      <Text style={[styles.statVal, { color: textColor }]}>{val}</Text>
      <Text style={[styles.statLbl, { color: subColor }]}>{label}</Text>
    </View>
  );

  const ExercisePills = ({ textColor, subColor }) => (
    <View style={styles.pillRow}>
      {uniqueExercises.slice(0, 4).map((ex, i) => (
        <View key={i} style={[styles.pill, { borderColor: subColor }]}>
          <Text style={[styles.pillText, { color: textColor }]} numberOfLines={1}>{ex}</Text>
        </View>
      ))}
      {uniqueExercises.length > 4 && (
        <View style={[styles.pill, { borderColor: subColor }]}>
          <Text style={[styles.pillText, { color: subColor }]}>+{uniqueExercises.length - 4}</Text>
        </View>
      )}
    </View>
  );

  // CARD 0 — DARK
  const DarkCard = () => (
    <View style={[styles.card, { backgroundColor: '#08000f', borderColor: 'rgba(157,78,221,0.2)' }]}>
      <View style={styles.cardTopRow}>
        <View>
          <Text style={[styles.cardDate, { color: 'rgba(157,78,221,0.7)' }]}>{today}</Text>
          <Text style={[styles.cardSplit, { color: '#ffffff' }]}>{split}</Text>
          {formatDuration(duration) && <Text style={[styles.cardDuration, { color: 'rgba(255,255,255,0.3)' }]}>{formatDuration(duration)}</Text>}
        </View>
        <Image source={require('../assets/logo.png')} style={[styles.cardLogo, { tintColor: '#ffffff' }]} resizeMode="contain" />
      </View>
      {prs > 0 && <View style={styles.prBanner}><Text style={styles.prBannerText}>🏆  {prs} NEW PR{prs > 1 ? 'S' : ''}</Text></View>}
      <View style={[styles.statsRow, { backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.06)' }]}>
        <StatBlock val={totalSets} label="SETS" textColor="#fff" subColor="rgba(255,255,255,0.3)" />
        <View style={[styles.statDivider, { backgroundColor: 'rgba(255,255,255,0.07)' }]} />
        <StatBlock val={totalReps} label="REPS" textColor="#fff" subColor="rgba(255,255,255,0.3)" />
        <View style={[styles.statDivider, { backgroundColor: 'rgba(255,255,255,0.07)' }]} />
        <StatBlock val={formatVolume(totalVolume)} label="VOLUME" textColor="#fff" subColor="rgba(255,255,255,0.3)" />
      </View>
      <ExercisePills textColor="rgba(255,255,255,0.8)" subColor="rgba(255,255,255,0.2)" />
      <Text style={[styles.cardTag, { color: 'rgba(157,78,221,0.5)' }]}>get UP.</Text>
    </View>
  );

  // CARD 1 — GLOW
  const GlowCard = () => (
    <View style={[styles.card, { borderColor: 'rgba(255,255,255,0.12)', overflow: 'hidden' }]}>
      <LinearGradient colors={['#3c096c', '#10002b']} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={StyleSheet.absoluteFillObject} />
      <View style={styles.glowOrb} />
      <View style={styles.cardTopRow}>
        <View>
          <Text style={[styles.cardDate, { color: 'rgba(224,170,255,0.7)' }]}>{today}</Text>
          <Text style={[styles.cardSplit, { color: '#ffffff' }]}>{split}</Text>
          {formatDuration(duration) && <Text style={[styles.cardDuration, { color: '#c77dff' }]}>{formatDuration(duration)}</Text>}
        </View>
        <Image source={require('../assets/logo.png')} style={[styles.cardLogo, { tintColor: '#e0aaff' }]} resizeMode="contain" />
      </View>
      {prs > 0 && <View style={[styles.prBanner, { backgroundColor: 'rgba(240,165,0,0.15)', borderColor: 'rgba(240,165,0,0.3)' }]}><Text style={styles.prBannerText}>🏆  {prs} NEW PR{prs > 1 ? 'S' : ''}</Text></View>}
      <View style={[styles.statsRow, { backgroundColor: 'rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.1)' }]}>
        <StatBlock val={totalSets} label="SETS" textColor="#fff" subColor="rgba(255,255,255,0.45)" />
        <View style={[styles.statDivider, { backgroundColor: 'rgba(255,255,255,0.1)' }]} />
        <StatBlock val={totalReps} label="REPS" textColor="#fff" subColor="rgba(255,255,255,0.45)" />
        <View style={[styles.statDivider, { backgroundColor: 'rgba(255,255,255,0.1)' }]} />
        <StatBlock val={formatVolume(totalVolume)} label="VOLUME" textColor="#fff" subColor="rgba(255,255,255,0.45)" />
      </View>
      <ExercisePills textColor="rgba(255,255,255,0.8)" subColor="rgba(255,255,255,0.2)" />
      <Text style={[styles.cardTag, { color: '#c77dff' }]}>get UP.</Text>
    </View>
  );

  // CARD 2 — LIGHT
  const LightCard = () => (
    <View style={[styles.card, { backgroundColor: '#f5f2ff', borderColor: 'rgba(0,0,0,0.06)' }]}>
      <View style={styles.cardTopRow}>
        <View>
          <Text style={[styles.cardDate, { color: 'rgba(123,44,191,0.6)' }]}>{today}</Text>
          <Text style={[styles.cardSplit, { color: '#1a0035' }]}>{split}</Text>
          {formatDuration(duration) && <Text style={[styles.cardDuration, { color: 'rgba(0,0,0,0.35)' }]}>{formatDuration(duration)}</Text>}
        </View>
        <Image source={require('../assets/logo.png')} style={[styles.cardLogo, { tintColor: '#1a0035' }]} resizeMode="contain" />
      </View>
      {prs > 0 && <View style={[styles.prBanner, { backgroundColor: 'rgba(240,165,0,0.12)', borderColor: 'rgba(240,165,0,0.3)' }]}><Text style={styles.prBannerText}>🏆  {prs} NEW PR{prs > 1 ? 'S' : ''}</Text></View>}
      <View style={[styles.statsRow, { backgroundColor: 'rgba(123,44,191,0.07)', borderColor: 'rgba(123,44,191,0.1)' }]}>
        <StatBlock val={totalSets} label="SETS" textColor="#1a0035" subColor="rgba(0,0,0,0.35)" />
        <View style={[styles.statDivider, { backgroundColor: 'rgba(0,0,0,0.08)' }]} />
        <StatBlock val={totalReps} label="REPS" textColor="#1a0035" subColor="rgba(0,0,0,0.35)" />
        <View style={[styles.statDivider, { backgroundColor: 'rgba(0,0,0,0.08)' }]} />
        <StatBlock val={formatVolume(totalVolume)} label="VOLUME" textColor="#1a0035" subColor="rgba(0,0,0,0.35)" />
      </View>
      <ExercisePills textColor="rgba(26,0,53,0.7)" subColor="rgba(123,44,191,0.25)" />
      <Text style={[styles.cardTag, { color: 'rgba(123,44,191,0.4)' }]}>get UP.</Text>
    </View>
  );

  // CARD 3 — CLEAR (transparent, paste into IG)
  const ClearCard = () => (
    <View style={[styles.card, { backgroundColor: 'transparent', borderColor: 'rgba(255,255,255,0.15)' }]}>
      {/* Checkerboard preview so user knows it's transparent */}
      <View style={[StyleSheet.absoluteFillObject, styles.checkerboard, { borderRadius: 28 }]} />
      <View style={styles.cardTopRow}>
        <View>
          <Text style={[styles.cardDate, { color: 'rgba(255,255,255,0.9)' }]}>{today}</Text>
          <Text style={[styles.cardSplit, { color: '#ffffff' }]}>{split}</Text>
          {formatDuration(duration) && <Text style={[styles.cardDuration, { color: 'rgba(255,255,255,0.6)' }]}>{formatDuration(duration)}</Text>}
        </View>
        <Image source={require('../assets/logo.png')} style={[styles.cardLogo, { tintColor: '#ffffff' }]} resizeMode="contain" />
      </View>
      {prs > 0 && <View style={[styles.prBanner, { backgroundColor: 'rgba(240,165,0,0.2)', borderColor: 'rgba(240,165,0,0.4)' }]}><Text style={styles.prBannerText}>🏆  {prs} NEW PR{prs > 1 ? 'S' : ''}</Text></View>}
      <View style={[styles.statsRow, { backgroundColor: 'rgba(0,0,0,0.3)', borderColor: 'rgba(255,255,255,0.15)' }]}>
        <StatBlock val={totalSets} label="SETS" textColor="#fff" subColor="rgba(255,255,255,0.6)" />
        <View style={[styles.statDivider, { backgroundColor: 'rgba(255,255,255,0.15)' }]} />
        <StatBlock val={totalReps} label="REPS" textColor="#fff" subColor="rgba(255,255,255,0.6)" />
        <View style={[styles.statDivider, { backgroundColor: 'rgba(255,255,255,0.15)' }]} />
        <StatBlock val={formatVolume(totalVolume)} label="VOLUME" textColor="#fff" subColor="rgba(255,255,255,0.6)" />
      </View>
      <ExercisePills textColor="rgba(255,255,255,0.8)" subColor="rgba(255,255,255,0.2)" />
      <Text style={[styles.cardTag, { color: 'rgba(255,255,255,0.5)' }]}>get UP.</Text>
    </View>
  );

  // What actually gets captured for Clear card — no checkerboard, truly transparent
  const ClearCardCapture = () => (
    <View style={[styles.card, { backgroundColor: 'transparent', borderColor: 'rgba(255,255,255,0.15)' }]}>
      <View style={styles.cardTopRow}>
        <View>
          <Text style={[styles.cardDate, { color: 'rgba(255,255,255,0.9)' }]}>{today}</Text>
          <Text style={[styles.cardSplit, { color: '#ffffff' }]}>{split}</Text>
          {formatDuration(duration) && <Text style={[styles.cardDuration, { color: 'rgba(255,255,255,0.6)' }]}>{formatDuration(duration)}</Text>}
        </View>
        <Image source={require('../assets/logo.png')} style={[styles.cardLogo, { tintColor: '#ffffff' }]} resizeMode="contain" />
      </View>
      {prs > 0 && <View style={[styles.prBanner, { backgroundColor: 'rgba(240,165,0,0.2)', borderColor: 'rgba(240,165,0,0.4)' }]}><Text style={styles.prBannerText}>🏆  {prs} NEW PR{prs > 1 ? 'S' : ''}</Text></View>}
      <View style={[styles.statsRow, { backgroundColor: 'rgba(0,0,0,0.3)', borderColor: 'rgba(255,255,255,0.15)' }]}>
        <StatBlock val={totalSets} label="SETS" textColor="#fff" subColor="rgba(255,255,255,0.6)" />
        <View style={[styles.statDivider, { backgroundColor: 'rgba(255,255,255,0.15)' }]} />
        <StatBlock val={totalReps} label="REPS" textColor="#fff" subColor="rgba(255,255,255,0.6)" />
        <View style={[styles.statDivider, { backgroundColor: 'rgba(255,255,255,0.15)' }]} />
        <StatBlock val={formatVolume(totalVolume)} label="VOLUME" textColor="#fff" subColor="rgba(255,255,255,0.6)" />
      </View>
      <ExercisePills textColor="rgba(255,255,255,0.8)" subColor="rgba(255,255,255,0.2)" />
      <Text style={[styles.cardTag, { color: 'rgba(255,255,255,0.5)' }]}>get UP.</Text>
    </View>
  );

  const CARD_COMPONENTS = [DarkCard, GlowCard, LightCard, ClearCard];
  const ActiveCardComponent = CARD_COMPONENTS[activeCard];

  // For Clear card, primary action is copy image. For others, save to camera roll.
  const primaryAction = isTransparent ? handleCopyImage : handleSave;
  const primaryLabel = isTransparent
    ? (copied ? '✓ COPIED' : 'COPY TO CLIPBOARD')
    : (saved ? '✓ SAVED TO CAMERA ROLL' : 'SAVE TO CAMERA ROLL');
  const primaryColors = isTransparent
    ? (copied ? ['#4caf50', '#2e7d32'] : ['#ffffff', '#e8e0ff'])
    : ['#7b2cbf', '#4a0080'];
  const primaryTextColor = isTransparent ? '#1a0035' : '#ffffff';

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#0d0020', '#080010']} style={StyleSheet.absoluteFillObject} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SHARE</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Hidden capture ref for Clear card */}
        {isTransparent && (
          <ViewShot ref={cardRef} options={{ format: 'png', quality: 1.0, result: 'base64' }} style={{ position: 'absolute', opacity: 0, top: -9999 }}>
            <ClearCardCapture />
          </ViewShot>
        )}

        {/* Visible card with capture ref for non-transparent cards */}
        {!isTransparent ? (
          <ViewShot ref={cardRef} options={{ format: 'png', quality: 1.0 }}>
            <ActiveCardComponent />
          </ViewShot>
        ) : (
          <ActiveCardComponent />
        )}

        {/* Transparent card hint */}
        {isTransparent && (
          <View style={styles.clearHint}>
            <Text style={styles.clearHintText}>Copy → open Instagram Story → paste ✦</Text>
          </View>
        )}

        {/* Card selector */}
        <View style={styles.selectorRow}>
          {CARDS.map((name, i) => (
            <TouchableOpacity key={i} style={styles.selectorBtn} onPress={() => setActiveCard(i)}>
              <View style={[styles.selectorDot, activeCard === i && styles.selectorDotActive]} />
              <Text style={[styles.selectorLabel, activeCard === i && styles.selectorLabelActive]}>{name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Primary action */}
        <TouchableOpacity style={styles.primaryBtn} onPress={primaryAction} activeOpacity={0.85}>
          <LinearGradient colors={primaryColors} style={styles.primaryBtnGradient}>
            <Text style={[styles.primaryBtnText, { color: primaryTextColor }]}>{primaryLabel}</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Secondary action */}
        {!isTransparent && (
          <TouchableOpacity style={styles.secondaryBtn} onPress={handleCopyText} activeOpacity={0.8}>
            <Text style={styles.secondaryBtnText}>{copied ? '✓ Copied' : 'Copy as text'}</Text>
          </TouchableOpacity>
        )}
        {isTransparent && (
          <TouchableOpacity style={styles.secondaryBtn} onPress={handleSave} activeOpacity={0.8}>
            <Text style={styles.secondaryBtnText}>{saved ? '✓ Saved' : 'Save to camera roll instead'}</Text>
          </TouchableOpacity>
        )}

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
  card: { width: CARD_WIDTH, borderRadius: 28, padding: 26, borderWidth: 1, overflow: 'hidden', marginBottom: 16 },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  cardDate: { fontSize: 10, fontWeight: '700', letterSpacing: 2, marginBottom: 6 },
  cardSplit: { fontSize: 30, fontWeight: '900', letterSpacing: -1, lineHeight: 32 },
  cardDuration: { fontSize: 12, fontWeight: '600', marginTop: 6, letterSpacing: 1 },
  cardLogo: { width: 36, height: 36, opacity: 0.9 },
  glowOrb: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(123,44,191,0.35)', top: -60, right: -60 },
  checkerboard: { backgroundColor: 'rgba(255,255,255,0.04)' },
  prBanner: { backgroundColor: 'rgba(240,165,0,0.12)', borderWidth: 1, borderColor: 'rgba(240,165,0,0.25)', borderRadius: 10, paddingVertical: 9, alignItems: 'center', marginBottom: 16 },
  prBannerText: { fontSize: 11, fontWeight: '800', color: '#f0a500', letterSpacing: 2.5 },
  statsRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 16, paddingVertical: 16, marginBottom: 20 },
  statItem: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 26, fontWeight: '900', letterSpacing: -0.5 },
  statLbl: { fontSize: 9, fontWeight: '700', letterSpacing: 2, marginTop: 3 },
  statDivider: { width: 1, height: 28 },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 4 },
  pill: { borderWidth: 1, borderRadius: 100, paddingHorizontal: 10, paddingVertical: 5 },
  pillText: { fontSize: 11, fontWeight: '600', letterSpacing: 0.3 },
  cardTag: { fontSize: 10, fontWeight: '700', letterSpacing: 3, marginTop: 18, textAlign: 'right' },
  clearHint: { marginBottom: 8 },
  clearHintText: { fontSize: 12, color: 'rgba(255,255,255,0.3)', textAlign: 'center', letterSpacing: 0.5 },
  selectorRow: { flexDirection: 'row', justifyContent: 'center', gap: 28, marginBottom: 28 },
  selectorBtn: { alignItems: 'center', gap: 6 },
  selectorDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.15)' },
  selectorDotActive: { backgroundColor: '#9d4edd', width: 20, borderRadius: 3 },
  selectorLabel: { fontSize: 11, color: 'rgba(255,255,255,0.25)', fontWeight: '600', letterSpacing: 1 },
  selectorLabelActive: { color: '#ffffff' },
  primaryBtn: { marginBottom: 12 },
  primaryBtnGradient: { paddingVertical: 18, borderRadius: 16, alignItems: 'center' },
  primaryBtnText: { fontSize: 14, fontWeight: '800', letterSpacing: 2 },
  secondaryBtn: { paddingVertical: 16, alignItems: 'center' },
  secondaryBtnText: { color: 'rgba(255,255,255,0.25)', fontSize: 14, fontWeight: '600', letterSpacing: 0.5 },
});
