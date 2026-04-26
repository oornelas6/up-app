import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const SPLIT_TEMPLATES = [
  {
    name: 'PPL',
    description: 'Push Pull Legs — 6 days',
    schedule: ['Push', 'Pull', 'Legs', 'Push', 'Pull', 'Legs', 'Rest'],
    color: '#7b2cbf',
  },
  {
    name: 'Arnold',
    description: 'Chest/Back, Shoulders/Arms, Legs — 6 days',
    schedule: ['Upper', 'Arms', 'Legs', 'Upper', 'Arms', 'Legs', 'Rest'],
    color: '#4a0080',
  },
  {
    name: 'Upper/Lower',
    description: 'Upper Lower split — 4 days',
    schedule: ['Upper', 'Lower', 'Rest', 'Upper', 'Lower', 'Rest', 'Rest'],
    color: '#9d4edd',
  },
  {
    name: 'Full Body',
    description: 'Full body 3x per week',
    schedule: ['Full Body', 'Rest', 'Full Body', 'Rest', 'Full Body', 'Rest', 'Rest'],
    color: '#6a0dad',
  },
  {
    name: 'Bro Split',
    description: 'One muscle group per day',
    schedule: ['Push', 'Pull', 'Legs', 'Arms', 'Upper', 'Rest', 'Rest'],
    color: '#5a189a',
  },
];

const DAY_COLORS = {
  'Push': '#7b2cbf',
  'Pull': '#9d4edd',
  'Legs': '#5a189a',
  'Arms': '#4a0080',
  'Upper': '#6a0dad',
  'Lower': '#3c096c',
  'Full Body': '#240046',
  'Rest': 'rgba(255,255,255,0.05)',
};

        export default function SplitBuilderScreen({ navigation }) {
        const [selected, setSelected] = useState(null);

        const handleSelect = async (template) => {
        setSelected(template);
        };

        const handleStart = async () => {
        if (selected) {
            await AsyncStorage.setItem('active_split', JSON.stringify(selected));
            navigation.navigate('Split');
        }
        };

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

        <Text style={styles.title}>Build Your{'\n'}Split</Text>
        <Text style={styles.subtitle}>Choose a template to get started</Text>

        <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 24 }}>
          {SPLIT_TEMPLATES.map((template, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.card, selected?.name === template.name && styles.cardSelected]}
              activeOpacity={0.8}
              onPress={() => handleSelect(template)}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardName}>{template.name}</Text>
                {selected?.name === template.name && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </View>
              <Text style={styles.cardDesc}>{template.description}</Text>

              {/* Weekly schedule */}
              <View style={styles.scheduleRow}>
                {DAYS.map((day, j) => (
                  <View key={j} style={styles.dayCol}>
                    <Text style={styles.dayLabel}>{day}</Text>
                    <View style={[styles.dayBadge, { backgroundColor: DAY_COLORS[template.schedule[j]] || 'rgba(255,255,255,0.05)' }]}>
                      <Text style={styles.dayBadgeText}>
                        {template.schedule[j] === 'Rest' ? '—' : template.schedule[j].slice(0, 2)}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          ))}
          <View style={{ height: 100 }} />
        </ScrollView>

        {selected && (
          <View style={styles.bottomBar}>
            <TouchableOpacity activeOpacity={0.9} onPress={handleStart}>
              <LinearGradient
                colors={['#7b2cbf', '#4a0080']}
                style={styles.startBtn}
              >
                <Text style={styles.startBtnText}>START TODAY'S WORKOUT</Text>
               <Text style={styles.startBtnSub}>
                {selected.schedule[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]} Day
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
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
  title: { fontSize: 38, fontWeight: '900', color: '#ffffff', letterSpacing: -1, lineHeight: 44 },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.3)', marginTop: 8 },
  card: { backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderRadius: 20, padding: 20, marginBottom: 12 },
  cardSelected: { borderColor: '#7b2cbf', backgroundColor: 'rgba(123,44,191,0.1)' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardName: { fontSize: 20, fontWeight: '800', color: '#ffffff' },
  checkmark: { fontSize: 18, color: '#9d4edd' },
  cardDesc: { fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 16 },
  scheduleRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dayCol: { alignItems: 'center', gap: 6 },
  dayLabel: { fontSize: 9, color: 'rgba(255,255,255,0.25)', fontWeight: '600', letterSpacing: 0.5 },
  dayBadge: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  dayBadgeText: { fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.8)', letterSpacing: 0.3 },
  bottomBar: { position: 'absolute', bottom: 40, left: 24, right: 24 },
  startBtn: { paddingVertical: 20, borderRadius: 18, alignItems: 'center' },
  startBtnText: { color: 'white', fontSize: 14, fontWeight: '800', letterSpacing: 2, marginBottom: 4 },
  startBtnSub: { color: 'rgba(255,255,255,0.5)', fontSize: 12 },
});