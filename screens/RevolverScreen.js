import { LinearGradient } from 'expo-linear-gradient';
import Logo from '../components/Logo';
import { useTheme } from '../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Dimensions, TextInput, Modal, PanResponder, Animated } from 'react-native';
import { useRef, useState, useCallback, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';
import * as Haptics from 'expo-haptics';

const API_URL = 'https://lurl0xn2b7.execute-api.us-east-1.amazonaws.com/log-set';

const logSetToAPI = async (userId, exercise, weight, reps, unit, split, setNum) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, exercise, weight, reps, unit, split, setNum }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to log set:', error);
    return { success: false, isPR: false };
  }
};

const getLastSet = async (userId, exercise) => {
  try {
    const response = await fetch(
      `https://lurl0xn2b7.execute-api.us-east-1.amazonaws.com/history?userId=${userId}`
    );
    const data = await response.json();
    const sets = data.sets || [];
    const lastSet = sets.find(s => s.exercise === exercise);
    return lastSet || null;
  } catch (err) {
    return null;
  }
};

const ITEM_HEIGHT = 60;
const VISIBLE_ITEMS = 5;
const WHEEL_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;
const WEIGHTS_LBS = Array.from({ length: 601 }, (_, i) => i * 2.5);
const WEIGHTS_KG = Array.from({ length: 561 }, (_, i) => i * 1.25);
const REPS = Array.from({ length: 30 }, (_, i) => i + 1);

const WheelPicker = ({ data, unit, selectedIndex, onIndexChange, styles }) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ y: selectedIndex * ITEM_HEIGHT, animated: true });
    }, 50);
  }, [selectedIndex]);

  const onMomentumScrollEnd = useCallback((e) => {
    const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
    const clamped = Math.min(Math.max(idx, 0), data.length - 1);
    onIndexChange(clamped);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [data, onIndexChange]);

  const onScrollEnd = useCallback((e) => {
    const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
    const clamped = Math.min(Math.max(idx, 0), data.length - 1);
    if (clamped !== selectedIndex) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [selectedIndex]);

  return (
    <View style={styles.wheelWrapper}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        snapToAlignment="center"
        decelerationRate="fast"
        onMomentumScrollEnd={onMomentumScrollEnd}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * 2 }}
        style={{ height: WHEEL_HEIGHT }}
      >
        {data.map((item, index) => {
          const distance = Math.abs(index - selectedIndex);
          const opacity = distance === 0 ? 1 : distance === 1 ? 0.75 : distance === 2 ? 0.5 : 0.3;
          const fontSize = distance === 0 ? 28 : distance === 1 ? 20 : 15;
          const fontWeight = distance === 0 ? '800' : '500';
          return (
            <View key={index} style={styles.wheelItem}>
              <Text style={[styles.wheelText, { opacity, fontSize, fontWeight }]}>
                {item}{unit}
              </Text>
            </View>
          );
        })}
      </ScrollView>
      <View pointerEvents="none" style={styles.selectorTop} />
      <View pointerEvents="none" style={styles.selectorBottom} />
    </View>
  );
};

