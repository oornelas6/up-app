import { View, Text, Animated, StyleSheet, Dimensions } from 'react-native';
import { useEffect, useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import Logo from '../components/Logo';

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ onFinish }) {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const taglineAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const fadeOutAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      // Glow blooms first
      Animated.timing(glowAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      // Logo appears through the glow
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, tension: 45, friction: 8, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
      // Tagline settles in
      Animated.timing(taglineAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      // Hold
      Animated.delay(800),
      // Fade out
      Animated.timing(fadeOutAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start(() => onFinish());
  }, []);

  return (
    <Animated.View style={[styles.root, { opacity: fadeOutAnim }]}>
      <LinearGradient
        colors={['#1a0035', '#0d0020', '#080010']}
        start={{ x: 0.3, y: 0 }}
        end={{ x: 0.7, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Purple glow behind logo */}
      <Animated.View style={[styles.glow, { opacity: glowAnim }]} />

      {/* Logo */}
      <Animated.View style={[styles.logoWrap, {
        opacity: opacityAnim,
        transform: [{ scale: scaleAnim }],
      }]}>
        <Logo size={110} />
      </Animated.View>

      {/* Tagline pinned to lower third */}
      <Animated.Text style={[styles.tagline, { opacity: taglineAnim }]}>
        get UP.
      </Animated.Text>
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
  glow: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(123, 44, 191, 0.25)',
    alignSelf: 'center',
    top: height / 2 - 160,
  },
  logoWrap: {
    alignItems: 'center',
  },
  tagline: {
    position: 'absolute',
    bottom: height * 0.14,
    fontSize: 13,
    color: 'rgba(157, 78, 221, 0.6)',
    fontWeight: '600',
    letterSpacing: 5,
  },
});
