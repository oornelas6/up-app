import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Logo from '../components/Logo';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import * as Haptics from 'expo-haptics';

const ALL_EXERCISES = [
  { name: 'Flat Barbell Bench', tag: 'Chest' },
  { name: 'Incline DB Bench', tag: 'Chest' },
  { name: 'Incline Smith Bench', tag: 'Chest' },
  { name: 'Flat DB Bench', tag: 'Chest' },
  { name: 'Chest Fly Machine', tag: 'Chest' },
  { name: 'Overhead Press', tag: 'Shoulders' },
  { name: 'Lateral Raise DB', tag: 'Shoulders' },
  { name: 'Lateral Raise Machine', tag: 'Shoulders' },
  { name: 'Tricep Overhead Extension', tag: 'Triceps' },
  { name: 'Cable Pushdown', tag: 'Triceps' },
  { name: 'Weighted Dips', tag: 'Triceps' },
  { name: 'Chest Supported Row', tag: 'Back' },
  { name: 'Bent Over Barbell Row', tag: 'Back' },
  { name: 'Seated Cable Row', tag: 'Back' },
  { name: 'Wide Grip Lat Pulldown', tag: 'Back' },
  { name: 'Straight Arm Lat Pulldown', tag: 'Back' },
  { name: 'Rear Delt Fly Machine', tag: 'Shoulders' },
  { name: 'Hammer Curl', tag: 'Biceps' },
  { name: 'Preacher Curl', tag: 'Biceps' },
  { name: 'Incline Curl', tag: 'Biceps' },
  { name: 'Back Squat', tag: 'Quads' },
  { name: 'Belt Squat', tag: 'Quads' },
  { name: 'Leg Extension', tag: 'Quads' },
  { name: 'Walking Lunges', tag: 'Quads' },
  { name: 'RDL', tag: 'Hamstrings' },
  { name: 'Seated Hamstring Curl', tag: 'Hamstrings' },
  { name: 'Hip Thrust', tag: 'Glutes' },
  { name: 'Bulgarian Split Squat', tag: 'Glutes' },
  { name: 'Calf Raises', tag: 'Calves' },
  { name: 'Hanging Leg Raises', tag: 'Abs' },
  { name: 'Weighted Sit Ups', tag: 'Abs' },
];

