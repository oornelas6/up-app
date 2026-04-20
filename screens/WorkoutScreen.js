import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

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

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['rgba(60,0,100,0.4)', 'rgba(8,0,16,0.95)']}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.back}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.logo}>UP</Text>
        </View>

        <Text style={styles.title}>{split} Day</Text>
        <Text style={styles.subtitle}>{exercises.length} exercises · Tap to log</Text>

        <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 24 }}>
          {exercises.map((ex, i) => (
            <TouchableOpacity
              key={i}
              style={styles.card}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Revolver', { exercise: ex.name, split: split })}
            >
              <Text style={styles.exName}>{ex.name}</Text>
              <View style={styles.tag}>
                <Text style={styles.tagText}>{ex.tag}</Text>
              </View>
            </TouchableOpacity>
          ))}
          <View style={{ height: 16 }} />
        </ScrollView>

        <TouchableOpacity
          style={styles.finishBtn}
          activeOpacity={0.9}
          onPress={() => navigation.navigate('Summary', {
            sets: [],
            split: split,
            duration: 0
          })}
        >
          <LinearGradient
            colors={['#7b2cbf', '#4a0080']}
            style={styles.finishBtnGradient}
          >
            <Text style={styles.finishBtnText}>FINISH WORKOUT</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
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
  card: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(157,78,221,0.15)', borderRadius: 16, padding: 20, marginBottom: 10 },
  exName: { fontSize: 16, fontWeight: '600', color: '#ffffff', flex: 1 },
  tag: { backgroundColor: 'rgba(157,78,221,0.15)', borderWidth: 1, borderColor: 'rgba(157,78,221,0.3)', borderRadius: 100, paddingHorizontal: 10, paddingVertical: 4 },
  tagText: { fontSize: 11, fontWeight: '600', color: '#9d4edd', letterSpacing: 0.5 },
  finishBtn: { marginTop: 16, marginBottom: 8 },
  finishBtnGradient: { paddingVertical: 18, borderRadius: 18, alignItems: 'center' },
  finishBtnText: { color: 'white', fontSize: 15, fontWeight: '800', letterSpacing: 3 },
});