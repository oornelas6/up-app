import { StyleSheet, Text, View, TouchableOpacity, TextInput, Animated, Dimensions, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Logo from '../components/Logo';
import { useState, useRef, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

const GOALS = [
  { id: 'strength', label: 'Get stronger.', sub: 'I want to move more weight. Simple.' },
  { id: 'muscle', label: 'Build muscle.', sub: 'I want to look the part. Progressive overload.' },
  { id: 'performance', label: 'Perform better.', sub: 'I train to compete, not just look good.' },
  { id: 'consistency', label: 'Stay consistent.', sub: 'I just want to show up. Every week.' },
];

const SPLITS = [
  { id: 'PPL', label: 'Push / Pull / Legs', sub: '6 days — the classic' },
  { id: 'Upper/Lower', label: 'Upper / Lower', sub: '4 days — balanced and efficient' },
  { id: 'Full Body', label: 'Full Body', sub: '3 days — simple, effective' },
  { id: 'Custom', label: 'My own thing', sub: 'I know what works for me' },
];

export default function OnboardingScreen({ onFinish }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [goal, setGoal] = useState(null);
  const [split, setSplit] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(24);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 55, friction: 9, useNativeDriver: true }),
    ]).start();
  }, [step]);

  const advance = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep(s => s + 1);
  };

  const finish = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await AsyncStorage.setItem('onboarding_complete', 'true');
    await AsyncStorage.setItem('user_name', name.trim());
    await AsyncStorage.setItem('user_goal', goal);
    await AsyncStorage.setItem('user_split', split);
    onFinish({ name: name.trim(), goal, split });
  };

  const firstName = name.trim().split(' ')[0];

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <View style={styles.root}>
        <LinearGradient colors={['#1a0035', '#080010']} style={StyleSheet.absoluteFillObject} />

        {/* Progress */}
        <View style={styles.progress}>
          {[0, 1, 2, 3].map(i => (
            <View key={i} style={[
              styles.progressSeg,
              { backgroundColor: i < step ? '#7b2cbf' : i === step ? '#9d4edd' : 'rgba(255,255,255,0.08)' },
              i === step && { opacity: 1 }
            ]} />
          ))}
        </View>

        <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

          {/* ── STEP 0: Name ── */}
          {step === 0 && (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.step}>
              <View style={styles.logoRow}>
                <Logo size={32} tappable={false} />
              </View>
              <View style={styles.copyBlock}>
                <Text style={styles.eyebrow}>WELCOME</Text>
                <Text style={styles.headline}>The app you've{'\n'}been waiting for.</Text>
                <Text style={styles.body}>
                  No more typing between sets.{'\n'}No excuses not to track.{'\n'}Just you, the bar, and UP.
                </Text>
              </View>
              <View style={styles.inputBlock}>
                <Text style={styles.inputLabel}>First, what's your name?</Text>
                <TextInput
                  style={styles.nameInput}
                  placeholder="Your name..."
                  placeholderTextColor="rgba(255,255,255,0.2)"
                  value={name}
                  onChangeText={setName}
                  autoFocus
                  autoCorrect={false}
                  autoCapitalize="words"
                  returnKeyType="done"
                  onSubmitEditing={() => name.trim() && advance()}
                />
              </View>
              <TouchableOpacity
                style={[styles.btn, !name.trim() && { opacity: 0.3 }]}
                onPress={() => name.trim() && advance()}
                activeOpacity={0.85}
              >
                <LinearGradient colors={['#7b2cbf', '#4a0080']} style={styles.btnGradient}>
                  <Text style={styles.btnText}>CONTINUE</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
            </TouchableWithoutFeedback>
          )}

          {/* ── STEP 1: Goal ── */}
          {step === 1 && (
            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <View style={styles.step}>
                <View style={styles.copyBlock}>
                  <Text style={styles.eyebrow}>YOUR WHY</Text>
                  <Text style={styles.headline}>What are you{'\n'}chasing, {firstName}?</Text>
                  <Text style={styles.body}>Be honest with yourself. This is just between you and UP.</Text>
                </View>
                <View style={styles.optionList}>
                  {GOALS.map(g => (
                    <TouchableOpacity
                      key={g.id}
                      style={[styles.optionCard, goal === g.id && styles.optionCardActive]}
                      onPress={() => { setGoal(g.id); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                      activeOpacity={0.8}
                    >
                      <View style={styles.optionLeft}>
                        <Text style={[styles.optionLabel, goal === g.id && styles.optionLabelActive]}>{g.label}</Text>
                        <Text style={styles.optionSub}>{g.sub}</Text>
                      </View>
                      {goal === g.id && (
                        <View style={styles.optionCheck}>
                          <Text style={styles.optionCheckText}>✓</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity
                  style={[styles.btn, !goal && { opacity: 0.3 }, { marginTop: 24, marginBottom: 40 }]}
                  onPress={() => goal && advance()}
                  activeOpacity={0.85}
                >
                  <LinearGradient colors={['#7b2cbf', '#4a0080']} style={styles.btnGradient}>
                    <Text style={styles.btnText}>CONTINUE</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}

          {/* ── STEP 2: Split ── */}
          {step === 2 && (
            <View style={styles.step}>
              <View style={styles.copyBlock}>
                <Text style={styles.eyebrow}>YOUR TRAINING</Text>
                <Text style={styles.headline}>How do you{'\n'}like to train?</Text>
                <Text style={styles.body}>You can change this any time. No commitment.</Text>
              </View>
              <View style={styles.optionList}>
                {SPLITS.map(s => (
                  <TouchableOpacity
                    key={s.id}
                    style={[styles.optionCard, split === s.id && styles.optionCardActive]}
                    onPress={() => { setSplit(s.id); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                    activeOpacity={0.8}
                  >
                    <View style={styles.optionLeft}>
                      <Text style={[styles.optionLabel, split === s.id && styles.optionLabelActive]}>{s.label}</Text>
                      <Text style={styles.optionSub}>{s.sub}</Text>
                    </View>
                    {split === s.id && (
                      <View style={styles.optionCheck}>
                        <Text style={styles.optionCheckText}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                style={[styles.btn, !split && { opacity: 0.3 }]}
                onPress={() => split && advance()}
                activeOpacity={0.85}
              >
                <LinearGradient colors={['#7b2cbf', '#4a0080']} style={styles.btnGradient}>
                  <Text style={styles.btnText}>CONTINUE</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          {/* ── STEP 3: Sendoff ── */}
          {step === 3 && (
            <View style={[styles.step, { justifyContent: 'center', alignItems: 'center' }]}>
              <Logo size={64} tappable={false} />
              <View style={[styles.copyBlock, { alignItems: 'center', marginTop: 32 }]}>
                <Text style={[styles.eyebrow, { textAlign: 'center' }]}>YOU'RE ALL SET</Text>
                <Text style={[styles.headline, { textAlign: 'center', fontSize: 40 }]}>
                  Let's get to work,{'\n'}{firstName}.
                </Text>
                <Text style={[styles.body, { textAlign: 'center' }]}>
                  Every set logged is one step further{'\n'}than you were yesterday.{'\n'}That's all this is.
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.btn, { marginTop: 48 }]}
                onPress={finish}
                activeOpacity={0.85}
              >
                <LinearGradient colors={['#7b2cbf', '#4a0080']} style={styles.btnGradient}>
                  <Text style={styles.btnText}>I'M READY</Text>
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
  root: { flex: 1, backgroundColor: '#080010' },
  progress: { flexDirection: 'row', gap: 4, paddingHorizontal: 28, paddingTop: 60, marginBottom: 4 },
  progressSeg: { flex: 1, height: 3, borderRadius: 2 },
  container: { flex: 1, paddingHorizontal: 28, paddingBottom: 48 },
  step: { flex: 1, paddingTop: 20 },
  logoRow: { marginBottom: 32 },
  copyBlock: { marginBottom: 32 },
  eyebrow: { fontSize: 10, fontWeight: '700', letterSpacing: 4, color: '#9d4edd', marginBottom: 14 },
  headline: { fontSize: 42, fontWeight: '900', color: '#ffffff', letterSpacing: -1, lineHeight: 48, marginBottom: 14 },
  body: { fontSize: 15, color: 'rgba(255,255,255,0.35)', lineHeight: 24, fontWeight: '400' },
  inputLabel: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.4)', marginBottom: 12, letterSpacing: 0.3 },
  inputBlock: { marginBottom: 24 },
  nameInput: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1, borderColor: 'rgba(157,78,221,0.3)',
    borderRadius: 16, paddingHorizontal: 20, paddingVertical: 18,
    color: '#ffffff', fontSize: 24, fontWeight: '700',
  },
  optionList: { gap: 10, marginBottom: 8 },
  optionCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
    borderRadius: 16, padding: 18,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  optionCardActive: { backgroundColor: 'rgba(123,44,191,0.18)', borderColor: '#7b2cbf' },
  optionLeft: { flex: 1 },
  optionLabel: { fontSize: 17, fontWeight: '700', color: 'rgba(255,255,255,0.4)', marginBottom: 3 },
  optionLabelActive: { color: '#ffffff' },
  optionSub: { fontSize: 12, color: 'rgba(255,255,255,0.22)', fontWeight: '400', lineHeight: 17 },
  optionCheck: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#7b2cbf', alignItems: 'center', justifyContent: 'center', marginLeft: 12 },
  optionCheckText: { color: 'white', fontSize: 13, fontWeight: '800' },
  btn: { marginTop: 'auto' },
  btnGradient: { paddingVertical: 22, borderRadius: 18, alignItems: 'center' },
  btnText: { color: 'white', fontSize: 15, fontWeight: '800', letterSpacing: 3 },
  skipText: { color: 'rgba(255,255,255,0.2)', fontSize: 13, fontWeight: '500', textAlign: 'center' },
});
