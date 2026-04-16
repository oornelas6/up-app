import { StyleSheet, Text, View, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRef, useState, useCallback } from 'react';

const { height } = Dimensions.get('window');
const ITEM_HEIGHT = 60;
const VISIBLE_ITEMS = 5;
const WHEEL_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

const WEIGHTS = Array.from({ length: 161 }, (_, i) => i * 2.5);
const REPS = Array.from({ length: 30 }, (_, i) => i + 1);

const WheelPicker = ({ data, unit, selectedIndex, onIndexChange }) => {
  const flatListRef = useRef(null);

  const getItemLayout = (_, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  });

  const onMomentumScrollEnd = useCallback((e) => {
    const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
    const clamped = Math.min(Math.max(idx, 0), data.length - 1);
    onIndexChange(clamped);
  }, [data, onIndexChange]);

  const renderItem = ({ item, index }) => {
    const distance = Math.abs(index - selectedIndex);
    const opacity = distance === 0 ? 1 : distance === 1 ? 0.4 : 0.15;
    const fontSize = distance === 0 ? 28 : distance === 1 ? 20 : 16;
    const fontWeight = distance === 0 ? '800' : '500';

    return (
      <View style={styles.wheelItem}>
        <Text style={[styles.wheelText, { opacity, fontSize, fontWeight }]}>
          {item}{unit}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.wheelWrapper}>
      <FlatList
        ref={flatListRef}
        data={data}
        keyExtractor={(_, i) => i.toString()}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onMomentumScrollEnd={onMomentumScrollEnd}
        initialScrollIndex={selectedIndex}
        contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * 2 }}
        style={{ height: WHEEL_HEIGHT }}
      />
      {/* Center selector lines */}
      <View pointerEvents="none" style={styles.selectorTop} />
      <View pointerEvents="none" style={styles.selectorBottom} />
    </View>
  );
};

