import { StyleSheet, Text, View, TouchableOpacity, TextInput, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const GOALS = [
  { id: 'strength', label: 'Strength', sub: 'Get stronger. Move more weight.' },
  { id: 'muscle', label: 'Muscle', sub: 'Build size. Progressive overload.' },
  { id: 'endurance', label: 'Endurance', sub: 'Last longer. Go harder.' },
  { id: 'general', label: 'General Fitness', sub: 'Look good. Feel good.' },
];

const SPLITS = ['PPL', 'Upper/Lower', 'Full Body', 'Arnold', 'Custom'];

export default function OnboardingScreen({ onFinish }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [goal, setGoal] = useState(null);
  const [split, setSplit] = useState(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const nextStep = () => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
    setStep(s => s + 1);
  };

  const finish = async () => {
    await AsyncStorage.setItem('onboarding_complete', 'true');
    await AsyncStorage.setItem('user_name', name);
    await AsyncStorage.setItem('user_goal', goal);
    await AsyncStorage.setItem('user_split', split);
    onFinish({ name, goal, split });
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#3c096c', '#240046', '#0a000f']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Progress dots */}
      <View style={styles.dots}>
        {[0, 1, 2].map(i => (
          <View key={i} style={[styles.dot, step === i && styles.dotActive]} />
        ))}
      </View>

      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>

        {step === 0 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepLabel}>WELCOME TO UP</Text>
            <Text style={styles.stepTitle}>What should{'\n'}we call you?</Text>
            <TextInput
              style={styles.nameInput}
              placeholder="Your name..."
              placeholderTextColor="rgba(255,255,255,0.25)"
              value={name}
              onChangeText={setName}
              autoFocus
              autoCorrect={false}
            />
            <TouchableOpacity
              style={[styles.nextBtn, !name.trim() && styles.nextBtnDisabled]}
              onPress={() => name.trim() && nextStep()}
            >
              <LinearGradient
                colors={name.trim() ? ['#7b2cbf', '#4a0080'] : ['#333', '#222']}
                style={styles.nextBtnGradient}
              >
                <Text style={styles.nextBtnText}>CONTINUE</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {step === 1 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepLabel}>YOUR GOAL</Text>
            <Text style={styles.stepTitle}>What are you{'\n'}training for?</Text>
            <View style={styles.optionsContainer}>
              {GOALS.map(g => (
                <TouchableOpacity
                  key={g.id}
                  style={[styles.optionCard, goal === g.id && styles.optionCardActive]}
                  onPress={() => setGoal(g.id)}
                >
                  <Text style={[styles.optionLabel, goal === g.id && styles.optionLabelActive]}>
                    {g.label}
                  </Text>
                  <Text style={styles.optionSub}>{g.sub}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={[styles.nextBtn, !goal && styles.nextBtnDisabled]}
              onPress={() => goal && nextStep()}
            >
              <LinearGradient
                colors={goal ? ['#7b2cbf', '#4a0080'] : ['#333', '#222']}
                style={styles.nextBtnGradient}
              >
                <Text style={styles.nextBtnText}>CONTINUE</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {step === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepLabel}>YOUR SPLIT</Text>
            <Text style={styles.stepTitle}>How do you{'\n'}like to train?</Text>
            <View style={styles.optionsContainer}>
              {SPLITS.map(s => (
                <TouchableOpacity
                  key={s}
                  style={[styles.optionCard, split === s && styles.optionCardActive]}
                  onPress={() => setSplit(s)}
                >
                  <Text style={[styles.optionLabel, split === s && styles.optionLabelActive]}>
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={[styles.nextBtn, !split && styles.nextBtnDisabled]}
              onPress={() => split && finish()}
            >
              <LinearGradient
                colors={split ? ['#7b2cbf', '#4a0080'] : ['#333', '#222']}
                style={styles.nextBtnGradient}
              >
                <Text style={styles.nextBtnText}>LET'S GO</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a000f' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, paddingTop: 64, marginBottom: 8 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.2)' },
  dotActive: { backgroundColor: '#9d4edd', width: 20 },
  container: { flex: 1, paddingHorizontal: 28, paddingTop: 40, paddingBottom: 40 },
  stepContainer: { flex: 1 },
  stepLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 3, color: '#9d4edd', marginBottom: 12 },
  stepTitle: { fontSize: 42, fontWeight: '900', color: '#ffffff', letterSpacing: -1, lineHeight: 48, marginBottom: 40 },
  nameInput: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(157,78,221,0.3)', borderRadius: 16, paddingHorizontal: 20, paddingVertical: 18, color: '#ffffff', fontSize: 20, marginBottom: 24, fontWeight: '600' },
  optionsContainer: { gap: 10, marginBottom: 24 },
  optionCard: { backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 16, padding: 20 },
  optionCardActive: { backgroundColor: 'rgba(123,44,191,0.2)', borderColor: '#7b2cbf' },
  optionLabel: { fontSize: 18, fontWeight: '700', color: 'rgba(255,255,255,0.6)', marginBottom: 4 },
  optionLabelActive: { color: '#ffffff' },
  optionSub: { fontSize: 12, color: 'rgba(255,255,255,0.25)', fontWeight: '400' },
  nextBtn: { marginTop: 'auto' },
  nextBtnDisabled: { opacity: 0.5 },
  nextBtnGradient: { paddingVertical: 22, borderRadius: 18, alignItems: 'center' },
  nextBtnText: { color: 'white', fontSize: 15, fontWeight: '800', letterSpacing: 3 },
});