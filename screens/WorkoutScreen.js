import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput, Modal, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { useSettings } from '../context/SettingsContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EXERCISES = {
  Push: [
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
    { name: 'Hanging Leg Raises', tag: 'Abs' },
  ],
  Pull: [
    { name: 'Chest Supported Row', tag: 'Back' },
    { name: 'Bent Over Barbell Row', tag: 'Back' },
    { name: 'Seated Cable Row', tag: 'Back' },
    { name: 'Wide Grip Lat Pulldown', tag: 'Back' },
    { name: 'Straight Arm Lat Pulldown', tag: 'Back' },
    { name: 'Rear Delt Fly Machine', tag: 'Shoulders' },
    { name: 'Hammer Curl', tag: 'Biceps' },
    { name: 'Preacher Curl', tag: 'Biceps' },
    { name: 'Incline Curl', tag: 'Biceps' },
    { name: 'Weighted Sit Ups', tag: 'Abs' },
  ],
  Legs: [
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
    { name: 'Stair Master', tag: 'Cardio' },
  ],

  Arms: [
    { name: 'Overhead Press', tag: 'Shoulders' },
    { name: 'Push Ups', tag: 'Chest' },
    { name: 'Overhead Tricep Extension', tag: 'Triceps' },
    { name: 'Cable Tricep Kickback', tag: 'Triceps' },
    { name: 'Straight Bar Curl', tag: 'Biceps' },
    { name: 'EZ Bar Curl', tag: 'Biceps' },
    { name: 'Supinated DB Curl', tag: 'Biceps' },
    { name: 'Lateral Raises', tag: 'Shoulders' },
    { name: 'Flutter Kicks', tag: 'Abs' },
    { name: 'Russian Twists', tag: 'Abs' },
  ],
  Upper: [
    { name: 'Flat Barbell Bench', tag: 'Chest' },
    { name: 'Bent Over Barbell Row', tag: 'Back' },
    { name: 'Overhead Press', tag: 'Shoulders' },
    { name: 'Wide Grip Lat Pulldown', tag: 'Back' },
    { name: 'Lateral Raises', tag: 'Shoulders' },
    { name: 'Tricep Pushdown', tag: 'Triceps' },
    { name: 'Hammer Curl', tag: 'Biceps' },
  ],
  Lower: [
    { name: 'Back Squat', tag: 'Quads' },
    { name: 'RDL', tag: 'Hamstrings' },
    { name: 'Leg Extension', tag: 'Quads' },
    { name: 'Seated Hamstring Curl', tag: 'Hamstrings' },
    { name: 'Calf Raises', tag: 'Calves' },
    { name: 'Walking Lunges', tag: 'Quads' },
    { name: 'Hanging Leg Raises', tag: 'Abs' },
  ],
  'Full Body': [
    { name: 'Back Squat', tag: 'Quads' },
    { name: 'Flat Barbell Bench', tag: 'Chest' },
    { name: 'Bent Over Barbell Row', tag: 'Back' },
    { name: 'Overhead Press', tag: 'Shoulders' },
    { name: 'RDL', tag: 'Hamstrings' },
    { name: 'Weighted Dips', tag: 'Triceps' },
    { name: 'Hammer Curl', tag: 'Biceps' },
    { name: 'Hanging Leg Raises', tag: 'Abs' },
  ],
  Custom: [],
};

export default function WorkoutScreen({ navigation, route }) {
  const { split } = route.params;
  const exercises = EXERCISES[split] || [];
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customExercise, setCustomExercise] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loggedExercises, setLoggedExercises] = useState([]);
  const { sessionSets, clearSession } = useSettings();
  const [sessionStartTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (split === 'Custom') {
      setShowCustomInput(true);
    }
  }, []);

  useEffect(() => {
  timerRef.current = setInterval(() => {
    setElapsedTime(t => t + 1);
  }, 1000);
  return () => clearInterval(timerRef.current);
}, []);