export default function WorkoutBuilderScreen({ navigation, route }) {
  const { editWorkout } = route.params || {};
  const theme = useTheme();
  const styles = getStyles(theme);

  const [name, setName] = useState(editWorkout?.name || '');
  const [selected, setSelected] = useState(editWorkout?.exercises || []);
  const [search, setSearch] = useState('');
  const [step, setStep] = useState(0); // 0 = name, 1 = exercises

  const filtered = ALL_EXERCISES.filter(ex =>
    ex.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleExercise = (ex) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const exists = selected.find(s => s.name === ex.name);
    if (exists) {
      setSelected(selected.filter(s => s.name !== ex.name));
    } else {
      setSelected([...selected, ex]);
    }
  };

  const moveUp = (index) => {
    if (index === 0) return;
    const newSelected = [...selected];
    [newSelected[index - 1], newSelected[index]] = [newSelected[index], newSelected[index - 1]];
    setSelected(newSelected);
  };

  const moveDown = (index) => {
    if (index === selected.length - 1) return;
    const newSelected = [...selected];
    [newSelected[index], newSelected[index + 1]] = [newSelected[index + 1], newSelected[index]];
    setSelected(newSelected);
  };

  const addCustom = () => {
    if (search.trim()) {
      const custom = { name: search.trim(), tag: 'Custom' };
      setSelected([...selected, custom]);
      setSearch('');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const saveWorkout = async () => {
    if (!name.trim()) { Alert.alert('Name your workout first'); return; }
    if (selected.length === 0) { Alert.alert('Add at least one exercise'); return; }

    try {
      const saved = await AsyncStorage.getItem('my_workouts');
      const workouts = saved ? JSON.parse(saved) : [];

      const workout = {
        id: editWorkout?.id || Date.now().toString(),
        name: name.trim(),
        exercises: selected,
        createdAt: editWorkout?.createdAt || new Date().toISOString(),
      };

      const updated = editWorkout
        ? workouts.map(w => w.id === editWorkout.id ? workout : w)
        : [...workouts, workout];

      await AsyncStorage.setItem('my_workouts', JSON.stringify(updated));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', 'Failed to save workout');
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <View style={[styles.root, { backgroundColor: theme.bg }]}>
        <LinearGradient colors={theme.gradientBg} style={StyleSheet.absoluteFillObject} />
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.back}>← Back</Text>
            </TouchableOpacity>
            <Logo size={36} />
          </View>

          {/* Step 0 — Name */}
          {step === 0 && (
            <View style={styles.step}>
              <Text style={[styles.eyebrow, { color: theme.accent }]}>NEW WORKOUT</Text>
              <Text style={[styles.title, { color: theme.text }]}>What are we{'\n'}calling this?</Text>
              <Text style={[styles.sub, { color: theme.textTertiary }]}>Give it a name you'll recognize.</Text>
              <TextInput
                style={[styles.nameInput, { backgroundColor: theme.bgCard, borderColor: theme.bgCardBorder, color: theme.text }]}
                placeholder="e.g. Push Day A, Chest & Tris..."
                placeholderTextColor={theme.textTertiary}
                value={name}
                onChangeText={setName}
                autoFocus
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={() => name.trim() && setStep(1)}
              />
              <TouchableOpacity
                style={[styles.btn, !name.trim() && { opacity: 0.3 }]}
                onPress={() => name.trim() && setStep(1)}
                activeOpacity={0.85}
              >
                <LinearGradient colors={theme.gradientBtn} style={styles.btnGradient}>
                  <Text style={[styles.btnText, { color: theme.btnText }]}>CONTINUE</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {/* Step 1 — Exercises */}
          {step === 1 && (
            <View style={{ flex: 1 }}>
              <View style={styles.step1Header}>
                <View>
                  <Text style={[styles.title, { color: theme.text, fontSize: 28 }]}>{name}</Text>
                  <Text style={[styles.sub, { color: theme.textTertiary }]}>
                    {selected.length} exercise{selected.length !== 1 ? 's' : ''} added
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.saveBtn, selected.length === 0 && { opacity: 0.3 }]}
                  onPress={saveWorkout}
                  activeOpacity={0.85}
                >
                  <LinearGradient colors={theme.gradientBtn} style={styles.saveBtnGradient}>
                    <Text style={[styles.saveBtnText, { color: theme.btnText }]}>Save</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              {/* Selected exercises - reorderable */}
              {selected.length > 0 && (
                <View style={[styles.selectedList, { backgroundColor: theme.bgCard, borderColor: theme.bgCardBorder }]}>
                  <Text style={[styles.selectedLabel, { color: theme.textTertiary }]}>WORKOUT ORDER — tap arrows to reorder</Text>
                  {selected.map((ex, i) => (
                    <View key={i} style={[styles.selectedRow, { borderBottomColor: theme.bgCardBorder }]}>
                      <Text style={[styles.selectedNum, { color: theme.accent }]}>{i + 1}</Text>
                      <Text style={[styles.selectedName, { color: theme.text }]}>{ex.name}</Text>
                      <View style={styles.orderBtns}>
                        <TouchableOpacity onPress={() => moveUp(i)} style={styles.orderBtn}>
                          <Text style={[styles.orderBtnText, { color: theme.textSecondary }]}>↑</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => moveDown(i)} style={styles.orderBtn}>
                          <Text style={[styles.orderBtnText, { color: theme.textSecondary }]}>↓</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => toggleExercise(ex)} style={styles.orderBtn}>
                          <Text style={{ color: '#e05555', fontSize: 16 }}>×</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* Search + add */}
              <TextInput
                style={[styles.search, { backgroundColor: theme.bgCard, borderColor: theme.bgCardBorder, color: theme.text }]}
                placeholder="Search or add exercise..."
                placeholderTextColor={theme.textTertiary}
                value={search}
                onChangeText={setSearch}
                autoCorrect={false}
              />

              <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
                {search.trim() && !filtered.find(e => e.name.toLowerCase() === search.toLowerCase()) && (
                  <TouchableOpacity style={[styles.addCustom, { borderColor: theme.accent }]} onPress={addCustom}>
                    <Text style={[styles.addCustomText, { color: theme.accent }]}>+ Add "{search}"</Text>
                  </TouchableOpacity>
                )}
                {filtered.map((ex, i) => {
                  const isSelected = selected.find(s => s.name === ex.name);
                  return (
                    <TouchableOpacity
                      key={i}
                      style={[styles.exRow, { backgroundColor: theme.bgCard, borderColor: isSelected ? theme.accent : theme.bgCardBorder }]}
                      onPress={() => toggleExercise(ex)}
                      activeOpacity={0.75}
                    >
                      <Text style={[styles.exName, { color: theme.text }]}>{ex.name}</Text>
                      <View style={styles.exRight}>
                        <View style={styles.exTag}>
                          <Text style={[styles.exTagText, { color: theme.accent }]}>{ex.tag}</Text>
                        </View>
                        {isSelected && <Text style={[styles.exCheck, { color: theme.accent }]}>✓</Text>}
                      </View>
                    </TouchableOpacity>
                  );
                })}
                <View style={{ height: 40 }} />
              </ScrollView>
            </View>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const getStyles = (theme) => ({
  root: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 64 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  back: { color: theme.textSecondary, fontSize: 15, fontWeight: '600' },
  step: { flex: 1, paddingTop: 8 },
  eyebrow: { fontSize: 10, fontWeight: '700', letterSpacing: 4, marginBottom: 12 },
  title: { fontSize: 38, fontWeight: '900', letterSpacing: -1, lineHeight: 44, marginBottom: 8 },
  sub: { fontSize: 14, fontWeight: '400', marginBottom: 28 },
  nameInput: { borderWidth: 1, borderRadius: 16, paddingHorizontal: 20, paddingVertical: 18, fontSize: 20, fontWeight: '700', marginBottom: 24 },
  btn: { marginTop: 'auto' },
  btnGradient: { paddingVertical: 22, borderRadius: 18, alignItems: 'center' },
  btnText: { fontSize: 15, fontWeight: '800', letterSpacing: 3 },
  step1Header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  saveBtn: { borderRadius: 12, overflow: 'hidden' },
  saveBtnGradient: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  saveBtnText: { fontSize: 14, fontWeight: '800', letterSpacing: 1 },
  selectedList: { borderRadius: 14, borderWidth: 1, padding: 12, marginBottom: 12 },
  selectedLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 2, marginBottom: 8 },
  selectedRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1 },
  selectedNum: { fontSize: 12, fontWeight: '800', width: 20 },
  selectedName: { flex: 1, fontSize: 13, fontWeight: '600' },
  orderBtns: { flexDirection: 'row', gap: 4 },
  orderBtn: { padding: 4 },
  orderBtnText: { fontSize: 16, fontWeight: '600' },
  search: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, marginBottom: 8 },
  addCustom: { borderWidth: 1, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginBottom: 8 },
  addCustomText: { fontSize: 14, fontWeight: '700' },
  exRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 6 },
  exName: { fontSize: 14, fontWeight: '600', flex: 1 },
  exRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  exTag: { backgroundColor: 'rgba(157,78,221,0.1)', borderRadius: 100, paddingHorizontal: 8, paddingVertical: 3 },
  exTagText: { fontSize: 10, fontWeight: '600' },
  exCheck: { fontSize: 16, fontWeight: '800' },
});
