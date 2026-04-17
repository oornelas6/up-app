import { StyleSheet, Text, View, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';

export default function SettingsScreen({ navigation }) {
  const [isKg, setIsKg] = useState(false);
  const [restTimer, setRestTimer] = useState(90);
  const [showRPE, setShowRPE] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const restOptions = [60, 90, 120, 180, 240];

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['rgba(50,0,90,0.5)', 'rgba(8,0,16,1)']}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.back}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.logo}>UP</Text>
        </View>

        <Text style={styles.title}>Settings</Text>

        <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 32 }}>

          {/* Units */}
          <Text style={styles.sectionLabel}>UNITS</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <View>
                <Text style={styles.rowTitle}>Weight Unit</Text>
                <Text style={styles.rowSub}>Applies to all exercises</Text>
              </View>
              <View style={styles.toggleRow}>
                <Text style={[styles.unitLabel, !isKg && styles.unitActive]}>LBS</Text>
                <Switch
                  value={isKg}
                  onValueChange={setIsKg}
                  trackColor={{ false: 'rgba(157,78,221,0.3)', true: '#7b2cbf' }}
                  thumbColor={'#ffffff'}
                />
                <Text style={[styles.unitLabel, isKg && styles.unitActive]}>KG</Text>
              </View>
            </View>
          </View>

          {/* Rest Timer */}
          <Text style={styles.sectionLabel}>REST TIMER</Text>
          <View style={styles.card}>
            <Text style={styles.rowTitle}>Default Rest Duration</Text>
            <Text style={styles.rowSub}>Seconds between sets</Text>
            <View style={styles.optionsRow}>
              {restOptions.map(sec => (
                <TouchableOpacity
                  key={sec}
                  style={[styles.optionBtn, restTimer === sec && styles.optionBtnActive]}
                  onPress={() => setRestTimer(sec)}
                >
                  <Text style={[styles.optionText, restTimer === sec && styles.optionTextActive]}>
                    {sec < 60 ? `${sec}s` : `${sec / 60}m`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Advanced */}
          <Text style={styles.sectionLabel}>ADVANCED</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <View>
                <Text style={styles.rowTitle}>Show RPE</Text>
                <Text style={styles.rowSub}>Rate of perceived exertion</Text>
              </View>
              <Switch
                value={showRPE}
                onValueChange={setShowRPE}
                trackColor={{ false: 'rgba(157,78,221,0.3)', true: '#7b2cbf' }}
                thumbColor={'#ffffff'}
              />
            </View>
            <View style={[styles.row, { marginTop: 16 }]}>
              <View>
                <Text style={styles.rowTitle}>Workout Reminders</Text>
                <Text style={styles.rowSub}>Daily push notification</Text>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: 'rgba(157,78,221,0.3)', true: '#7b2cbf' }}
                thumbColor={'#ffffff'}
              />
            </View>
          </View>

          {/* Account */}
          <Text style={styles.sectionLabel}>ACCOUNT</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.row}>
              <Text style={styles.rowTitle}>Export Data</Text>
              <Text style={styles.chevron}>→</Text>
            </TouchableOpacity>
            <View style={styles.cardDivider} />
            <TouchableOpacity style={styles.row}>
              <Text style={[styles.rowTitle, { color: '#e05555' }]}>Sign Out</Text>
              <Text style={styles.chevron}>→</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.version}>UP v0.1 Beta</Text>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#080010' },
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 64 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  back: { color: 'rgba(255,255,255,0.4)', fontSize: 15, fontWeight: '600' },
  logo: { fontSize: 26, fontWeight: '900', color: '#ffffff', letterSpacing: 4 },
  title: { fontSize: 38, fontWeight: '900', color: '#ffffff', letterSpacing: -1 },
  sectionLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 3, color: 'rgba(255,255,255,0.25)', marginBottom: 10, marginTop: 24 },
  card: { backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderRadius: 18, padding: 20, marginBottom: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowTitle: { fontSize: 16, fontWeight: '600', color: '#ffffff', marginBottom: 2 },
  rowSub: { fontSize: 12, color: 'rgba(255,255,255,0.25)', fontWeight: '400' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  unitLabel: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.25)', letterSpacing: 1 },
  unitActive: { color: '#9d4edd' },
  optionsRow: { flexDirection: 'row', gap: 8, marginTop: 16, flexWrap: 'wrap' },
  optionBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 100, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)' },
  optionBtnActive: { backgroundColor: 'rgba(123,44,191,0.3)', borderColor: '#7b2cbf' },
  optionText: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.3)' },
  optionTextActive: { color: '#ffffff' },
  cardDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginVertical: 16 },
  chevron: { color: 'rgba(255,255,255,0.2)', fontSize: 16 },
  version: { fontSize: 12, color: 'rgba(255,255,255,0.15)', textAlign: 'center', marginTop: 24, letterSpacing: 1 },
});