useEffect(() => {
  const unsubscribe = navigation.addListener('focus', () => {
    const routes = navigation.getState()?.routes;
    const workoutRoute = routes?.find(r => r.name === 'Workout');
    const params = workoutRoute?.params;
    if (params?.lastLoggedExercise) {
      setLoggedExercises(prev =>
        prev.includes(params.lastLoggedExercise)
          ? prev
          : [...prev, params.lastLoggedExercise]
      );
    }
  });
  return unsubscribe;
}, [navigation]);

  const formatElapsed = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.root}>
        <LinearGradient
          colors={['rgba(60,0,100,0.4)', 'rgba(8,0,16,0.95)']}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.container}>
          <View style={styles.header}>

           <TouchableOpacity onPress={() => {
              if (loggedExercises.length > 0) {
                Alert.alert(
                  'Leave Workout?',
                  'Your progress will be saved.',
                  [
                    { text: 'Keep Going', style: 'cancel' },
                    { 
                      text: 'Save & Leave', 
                      onPress: async () => {
                        await AsyncStorage.setItem('saved_workout', JSON.stringify({
                          split,
                          loggedExercises,
                          savedAt: new Date().toISOString(),
                        }));
                        navigation.goBack();
                      }
                    }
                  ]
                );
              } else {
                navigation.goBack();
              }
            }}>

              <Text style={styles.back}>← Back</Text>
            </TouchableOpacity>
      <Text style={styles.timerDisplay}>{formatElapsed(elapsedTime)}</Text>
      <Text style={styles.logo}>UP</Text>
          </View>

          <Text style={styles.title}>{split} Day</Text>
          <Text style={styles.subtitle}>{exercises.length} exercises · Tap to log</Text>

          <View style={styles.searchBar}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search exercises..."
              placeholderTextColor="rgba(255,255,255,0.25)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCorrect={false}
            />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 8 }}>
            {exercises
              .filter(ex => ex.name.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((ex, i) => {
                const isLogged = loggedExercises.includes(ex.name);
                return (
                 <TouchableOpacity
                key={i}
                style={[styles.card, isLogged && styles.cardLogged]}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('Revolver', { exercise: ex.name, split })}
                onLongPress={() => navigation.navigate('PRHistory', { exercise: ex.name })}
              >
                    <Text style={styles.exName}>{ex.name}</Text>
                    <View style={styles.cardRight}>
                      {isLogged && <Text style={styles.checkmark}>✓</Text>}
                      <View style={[styles.tag, isLogged && styles.tagLogged]}>
                        <Text style={styles.tagText}>{ex.tag}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            <View style={{ height: 16 }} />
            <TouchableOpacity
              style={styles.customBtn}
              onPress={() => setShowCustomInput(true)}
            >
              <Text style={styles.customBtnText}>+ Add Custom Exercise</Text>
            </TouchableOpacity>
          </ScrollView>

         <TouchableOpacity
              style={styles.finishBtn}
              activeOpacity={0.9}
              onPress={async () => {
                try {
                  const response = await fetch(
                    'https://lurl0xn2b7.execute-api.us-east-1.amazonaws.com/history?userId=user-test-001'
                  );
                  const data = await response.json();
                  const allSets = data.sets || [];
                  const today = new Date().toISOString().split('T')[0];
                  const todaySets = allSets.filter(s => s.timestamp?.startsWith(today));
                  
                  navigation.navigate('Summary', {
                    sets: todaySets,
                    split,
duration: elapsedTime
                  });
                } catch (err) {
                  navigation.navigate('Summary', {
                    sets: [],
                    split,
duration: elapsedTime
                  });
                }
              }}
          >
            <LinearGradient
              colors={['#7b2cbf', '#4a0080']}
              style={styles.finishBtnGradient}
            >
              <Text style={styles.finishBtnText}>FINISH WORKOUT</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

                <Modal visible={showCustomInput} transparent animationType="slide">
                <KeyboardAvoidingView 
                  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                  style={{ flex: 1 }}
                >
                  <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.modalOverlay}>
                      <View style={styles.modalBox}>
                <Text style={styles.modalTitle}>Custom Exercise</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Exercise name..."
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  value={customExercise}
                  onChangeText={setCustomExercise}
                  autoFocus
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.modalBtn}
                  onPress={() => {
                    if (customExercise.trim()) {
                      navigation.navigate('Revolver', {
                        exercise: customExercise.trim(),
                        split
                      });
                      setCustomExercise('');
                      setSearchQuery('');
                      setShowCustomInput(false);
                      Keyboard.dismiss();
                    }
                  }}
                >
                  <LinearGradient colors={['#7b2cbf', '#4a0080']} style={styles.modalBtnGradient}>
                    <Text style={styles.modalBtnText}>START LOGGING</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setShowCustomInput(false); Keyboard.dismiss(); }}>
                  <Text style={styles.modalCancel}>Cancel</Text>
                  </TouchableOpacity>
                        </View>
                  </View>
                </TouchableWithoutFeedback>
              </KeyboardAvoidingView>
           </Modal>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#080010' },
  container: { flex: 1, paddingHorizontal: 28, paddingTop: 64, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  back: { color: 'rgba(255,255,255,0.4)', fontSize: 15, fontWeight: '600' },
  logo: { fontSize: 26, fontWeight: '900', color: '#ffffff', letterSpacing: 4 },
  title: { fontSize: 36, fontWeight: '800', color: '#ffffff', letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.3)', marginTop: 6, fontWeight: '400' },
  searchBar: { marginBottom: 8, marginTop: 12 },
  searchInput: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, color: '#ffffff', fontSize: 15 },
  card: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(157,78,221,0.15)', borderRadius: 16, padding: 20, marginBottom: 10 },
  cardLogged: { borderColor: 'rgba(157,78,221,0.5)', backgroundColor: 'rgba(123,44,191,0.12)' },
  cardRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkmark: { color: '#9d4edd', fontSize: 16, fontWeight: '800' },
  exName: { fontSize: 16, fontWeight: '600', color: '#ffffff', flex: 1 },
  tag: { backgroundColor: 'rgba(157,78,221,0.15)', borderWidth: 1, borderColor: 'rgba(157,78,221,0.3)', borderRadius: 100, paddingHorizontal: 10, paddingVertical: 4 },
  tagLogged: { borderColor: 'rgba(157,78,221,0.5)' },
  tagText: { fontSize: 11, fontWeight: '600', color: '#9d4edd', letterSpacing: 0.5 },
  customBtn: { paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  customBtnText: { color: 'rgba(157,78,221,0.7)', fontSize: 14, fontWeight: '600', letterSpacing: 0.5 },
  finishBtn: { marginTop: 16, marginBottom: 8 },
  finishBtnGradient: { paddingVertical: 18, borderRadius: 18, alignItems: 'center' },
  finishBtnText: { color: 'white', fontSize: 15, fontWeight: '800', letterSpacing: 3 },
  timerDisplay: { fontSize: 14, fontWeight: '700', color: 'rgba(157,78,221,0.7)', letterSpacing: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: '#1a0035', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 28, paddingBottom: 48 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#ffffff', marginBottom: 16 },
  modalInput: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(157,78,221,0.3)', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: '#ffffff', fontSize: 16, marginBottom: 16 },
  modalBtn: { marginBottom: 12 },
  modalBtnGradient: { paddingVertical: 18, borderRadius: 14, alignItems: 'center' },
  modalBtnText: { color: 'white', fontSize: 15, fontWeight: '800', letterSpacing: 2 },
  modalCancel: { color: 'rgba(255,255,255,0.3)', fontSize: 14, textAlign: 'center', paddingVertical: 8 },
});