export default function RevolverScreen({ navigation, route }) {
  const { exercise, split } = route.params;
  const [setNum, setSetNum] = useState(1);
  const [lastWeight, setLastWeight] = useState(null);
  const [lastReps, setLastReps] = useState(null);
  const [weightIdx, setWeightIdx] = useState(27); // 135 lbs default
  const [repsIdx, setRepsIdx] = useState(7);  // 8 reps default

  const selectedWeight = WEIGHTS[weightIdx];
  const selectedReps = REPS[repsIdx];

  const logSet = () => {
    setLastWeight(selectedWeight);
    setLastReps(selectedReps);
    setSetNum(s => s + 1);
    navigation.navigate('PR', {
      exercise,
      weight: selectedWeight,
      reps: selectedReps,
      setNum,
      split,
    });
  };

  const sameAsLast = () => {
    setSetNum(s => s + 1);
    navigation.navigate('PR', {
      exercise,
      weight: lastWeight,
      reps: lastReps,
      setNum,
      split,
    });
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['rgba(60,0,100,0.4)', 'rgba(8,0,16,0.98)']}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.back}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.logo}>UP</Text>
        </View>

        <Text style={styles.exName}>{exercise}</Text>
        <Text style={styles.setLabel}>SET {setNum}</Text>

        {/* Selected value display */}
        <View style={styles.selectedDisplay}>
          <View style={styles.selectedItem}>
            <Text style={styles.selectedValue}>{selectedWeight}</Text>
            <Text style={styles.selectedUnit}>lbs</Text>
          </View>
          <View style={styles.selectedDivider} />
          <View style={styles.selectedItem}>
            <Text style={styles.selectedValue}>{selectedReps}</Text>
            <Text style={styles.selectedUnit}>reps</Text>
          </View>
        </View>

        {/* Wheels */}
        <View style={styles.wheelsRow}>
          <View style={styles.wheelContainer}>
            <Text style={styles.wheelLabel}>WEIGHT</Text>
            <WheelPicker
              data={WEIGHTS}
              unit=" lbs"
              selectedIndex={weightIdx}
              onIndexChange={setWeightIdx}
            />
          </View>

          <View style={styles.wheelDivider} />

          <View style={styles.wheelContainer}>
            <Text style={styles.wheelLabel}>REPS</Text>
            <WheelPicker
              data={REPS}
              unit=" reps"
              selectedIndex={repsIdx}
              onIndexChange={setRepsIdx}
            />
          </View>
        </View>

        <View style={{ flex: 1 }} />

        <TouchableOpacity activeOpacity={0.9} onPress={logSet}>
          <LinearGradient
            colors={['#7b2cbf', '#4a0080']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logBtn}
          >
            <Text style={styles.logBtnText}>LOG SET</Text>
            <Text style={styles.logBtnSub}>{selectedWeight} lbs × {selectedReps} reps</Text>
          </LinearGradient>
        </TouchableOpacity>

        {lastWeight !== null && (
          <TouchableOpacity style={styles.sameBtn} onPress={sameAsLast}>
            <Text style={styles.sameBtnText}>↩ Same · {lastWeight} lbs × {lastReps} reps</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.doneBtn} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.doneBtnText}>Done with Exercise</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#080010' },
  container: { flex: 1, paddingHorizontal: 28, paddingTop: 64, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  back: { color: 'rgba(255,255,255,0.4)', fontSize: 15, fontWeight: '600' },
  logo: { fontSize: 26, fontWeight: '900', color: '#ffffff', letterSpacing: 4 },
  exName: { fontSize: 26, fontWeight: '800', color: '#ffffff', letterSpacing: -0.5, marginBottom: 4 },
  setLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 3, color: '#9d4edd', marginBottom: 20 },
  selectedDisplay: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(157,78,221,0.08)', borderWidth: 1, borderColor: 'rgba(157,78,221,0.2)', borderRadius: 20, paddingVertical: 16, marginBottom: 16, gap: 32 },
  selectedItem: { alignItems: 'center' },
  selectedValue: { fontSize: 36, fontWeight: '900', color: '#ffffff', letterSpacing: -1 },
  selectedUnit: { fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: '600', letterSpacing: 1, marginTop: 2 },
  selectedDivider: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.08)' },
  wheelsRow: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.02)', borderWidth: 1, borderColor: 'rgba(157,78,221,0.15)', borderRadius: 24, overflow: 'hidden' },
  wheelContainer: { flex: 1, alignItems: 'center', paddingTop: 12 },
  wheelLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 3, color: 'rgba(255,255,255,0.2)', marginBottom: 4 },
  wheelWrapper: { width: '100%', position: 'relative' },
  wheelItem: { height: ITEM_HEIGHT, justifyContent: 'center', alignItems: 'center' },
  wheelText: { color: '#ffffff', letterSpacing: -0.5 },
  selectorTop: { position: 'absolute', top: ITEM_HEIGHT * 2, left: 8, right: 8, height: 1, backgroundColor: 'rgba(157,78,221,0.3)' },
  selectorBottom: { position: 'absolute', top: ITEM_HEIGHT * 3, left: 8, right: 8, height: 1, backgroundColor: 'rgba(157,78,221,0.3)' },
  wheelDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginVertical: 16 },
  logBtn: { paddingVertical: 22, borderRadius: 18, alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: 'rgba(157,78,221,0.2)' },
  logBtnText: { color: 'white', fontSize: 15, fontWeight: '800', letterSpacing: 3, marginBottom: 4 },
  logBtnSub: { color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: '400' },
  sameBtn: { backgroundColor: 'rgba(157,78,221,0.08)', borderWidth: 1, borderColor: 'rgba(157,78,221,0.2)', borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginBottom: 10 },
  sameBtnText: { color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: '600' },
  doneBtn: { paddingVertical: 14, alignItems: 'center' },
  doneBtnText: { color: 'rgba(255,255,255,0.2)', fontSize: 13, fontWeight: '500', letterSpacing: 1 },
});