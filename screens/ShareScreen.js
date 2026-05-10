import { StyleSheet, Text, View, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import Logo from '../components/Logo';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 48;

export default function ShareScreen({ navigation, route }) {
  const { sets = [], split = 'Workout', duration = 0 } = route.params || {};
  const [theme, setTheme] = useState('dark'); // dark | purple | transparent

  const totalSets = sets.length;
  const totalReps = sets.reduce((sum, s) => sum + (parseInt(s.reps) || 0), 0);
  const totalVolume = sets.reduce((sum, s) => sum + ((parseFloat(s.weight) || 0) * (parseInt(s.reps) || 0)), 0);
  const prs = sets.filter(s => s.isPR === true || s.isPR === 'true').length;
  const uniqueExercises = [...new Set(sets.map(s => s.exercise))];

  const formatDuration = (seconds) => {
    if (!seconds) return '';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return s > 0 ? `${m}m ${s}s` : `${m}m`;
  };

  const formatVolume = (vol) => {
    if (vol >= 1000) return `${(vol / 1000).toFixed(1)}k`;
    return vol.toString();
  };

  const themes = {
    dark: {
      bg: ['#0a000f', '#1a0035'],
      card: 'rgba(255,255,255,0.04)',
      border: 'rgba(255,255,255,0.08)',
      text: '#ffffff',
      sub: 'rgba(255,255,255,0.4)',
      accent: '#9d4edd',
    },
    purple: {
      bg: ['#3c096c', '#7b2cbf'],
      card: 'rgba(255,255,255,0.1)',
      border: 'rgba(255,255,255,0.2)',
      text: '#ffffff',
      sub: 'rgba(255,255,255,0.6)',
      accent: '#e0aaff',
    },
    transparent: {
      bg: ['transparent', 'transparent'],
      card: 'rgba(0,0,0,0.5)',
      border: 'rgba(255,255,255,0.15)',
      text: '#ffffff',
      sub: 'rgba(255,255,255,0.5)',
      accent: '#c77dff',
    },
  };

  const t = themes[theme];

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'short', day: 'numeric'
  });

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#0a000f', '#1a0035']} style={StyleSheet.absoluteFillObject} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Share</Text>
        <TouchableOpacity>
          <Text style={styles.shareBtn}>Save</Text>
        </TouchableOpacity>
      </View>

      {/* Theme selector */}
      <View style={styles.themeRow}>
        {['dark', 'purple', 'transparent'].map(th => (
          <TouchableOpacity
            key={th}
            style={[styles.themeBtn, theme === th && styles.themeBtnActive]}
            onPress={() => setTheme(th)}
          >
            <Text style={[styles.themeBtnText, theme === th && styles.themeBtnTextActive]}>
              {th.charAt(0).toUpperCase() + th.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* THE CARD */}
        <View style={[styles.card, { backgroundColor: theme === 'transparent' ? 'transparent' : undefined, borderColor: t.border }]}>
          {theme !== 'transparent' && (
            <LinearGradient colors={t.bg} style={StyleSheet.absoluteFillObject} borderRadius={24} />
          )}
          {theme === 'transparent' && (
            <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 24 }]} />
          )}

          {/* Card header */}
          <View style={styles.cardHeader}>
            <View>
              <Text style={[styles.cardDate, { color: t.sub }]}>{today}</Text>
              <Text style={[styles.cardSplit, { color: t.text }]}>{split}</Text>
              {duration > 0 && (
                <Text style={[styles.cardDuration, { color: t.accent }]}>{formatDuration(duration)}</Text>
              )}
            </View>
            <View style={styles.cardLogoContainer}>
              <Logo size={40} />
            </View>
          </View>

          {/* PR Banner */}
          {prs > 0 && (
            <View style={styles.prBanner}>
              <Text style={styles.prBannerText}>🏆 {prs} NEW PR{prs > 1 ? 'S' : ''}</Text>
            </View>
          )}

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statVal, { color: t.text }]}>{totalSets}</Text>
              <Text style={[styles.statLbl, { color: t.sub }]}>SETS</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: t.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statVal, { color: t.text }]}>{totalReps}</Text>
              <Text style={[styles.statLbl, { color: t.sub }]}>REPS</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: t.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statVal, { color: t.text }]}>{formatVolume(totalVolume)}</Text>
              <Text style={[styles.statLbl, { color: t.sub }]}>VOLUME</Text>
            </View>
          </View>

          {/* Exercises */}
          <View style={styles.exerciseList}>
            {uniqueExercises.slice(0, 5).map((ex, i) => {
              const exSets = sets.filter(s => s.exercise === ex);
              const best = exSets.reduce((b, s) =>
                parseFloat(s.weight) > parseFloat(b.weight) ? s : b, exSets[0]);
              const hasPR = exSets.some(s => s.isPR === true || s.isPR === 'true');
              return (
                <View key={i} style={[styles.exerciseRow, { borderColor: t.border }]}>
                  <Text style={[styles.exerciseName, { color: t.text }]}>{ex}</Text>
                  <View style={styles.exerciseRight}>
                    {hasPR && <Text style={styles.prDot}>PR</Text>}
                    <Text style={[styles.exerciseMeta, { color: t.sub }]}>
                      {best?.weight} {best?.unit} × {best?.reps}
                    </Text>
                  </View>
                </View>
              );
            })}
            {uniqueExercises.length > 5 && (
              <Text style={[styles.moreText, { color: t.sub }]}>+{uniqueExercises.length - 5} more exercises</Text>
            )}
          </View>

          {/* Footer */}
          <View style={styles.cardFooter}>
            <Text style={[styles.cardFooterText, { color: t.accent }]}>up-app.com</Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#080010' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 64, paddingBottom: 16 },
  back: { color: 'rgba(255,255,255,0.4)', fontSize: 15, fontWeight: '600' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#ffffff', letterSpacing: 1 },
  shareBtn: { color: '#9d4edd', fontSize: 15, fontWeight: '700' },
  themeRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 24, paddingHorizontal: 24 },
  themeBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', alignItems: 'center' },
  themeBtnActive: { backgroundColor: 'rgba(157,78,221,0.2)', borderColor: '#7b2cbf' },
  themeBtnText: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.3)' },
  themeBtnTextActive: { color: '#ffffff' },
  container: { paddingHorizontal: 24 },
  card: { width: CARD_WIDTH, borderRadius: 24, padding: 24, borderWidth: 1, overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  cardDate: { fontSize: 11, fontWeight: '600', letterSpacing: 1, marginBottom: 4 },
  cardSplit: { fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
  cardDuration: { fontSize: 12, fontWeight: '600', marginTop: 4, letterSpacing: 1 },
  cardLogoContainer: { alignItems: 'center', justifyContent: 'center' },
  prBanner: { backgroundColor: 'rgba(240,165,0,0.15)', borderWidth: 1, borderColor: 'rgba(240,165,0,0.3)', borderRadius: 10, paddingVertical: 8, alignItems: 'center', marginBottom: 16 },
  prBannerText: { fontSize: 11, fontWeight: '800', color: '#f0a500', letterSpacing: 2 },
  statsRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, paddingVertical: 16, marginBottom: 20 },
  statItem: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
  statLbl: { fontSize: 9, fontWeight: '700', letterSpacing: 2, marginTop: 2 },
  statDivider: { width: 1, height: 32 },
  exerciseList: { gap: 8, marginBottom: 20 },
  exerciseRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, paddingBottom: 8 },
  exerciseName: { fontSize: 14, fontWeight: '600', flex: 1 },
  exerciseRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  prDot: { fontSize: 9, fontWeight: '800', color: '#f0a500', backgroundColor: 'rgba(240,165,0,0.15)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  exerciseMeta: { fontSize: 12, fontWeight: '500' },
  moreText: { fontSize: 12, textAlign: 'center', marginTop: 4 },
  cardFooter: { alignItems: 'center', marginTop: 4 },
  cardFooterText: { fontSize: 11, fontWeight: '600', letterSpacing: 2 },
});