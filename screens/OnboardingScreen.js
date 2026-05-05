import { StyleSheet, Text, View, TouchableOpacity, TextInput, Animated, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useRef, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const GOALS = [
  { id: 'strength', emoji: '🏋️', label: 'Get Stronger', sub: 'Build raw strength and move more weight.' },
  { id: 'muscle', emoji: '💪', label: 'Build Muscle', sub: 'Hypertrophy focus. Progressive overload.' },
  { id: 'endurance', emoji: '⚡', label: 'Endurance', sub: 'Last longer. Go harder. Never gas out.' },
  { id: 'general', emoji: '🎯', label: 'General Fitness', sub: 'Look good. Feel good. Stay consistent.' },
];

const SPLITS = [
  { id: 'PPL', label: 'PPL', sub: 'Push Pull Legs — 6 days' },
  { id: 'Upper/Lower', label: 'Upper / Lower', sub: '4 days — balanced' },
  { id: 'Full Body', label: 'Full Body', sub: '3 days — efficient' },
  { id: 'Arnold', label: 'Arnold Split', sub: '6 days — classic' },
  { id: 'Custom', label: 'My Own', sub: 'I know what I\'m doing' },
];

export default function OnboardingScreen({ onFinish }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [goal, setGoal] = useState(null);
  const [split, setSplit] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    animateIn();
  }, [step]);

  const animateIn = () => {
    fadeAnim.setValue(0);
    slideAnim.setValue(30);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 8, useNativeDriver: true }),
    ]).start();
  };

  const nextStep = () => setStep(s => s + 1);

  const finish = async () => {
    await AsyncStorage.setItem('onboarding_complete', 'true');
    await AsyncStorage.setItem('user_name', name);
    await AsyncStorage.setItem('user_goal', goal);
    await AsyncStorage.setItem('user_split', split);
    onFinish({ name, goal, split });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <View style={styles.root}>
        <LinearGradient
          colors={['#1a0035', '#0a000f']}
          style={StyleSheet.absoluteFillObject}
        />

        {/* Progress bar */}
        <View style={styles.progressContainer}>
          {[0, 1, 2].map(i => (
            <View key={i} style={[styles.progressDot, step >= i && styles.progressDotActive, step === i && styles.progressDotCurrent]} />
          ))}
        </View>

        <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

          {/* STEP 0 — Name */}
          {step === 0 && (
            <View style={styles.stepContainer}>
              <Text style={styles.eyebrow}>WELCOME TO UP</Text>
              <Text style={styles.headline}>What do we{'\n'}call you?</Text>
              <Text style={styles.body}>Your coach needs a name.</Text>
              <TextInput
                style={styles.nameInput}
                placeholder="First name..."
                placeholderTextColor="rgba(255,255,255,0.2)"
                value={name}
                onChangeText={setName}
                autoFocus
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={() => name.trim() && nextStep()}
              />
              <TouchableOpacity
                style={[styles.primaryBtn, !name.trim() && styles.primaryBtnDisabled]}
                onPress={() => name.trim() && nextStep()}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={name.trim() ? ['#7b2cbf', '#4a0080'] : ['#1a0035', '#0f0020']}
                  style={styles.primaryBtnGradient}
                >
                  <Text style={styles.primaryBtnText}>CONTINUE</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {/* STEP 1 — Goal */}
          {step === 1 && (
            <View style={styles.stepContainer}>
              <Text style={styles.eyebrow}>YOUR GOAL</Text>
              <Text style={styles.headline}>What are you{'\n'}training for?</Text>
              <Text style={styles.body}>Be honest. UP will push you accordingly.</Text>
              <View style={styles.optionsGrid}>
                {GOALS.map(g => (
                  <TouchableOpacity
                    key={g.id}
                    style={[styles.goalCard, goal === g.id && styles.goalCardActive]}
                    onPress={() => setGoal(g.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.goalEmoji}>{g.emoji}</Text>
                    <Text style={[styles.goalLabel, goal === g.id && styles.goalLabelActive]}>{g.label}</Text>
                    <Text style={styles.goalSub}>{g.sub}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                style={[styles.primaryBtn, !goal && styles.primaryBtnDisabled]}
                onPress={() => goal && nextStep()}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={goal ? ['#7b2cbf', '#4a0080'] : ['#1a0035', '#0f0020']}
                  style={styles.primaryBtnGradient}
                >
                  <Text style={styles.primaryBtnText}>CONTINUE</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {/* STEP 2 — Split */}
          {step === 2 && (
            <View style={styles.stepContainer}>
              <Text style={styles.eyebrow}>YOUR SPLIT</Text>
              <Text style={styles.headline}>How do you{'\n'}like to train?</Text>
              <Text style={styles.body}>You can always change this later.</Text>
              <View style={styles.splitList}>
                {SPLITS.map(s => (
                  <TouchableOpacity
                    key={s.id}
                    style={[styles.splitCard, split === s.id && styles.splitCardActive]}
                    onPress={() => setSplit(s.id)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.splitLeft}>
                      <Text style={[styles.splitLabel, split === s.id && styles.splitLabelActive]}>{s.label}</Text>
                      <Text style={styles.splitSub}>{s.sub}</Text>
                    </View>
                    {split === s.id && (
                      <View style={styles.splitCheck}>
                        <Text style={styles.splitCheckText}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                style={[styles.primaryBtn, !split && styles.primaryBtnDisabled]}
                onPress={() => split && finish()}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={split ? ['#7b2cbf', '#4a0080'] : ['#1a0035', '#0f0020']}
                  style={styles.primaryBtnGradient}
                >
                  <Text style={styles.primaryBtnText}>LET'S GO</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a000f' },
  progressContainer: { flexDirection: 'row', justifyContent: 'center', gap: 8, paddingTop: 64, marginBottom: 8 },
  progressDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.15)' },
  progressDotActive: { backgroundColor: 'rgba(157,78,221,0.5)' },
  progressDotCurrent: { width: 24, backgroundColor: '#9d4edd' },
  container: { flex: 1, paddingHorizontal: 28, paddingTop: 24, paddingBottom: 48 },
  stepContainer: { flex: 1 },
  eyebrow: { fontSize: 10, fontWeight: '700', letterSpacing: 4, color: '#9d4edd', marginBottom: 12 },
  headline: { fontSize: 44, fontWeight: '900', color: '#ffffff', letterSpacing: -1, lineHeight: 50, marginBottom: 12 },
  body: { fontSize: 14, color: 'rgba(255,255,255,0.35)', marginBottom: 32, fontWeight: '400' },
  nameInput: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(157,78,221,0.3)', borderRadius: 16, paddingHorizontal: 20, paddingVertical: 20, color: '#ffffff', fontSize: 22, marginBottom: 24, fontWeight: '700' },
  optionsGrid: { gap: 10, marginBottom: 24 },
  goalCard: { backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', borderRadius: 16, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14 },
  goalCardActive: { backgroundColor: 'rgba(123,44,191,0.2)', borderColor: '#7b2cbf' },
  goalEmoji: { fontSize: 24, width: 32 },
  goalLabel: { fontSize: 16, fontWeight: '700', color: 'rgba(255,255,255,0.5)', marginBottom: 2 },
  goalLabelActive: { color: '#ffffff' },
  goalSub: { fontSize: 11, color: 'rgba(255,255,255,0.25)', fontWeight: '400', flex: 1 },
  splitList: { gap: 8, marginBottom: 24 },
  splitCard: { backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', borderRadius: 14, padding: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  splitCardActive: { backgroundColor: 'rgba(123,44,191,0.2)', borderColor: '#7b2cbf' },
  splitLeft: { flex: 1 },
  splitLabel: { fontSize: 16, fontWeight: '700', color: 'rgba(255,255,255,0.5)', marginBottom: 2 },
  splitLabelActive: { color: '#ffffff' },
  splitSub: { fontSize: 11, color: 'rgba(255,255,255,0.25)' },
  splitCheck: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#7b2cbf', alignItems: 'center', justifyContent: 'center' },
  splitCheckText: { color: 'white', fontSize: 12, fontWeight: '800' },
  primaryBtn: { marginTop: 'auto' },
  primaryBtnDisabled: { opacity: 0.4 },
  primaryBtnGradient: { paddingVertical: 22, borderRadius: 18, alignItems: 'center' },
  primaryBtnText: { color: 'white', fontSize: 15, fontWeight: '800', letterSpacing: 3 },
});