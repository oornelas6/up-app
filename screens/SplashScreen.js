import { View, Text, Animated, StyleSheet, Dimensions } from 'react-native';
import { useEffect, useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ onFinish }) {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const taglineAnim = useRef(new Animated.Value(0)).current;
  const fadeOutAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, tension: 45, friction: 8, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
      Animated.timing(taglineAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.delay(900),
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

      {/* Subtle glow — behind logo, not obscuring it */}
      <View style={styles.glow} />

      {/* Logo — always white, no tintColor interference */}
      <Animated.View style={[styles.logoWrap, {
        opacity: opacityAnim,
        transform: [{ scale: scaleAnim }],
      }]}>
        <Image
          source={require('../assets/logo.png')}
          style={{ width: 140, height: 140, tintColor: '#ffffff' }}
          resizeMode="contain"
        />
      </Animated.View>

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
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(157, 78, 221, 0.18)',
    alignSelf: 'center',
    top: height / 2 - 130,
  },
  logoWrap: {
    alignItems: 'center',
  },
  tagline: {
    position: 'absolute',
    bottom: height * 0.14,
    fontSize: 13,
    color: 'rgba(157, 78, 221, 0.7)',
    fontWeight: '600',
    letterSpacing: 5,
  },
});