export default function RevolverScreen({ navigation, route }) {
  const { exercise, split } = route.params;
  const [setNum, setSetNum] = useState(1);
  const [weightIdx, setWeightIdx] = useState(27);
  const [repsIdx, setRepsIdx] = useState(7);
  const [fineWeight, setFineWeight] = useState(0); // offset in lbs/kg for precision
  const { isKg, setIsKg, restTimer, sessionSets } = useSettings();
  const [showWeightInput, setShowWeightInput] = useState(false);
  const [weightInputVal, setWeightInputVal] = useState('');
  const [showRepsInput, setShowRepsInput] = useState(false);
  const [repsInputVal, setRepsInputVal] = useState('');
  const WEIGHTS = isKg ? WEIGHTS_KG : WEIGHTS_LBS;
  const unit = isKg ? 'kg' : 'lbs';
  const fineStep = isKg ? 0.25 : 0.5;
  const theme = useTheme();
  const styles = getStyles(theme);
  const baseWeight = WEIGHTS[weightIdx];
  const selectedWeight = Math.round((baseWeight + fineWeight) * 100) / 100;

  // Convert suggestion to current unit
  const displaySuggestion = suggestion ? (() => {
    if (!suggestion) return null;
    if ((suggestion.unit === 'kg') === isKg) return suggestion;
    if (isKg) {
      return { ...suggestion, weight: Math.round(suggestion.weight * 0.453592 * 4) / 4, unit: 'kg' };
    } else {
      return { ...suggestion, weight: Math.round(suggestion.weight * 2.20462 * 2) / 2, unit: 'lbs' };
    }
  })() : null;
  const selectedReps = REPS[repsIdx];
  const [suggestion, setSuggestion] = useState(null);
  const hasFineOffset = fineWeight !== 0;

  useEffect(() => {
    const loadSuggestion = async () => {
      const userId = await AsyncStorage.getItem('user_id') || 'user-test-001';
      const lastSet = await getLastSet(userId, exercise);
      if (lastSet) {
        const lastWeight = parseFloat(lastSet.weight);
        const lastRepsVal = parseInt(lastSet.reps);
        const lastUnit = lastSet.unit || 'lbs';
        setSuggestion({ weight: lastWeight, reps: lastRepsVal, unit: lastUnit });
        const targetWeights = lastUnit === 'kg' ? WEIGHTS_KG : WEIGHTS_LBS;
        const idx = targetWeights.findIndex(w => w >= lastWeight);
        const rIdx = REPS.findIndex(r => r >= lastRepsVal);
        setTimeout(() => {
          if (idx !== -1) setWeightIdx(idx);
          if (rIdx !== -1) setRepsIdx(rIdx);
        }, 500);
      }
    };
    loadSuggestion();
  }, [exercise]);

  // Reset fine offset when wheel changes
  const handleWeightIdxChange = (idx) => {
    setWeightIdx(idx);
    setFineWeight(0);
  };

  const adjustFine = (delta) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFineWeight(prev => {
      const next = Math.round((prev + delta) * 100) / 100;
      // If we cross a full increment, move the wheel instead
      const step = isKg ? 1.25 : 2.5;
      if (next >= step) {
        setWeightIdx(i => Math.min(i + 1, WEIGHTS.length - 1));
        return next - step;
      }
      if (next <= -step) {
        setWeightIdx(i => Math.max(i - 1, 0));
        return next + step;
      }
      return next;
    });
  };

  const logSet = async () => {
    try {
      const userId = await AsyncStorage.getItem('user_id') || 'user-test-001';
      const result = await logSetToAPI(
        userId, exercise, selectedWeight, selectedReps, unit, split, setNum
      );
      const isNewPR = result.isPR || false;
      setSetNum(s => s + 1);
      setFineWeight(0);
      navigation.navigate('PR', {
        exercise, weight: selectedWeight, reps: selectedReps, setNum, split, isPR: isNewPR, unit, sessionSets,
      });
    } catch (err) {
      console.error('logSet error:', err);
      alert('Error: ' + err.message);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <LinearGradient colors={theme.gradientBg} style={StyleSheet.absoluteFillObject} />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.back}>← Back</Text>
          </TouchableOpacity>
          <Logo size={36} />
        </View>

        <Text style={[styles.exName, { color: theme.text }]}>{exercise}</Text>
        <View style={styles.setRow}>
          <Text style={styles.setLabel}>SET {setNum}</Text>
          <TouchableOpacity
            style={styles.unitToggle}
            onPress={() => {
              setIsKg(k => {
                const newIsKg = !k;
                const currentWeight = k ? WEIGHTS_KG[weightIdx] : WEIGHTS_LBS[weightIdx];
                if (newIsKg) {
                  const kgWeight = currentWeight * 0.453592;
                  const closest = WEIGHTS_KG.reduce((prev, curr) =>
                    Math.abs(curr - kgWeight) < Math.abs(prev - kgWeight) ? curr : prev
                  );
                  setWeightIdx(WEIGHTS_KG.indexOf(closest));
                } else {
                  const lbsWeight = currentWeight * 2.20462;
                  const closest = WEIGHTS_LBS.reduce((prev, curr) =>
                    Math.abs(curr - lbsWeight) < Math.abs(prev - lbsWeight) ? curr : prev
                  );
                  setWeightIdx(WEIGHTS_LBS.indexOf(closest));
                }
                setFineWeight(0);
                return newIsKg;
              });
            }}
          >
            <Text style={styles.unitToggleText}>{isKg ? 'KG' : 'LBS'}</Text>
          </TouchableOpacity>
        </View>

        {displaySuggestion && (
          <View style={styles.suggestionCard}>
            <View style={styles.suggestionLeft}>
              <Text style={styles.suggestionLabel}>LAST SESSION</Text>
              <Text style={styles.suggestionMain}>
                {displaySuggestion.weight} {displaySuggestion.unit} × {displaySuggestion.reps}
              </Text>
              <Text style={styles.suggestionRM}>
                1RM ≈ {Math.round(parseFloat(displaySuggestion.weight) * (1 + displaySuggestion.reps / 30))} {displaySuggestion.unit}
              </Text>
            </View>
            <View style={styles.suggestionDivider} />
            <View style={styles.suggestionRight}>
              <Text style={styles.suggestionLabel}>TARGET</Text>
              <Text style={styles.suggestionTarget}>
                {displaySuggestion.reps >= 12
                  ? parseFloat(displaySuggestion.weight) + (isKg ? 2.5 : 5)
                  : displaySuggestion.reps <= 5
                  ? parseFloat(displaySuggestion.weight) + (isKg ? 5 : 10)
                  : parseFloat(displaySuggestion.weight) + (isKg ? 2.5 : 5)
                } {displaySuggestion.unit}
              </Text>
              <Text style={styles.suggestionRM}>
                {displaySuggestion.reps >= 12 ? 'add weight' : displaySuggestion.reps <= 5 ? 'strength jump' : 'progressive'}
              </Text>
            </View>
          </View>
        )}

        {/* Selected display + precision controls */}
        <View style={styles.selectedDisplay}>
          <View style={styles.selectedWeightCol}>
            <TouchableOpacity
              style={styles.selectedItem}
              onPress={() => {
                setWeightInputVal(String(selectedWeight));
                setShowWeightInput(true);
              }}
            >
              <Text style={styles.selectedValue}>{selectedWeight}</Text>
              <Text style={styles.selectedUnit}>{unit}  <Text style={{fontSize: 14, color: theme.accent}}>✎</Text></Text>
            </TouchableOpacity>
            {/* Precision fine-tune buttons */}
            <View style={styles.fineTuneRow}>
              <TouchableOpacity style={styles.fineTuneBtn} onPress={() => adjustFine(-fineStep)}>
                <Text style={styles.fineTuneBtnText}>−{fineStep}</Text>
              </TouchableOpacity>
              {hasFineOffset && (
                <TouchableOpacity onPress={() => setFineWeight(0)}>
                  <Text style={styles.fineOffsetLabel}>
                    {fineWeight > 0 ? `+${fineWeight}` : fineWeight}
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.fineTuneBtn} onPress={() => adjustFine(fineStep)}>
                <Text style={styles.fineTuneBtnText}>+{fineStep}</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.selectedDivider} />
          <TouchableOpacity
            style={styles.selectedItem}
            onPress={() => {
              setRepsInputVal(String(selectedReps));
              setShowRepsInput(true);
            }}
          >
            <Text style={styles.selectedValue}>{selectedReps}</Text>
            <Text style={styles.selectedUnit}>reps  <Text style={{fontSize: 14, color: theme.accent}}>✎</Text></Text>
          </TouchableOpacity>
        </View>

        <View style={styles.wheelsRow}>
          <View style={styles.wheelContainer}>
            <Text style={styles.wheelLabel}>WEIGHT</Text>
            <WheelPicker
              styles={styles}
              data={WEIGHTS}
              unit={` ${unit}`}
              selectedIndex={weightIdx}
              onIndexChange={handleWeightIdxChange}
            />
          </View>
          <View style={styles.wheelDivider} />
          <View style={styles.wheelContainer}>
            <Text style={styles.wheelLabel}>REPS</Text>
            <WheelPicker
              styles={styles}
              data={REPS}
              unit=" reps"
              selectedIndex={repsIdx}
              onIndexChange={setRepsIdx}
            />
          </View>
        </View>

        <View style={{ flex: 1, minHeight: 16 }} />

        <TouchableOpacity activeOpacity={0.9} onPress={logSet}>
          <LinearGradient
            colors={theme.gradientBtn}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logBtn}
          >
            <Text style={[styles.logBtnText, { color: theme.btnText }]}>LOG SET</Text>
            <Text style={styles.logBtnSub}>{selectedWeight} {unit} × {selectedReps} reps</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.doneBtn} onPress={() => navigation.navigate('Workout', { split })}>
          <Text style={styles.doneBtnText}>Done with Exercise</Text>
        </TouchableOpacity>

        {/* Reps input modal */}
        <Modal visible={showRepsInput} transparent animationType="fade">
          <View style={styles.weightModalOverlay}>
            <View style={[styles.weightModalBox, { backgroundColor: theme.bgSecondary }]}>
              <Text style={styles.weightModalTitle}>Enter Reps</Text>
              <TextInput
                style={styles.weightModalInput}
                value={repsInputVal}
                onChangeText={setRepsInputVal}
                keyboardType="number-pad"
                autoFocus
                selectTextOnFocus
              />
              <Text style={styles.weightModalUnit}>reps</Text>
              <TouchableOpacity
                style={styles.weightModalBtn}
                onPress={() => {
                  const val = parseInt(repsInputVal);
                  if (!isNaN(val) && val > 0 && val <= 30) {
                    setRepsIdx(REPS.findIndex(r => r === Math.min(val, 30)) !== -1
                      ? REPS.findIndex(r => r === Math.min(val, 30))
                      : REPS.length - 1);
                  }
                  setShowRepsInput(false);
                }}
              >
                <LinearGradient colors={theme.gradientBtn} style={styles.weightModalBtnGradient}>
                  <Text style={[styles.weightModalBtnText, { color: theme.btnText }]}>SET</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowRepsInput(false)}>
                <Text style={styles.weightModalCancel}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal visible={showWeightInput} transparent animationType="fade">
          <View style={styles.weightModalOverlay}>
            <View style={[styles.weightModalBox, { backgroundColor: theme.bgSecondary }]}>
              <Text style={styles.weightModalTitle}>Enter Weight</Text>
              <TextInput
                style={styles.weightModalInput}
                value={weightInputVal}
                onChangeText={setWeightInputVal}
                keyboardType="decimal-pad"
                autoFocus
                selectTextOnFocus
              />
              <Text style={styles.weightModalUnit}>{unit}</Text>
              <TouchableOpacity
                style={styles.weightModalBtn}
                onPress={() => {
                  const val = parseFloat(weightInputVal);
                  if (!isNaN(val) && val > 0) {
                    const weights = isKg ? WEIGHTS_KG : WEIGHTS_LBS;
                    // Find closest base weight
                    const baseVal = Math.floor(val / (isKg ? 1.25 : 2.5)) * (isKg ? 1.25 : 2.5);
                    const closest = weights.reduce((prev, curr) =>
                      Math.abs(curr - baseVal) < Math.abs(prev - baseVal) ? curr : prev
                    );
                    setWeightIdx(weights.indexOf(closest));
                    // Set fine offset for remainder
                    const remainder = Math.round((val - closest) * 100) / 100;
                    setFineWeight(remainder);
                  }
                  setShowWeightInput(false);
                }}
              >
                <LinearGradient colors={theme.gradientBtn} style={styles.weightModalBtnGradient}>
                  <Text style={[styles.weightModalBtnText, { color: theme.btnText }]}>SET</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowWeightInput(false)}>
                <Text style={styles.weightModalCancel}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
}

