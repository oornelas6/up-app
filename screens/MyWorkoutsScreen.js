import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Logo from '../components/Logo';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import * as Haptics from 'expo-haptics';

export default function MyWorkoutsScreen({ navigation }) {
  const theme = useTheme();
  const styles = getStyles(theme);
  const [workouts, setWorkouts] = useState([]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadWorkouts);
    return unsubscribe;
  }, [navigation]);

  const loadWorkouts = async () => {
    try {
      const saved = await AsyncStorage.getItem('my_workouts');
      if (saved) setWorkouts(JSON.parse(saved));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteWorkout = (id) => {
    Alert.alert('Delete Workout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          const updated = workouts.filter(w => w.id !== id);
          setWorkouts(updated);
          await AsyncStorage.setItem('my_workouts', JSON.stringify(updated));
        }
      }
    ]);
  };

  const startWorkout = (workout) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('GuidedWorkout', { workout });
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <LinearGradient colors={theme.gradientBg} style={StyleSheet.absoluteFillObject} />
      <View style={styles.container}>
        <View style={styles.header}>
<View style={{ width: 60 }} />
          <Logo size={36} onPress={() => navigation.navigate('HomeTab')} />
        </View>

        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: theme.text }]}>My Workouts</Text>
          <TouchableOpacity
            style={styles.newBtn}
            onPress={() => navigation.navigate('WorkoutBuilder', { editWorkout: null })}
            activeOpacity={0.8}
          >
            <LinearGradient colors={theme.gradientBtn} style={styles.newBtnGradient}>
              <Text style={[styles.newBtnText, { color: theme.btnText }]}>+ New</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {workouts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No workouts yet.</Text>
            <Text style={[styles.emptySub, { color: theme.textTertiary }]}>
              Build a workout once.{'\n'}Let it flow every time.
            </Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => navigation.navigate('WorkoutBuilder', { editWorkout: null })}
              activeOpacity={0.8}
            >
              <LinearGradient colors={theme.gradientBtn} style={styles.emptyBtnGradient}>
                <Text style={[styles.emptyBtnText, { color: theme.btnText }]}>BUILD YOUR FIRST WORKOUT</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 24 }}>
            {workouts.map((workout) => (
              <View key={workout.id} style={[styles.card, { backgroundColor: theme.bgCard, borderColor: theme.bgCardBorder }]}>
                <TouchableOpacity
                  style={styles.cardMain}
                  onPress={() => startWorkout(workout)}
                  activeOpacity={0.8}
                >
                  <View style={styles.cardLeft}>
                    <Text style={[styles.cardName, { color: theme.text }]}>{workout.name}</Text>
                    <Text style={[styles.cardMeta, { color: theme.textTertiary }]}>
                      {workout.exercises.length} exercises · {workout.split || 'Custom'}
                    </Text>
                    <View style={styles.exPills}>
                      {workout.exercises.slice(0, 3).map((ex, i) => (
                        <View key={i} style={styles.exPill}>
                          <Text style={[styles.exPillText, { color: theme.textSecondary }]}>{ex.name}</Text>
                        </View>
                      ))}
                      {workout.exercises.length > 3 && (
                        <View style={styles.exPill}>
                          <Text style={[styles.exPillText, { color: theme.textSecondary }]}>+{workout.exercises.length - 3}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <Text style={[styles.startArrow, { color: theme.accent }]}>›</Text>
                </TouchableOpacity>

                <View style={[styles.cardActions, { borderTopColor: theme.bgCardBorder }]}>
                  <TouchableOpacity
                    style={styles.cardAction}
                    onPress={() => navigation.navigate('WorkoutBuilder', { editWorkout: workout })}
                  >
                    <Text style={[styles.cardActionText, { color: theme.textSecondary }]}>Edit</Text>
                  </TouchableOpacity>
                  <View style={[styles.cardActionDiv, { backgroundColor: theme.bgCardBorder }]} />
                  <TouchableOpacity style={styles.cardAction} onPress={() => deleteWorkout(workout.id)}>
                    <Text style={[styles.cardActionText, { color: '#e05555' }]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            <View style={{ height: 40 }} />
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const getStyles = (theme) => ({
  root: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 64 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  back: { color: theme.textSecondary, fontSize: 15, fontWeight: '600' },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 38, fontWeight: '900', letterSpacing: -1 },
  newBtn: { borderRadius: 12, overflow: 'hidden' },
  newBtnGradient: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  newBtnText: { fontSize: 13, fontWeight: '700', letterSpacing: 0.5 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 80 },
  emptyTitle: { fontSize: 22, fontWeight: '800', marginBottom: 8, letterSpacing: -0.5 },
  emptySub: { fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  emptyBtn: { borderRadius: 16, overflow: 'hidden' },
  emptyBtnGradient: { paddingVertical: 18, paddingHorizontal: 28, borderRadius: 16 },
  emptyBtnText: { fontSize: 13, fontWeight: '800', letterSpacing: 2 },
  card: { borderRadius: 20, borderWidth: 1, marginBottom: 12, overflow: 'hidden' },
  cardMain: { flexDirection: 'row', alignItems: 'center', padding: 18 },
  cardLeft: { flex: 1 },
  cardName: { fontSize: 18, fontWeight: '800', marginBottom: 3, letterSpacing: -0.3 },
  cardMeta: { fontSize: 12, fontWeight: '500', marginBottom: 10 },
  exPills: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  exPill: { backgroundColor: 'rgba(157,78,221,0.1)', borderRadius: 100, paddingHorizontal: 8, paddingVertical: 3 },
  exPillText: { fontSize: 10, fontWeight: '500' },
  startArrow: { fontSize: 28, fontWeight: '300', marginLeft: 12 },
  cardActions: { flexDirection: 'row', borderTopWidth: 1 },
  cardAction: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  cardActionText: { fontSize: 13, fontWeight: '600' },
  cardActionDiv: { width: 1, marginVertical: 8 },
});
