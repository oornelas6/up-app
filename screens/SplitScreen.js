import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

const { width } = Dimensions.get('window');

const SPLITS = [
  { name: 'Push', label: 'Chest · Shoulders · Triceps', count: 12 },
  { name: 'Pull', label: 'Back · Biceps · Rear Delts', count: 11 },
  { name: 'Legs', label: 'Quads · Hamstrings · Glutes · Calves', count: 9 },
  { name: 'Arms', label: 'Biceps · Triceps · Shoulders', count: 10 },
  { name: 'Upper', label: 'Full Upper Body', count: 7 },
  { name: 'Lower', label: 'Full Lower Body', count: 7 },
  { name: 'Full Body', label: 'Everything', count: 8 },
  { name: 'Custom', label: 'Build your own', count: 0 },
];

const SplitCard = ({ split, index, onPress }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 60,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay: index * 60,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={onPress}
      >
        <View style={styles.cardLeft}>
          <Text style={styles.cardName}>{split.name}</Text>
          <Text style={styles.cardLabel}>{split.label}</Text>
        </View>
        <View style={styles.cardRight}>
          <Text style={styles.cardCount}>{split.count}</Text>
          <Text style={styles.cardCountLabel}>exercises</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function SplitScreen({ navigation }) {
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

        <Text style={styles.title}>What are we{'\n'}training?</Text>

        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ marginTop: 32 }}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {SPLITS.map((split, index) => (
            <SplitCard
              key={split.name}
              split={split}
              index={index}
              onPress={() => navigation.navigate('Workout', { split: split.name })}
            />
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#080010' },
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 64, paddingBottom: 0 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  back: { color: 'rgba(255,255,255,0.4)', fontSize: 15, fontWeight: '600' },
  logo: { fontSize: 26, fontWeight: '900', color: '#ffffff', letterSpacing: 4 },
  title: { fontSize: 38, fontWeight: '900', color: '#ffffff', letterSpacing: -1, lineHeight: 44 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 10,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 18,
  },
  cardLeft: { flex: 1 },
  cardName: { fontSize: 20, fontWeight: '800', color: '#ffffff', marginBottom: 4, letterSpacing: -0.3 },
  cardLabel: { fontSize: 12, color: 'rgba(255,255,255,0.25)', fontWeight: '400', letterSpacing: 0.3 },
  cardRight: { alignItems: 'flex-end', marginLeft: 16 },
  cardCount: { fontSize: 22, fontWeight: '800', color: 'rgba(157,78,221,0.7)', letterSpacing: -0.5 },
  cardCountLabel: { fontSize: 10, color: 'rgba(255,255,255,0.2)', fontWeight: '500', letterSpacing: 1, marginTop: 2 },
});