const getStyles = (theme) => ({
  root: { flex: 1, backgroundColor: '#080010' },
  container: { flex: 1, paddingHorizontal: 28, paddingTop: 64, paddingBottom: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  back: { color: theme.textSecondary, fontSize: 15, fontWeight: '600' },
  exName: { fontSize: 26, fontWeight: '800', color: theme.text, letterSpacing: -0.5, marginBottom: 4 },
  setRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  setLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 3, color: '#9d4edd' },
  unitToggle: { backgroundColor: 'rgba(157,78,221,0.15)', borderWidth: 1, borderColor: 'rgba(157,78,221,0.3)', borderRadius: 100, paddingHorizontal: 14, paddingVertical: 6 },
  unitToggleText: { color: '#9d4edd', fontSize: 12, fontWeight: '800', letterSpacing: 2 },
  selectedDisplay: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(157,78,221,0.08)', borderWidth: 1, borderColor: 'rgba(157,78,221,0.2)', borderRadius: 20, paddingVertical: 12, marginBottom: 16, gap: 32 },
  selectedWeightCol: { alignItems: 'center' },
  selectedItem: { alignItems: 'center' },
  selectedValue: { fontSize: 36, fontWeight: '900', color: theme.text, letterSpacing: -1 },
  selectedUnit: { fontSize: 11, color: theme.textSecondary, fontWeight: '600', letterSpacing: 1, marginTop: 2 },
  selectedDivider: { width: 1, height: 60, backgroundColor: 'rgba(157,78,221,0.15)' },
  // Fine tune
  fineTuneRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  fineTuneBtn: { backgroundColor: 'rgba(157,78,221,0.15)', borderWidth: 1, borderColor: 'rgba(157,78,221,0.25)', borderRadius: 100, paddingHorizontal: 12, paddingVertical: 5 },
  fineTuneBtnText: { color: '#9d4edd', fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  fineOffsetLabel: { fontSize: 11, color: '#9d4edd', fontWeight: '800', minWidth: 30, textAlign: 'center' },
  // Wheels
  wheelsRow: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.02)', borderWidth: 1, borderColor: 'rgba(157,78,221,0.15)', borderRadius: 24, overflow: 'hidden' },
  wheelContainer: { flex: 1, alignItems: 'center', paddingTop: 12 },
  wheelLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 3, color: theme.textTertiary, marginBottom: 4 },
  wheelWrapper: { width: '100%', position: 'relative' },
  wheelItem: { height: ITEM_HEIGHT, justifyContent: 'center', alignItems: 'center' },
  wheelText: { color: theme.text, letterSpacing: -0.5 },
  selectorTop: { position: 'absolute', top: ITEM_HEIGHT * 2, left: 8, right: 8, height: 1, backgroundColor: 'rgba(157,78,221,0.3)' },
  selectorBottom: { position: 'absolute', top: ITEM_HEIGHT * 3, left: 8, right: 8, height: 1, backgroundColor: 'rgba(157,78,221,0.3)' },
  wheelDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginVertical: 16 },
  // Log button
  logBtn: { paddingVertical: 22, borderRadius: 18, alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: 'rgba(157,78,221,0.2)' },
  logBtnText: { fontSize: 15, fontWeight: '800', letterSpacing: 3, marginBottom: 4 },
  logBtnSub: { color: theme.textSecondary, fontSize: 12, fontWeight: '400' },
  doneBtn: { paddingVertical: 14, alignItems: 'center' },
  doneBtnText: { color: theme.textTertiary, fontSize: 13, fontWeight: '500', letterSpacing: 1 },
  // Suggestion card
  suggestionCard: { flexDirection: 'row', backgroundColor: 'rgba(157,78,221,0.15)', borderWidth: 1.5, borderColor: 'rgba(157,78,221,0.5)', borderRadius: 16, paddingVertical: 16, paddingHorizontal: 18, marginBottom: 14, alignItems: 'center' },
  suggestionLeft: { flex: 1, alignItems: 'flex-start' },
  suggestionRight: { flex: 1, alignItems: 'flex-end' },
  suggestionDivider: { width: 1, height: 40, backgroundColor: 'rgba(157,78,221,0.2)', marginHorizontal: 16 },
  suggestionLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 2, color: '#9d4edd', marginBottom: 4 },
  suggestionMain: { fontSize: 17, fontWeight: '900', color: theme.text, letterSpacing: -0.3 },
  suggestionRM: { fontSize: 10, color: theme.textTertiary, fontWeight: '500', marginTop: 2 },
  suggestionTarget: { fontSize: 17, fontWeight: '900', color: '#9d4edd', letterSpacing: -0.3 },
  // Modal
  weightModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center' },
  weightModalBox: { borderRadius: 24, padding: 28, width: '80%', alignItems: 'center' },
  weightModalTitle: { fontSize: 16, fontWeight: '700', color: theme.text, marginBottom: 16, letterSpacing: 1 },
  weightModalInput: { fontSize: 48, fontWeight: '900', color: theme.text, textAlign: 'center', borderBottomWidth: 2, borderBottomColor: '#7b2cbf', paddingBottom: 8, width: '100%', marginBottom: 8 },
  weightModalUnit: { fontSize: 14, color: theme.textSecondary, marginBottom: 24 },
  weightModalBtn: { marginBottom: 12, width: '100%' },
  weightModalBtnGradient: { paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  weightModalBtnText: { fontSize: 15, fontWeight: '800', letterSpacing: 2 },
  weightModalCancel: { color: theme.textSecondary, fontSize: 14 },
});
