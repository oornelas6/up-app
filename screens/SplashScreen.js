import { Animated, StyleSheet, Dimensions, Image, Text } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');
const TAGLINE = 'get UP.';

export default function SplashScreen({ onFinish }) {
  const translateY = useRef(new Animated.Value(24)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const glowScale = useRef(new Animated.Value(0.8)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const fadeOutAnim = useRef(new Animated.Value(1)).current;
  const [visibleChars, setVisibleChars] = useState(0);

  useEffect(() => {
    Animated.sequence([
      // Logo drifts upward into view
      Animated.parallel([
        Animated.timing(opacityAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.spring(translateY, { toValue: 0, tension: 40, friction: 9, useNativeDriver: true }),
      ]),
      // Glow pulses out once
      Animated.parallel([
        Animated.timing(glowOpacity, { toValue: 0.5, duration: 300, useNativeDriver: true }),
        Animated.spring(glowScale, { toValue: 1.3, tension: 30, friction: 8, useNativeDriver: true }),
      ]),
      Animated.timing(glowOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
      Animated.delay(100),
      // Fade out
      Animated.delay(700),
      Animated.timing(fadeOutAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start(() => onFinish());

    // Typewriter for tagline — starts after logo appears
    const timeout = setTimeout(() => {
      let i = 0;
      const interval = setInterval(() => {
        i++;
        setVisibleChars(i);
        if (i >= TAGLINE.length) clearInterval(interval);
      }, 80);
      return () => clearInterval(interval);
    }, 800);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <Animated.View style={[styles.root, { opacity: fadeOutAnim }]}>
      <LinearGradient
        colors={['#1a0035', '#0d0020', '#080010']}
        start={{ x: 0.3, y: 0 }}
        end={{ x: 0.7, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Pulse glow */}
      <Animated.View style={[styles.glow, {
        opacity: glowOpacity,
        transform: [{ scale: glowScale }],
      }]} />

      {/* Logo drifting up */}
      <Animated.View style={[styles.logoWrap, {
        opacity: opacityAnim,
        transform: [{ translateY }],
      }]}>
        <Image
          source={require('../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Typewriter tagline */}
      <Animated.Text style={[styles.tagline, { opacity: opacityAnim }]}>
        {TAGLINE.slice(0, visibleChars)}
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
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(157, 78, 221, 0.4)',
  },
  logoWrap: {
    alignItems: 'center',
  },
  logo: {
    width: 130,
    height: 130,
    tintColor: '#ffffff',
  },
  tagline: {
    position: 'absolute',
    bottom: height * 0.13,
    fontSize: 13,
    color: 'rgba(157, 78, 221, 0.75)',
    fontWeight: '600',
    letterSpacing: 5,
  },
});
