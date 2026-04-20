import { View, Text, Animated, StyleSheet, Dimensions } from 'react-native';
import { useEffect, useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ onFinish }) {
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const fadeOutAnim = useRef(new Animated.Value(1)).current;
  const blob1 = useRef(new Animated.Value(0)).current;
  const blob2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      // Blobs fade in
      Animated.parallel([
        Animated.timing(blob1, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(blob2, { toValue: 1, duration: 800, delay: 200, useNativeDriver: true }),
      ]),
      // UP logo pops in
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 6, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
      // Hold
      Animated.delay(800),
      // Fade out everything
      Animated.timing(fadeOutAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start(() => onFinish());
  }, []);

  return (
    <Animated.View style={[styles.root, { opacity: fadeOutAnim }]}>
      <LinearGradient
        colors={['#3c096c', '#240046', '#0a000f']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Blobs */}
      <Animated.View style={[styles.blob, styles.blob1, { opacity: blob1 }]} />
      <Animated.View style={[styles.blob, styles.blob2, { opacity: blob2 }]} />

      {/* Logo */}
      <Animated.View style={[styles.logoContainer, {
        opacity: opacityAnim,
        transform: [{ scale: scaleAnim }]
      }]}>
        <Text style={styles.logo}>UP</Text>
        <Text style={styles.tagline}>train smarter.</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    top: 0, left: 0,
    width, height,
    zIndex: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blob: {
    position: 'absolute',
    borderRadius: 999,
  },
  blob1: {
    width: 400, height: 400,
    backgroundColor: 'rgba(123, 44, 191, 0.35)',
    top: -100, left: -100,
  },
  blob2: {
    width: 300, height: 300,
    backgroundColor: 'rgba(60, 9, 108, 0.4)',
    bottom: 50, right: -80,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    fontSize: 80,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 4,
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '400',
    letterSpacing: 3,
    marginTop: 8,
    textTransform: 'lowercase',
  },
});