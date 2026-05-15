import { Animated, StyleSheet, Dimensions, Image } from 'react-native';
import { useEffect, useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ onFinish }) {
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoY = useRef(new Animated.Value(16)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const fadeOut = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      // Logo drifts up into view
      Animated.parallel([
        Animated.timing(logoOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.spring(logoY, { toValue: 0, tension: 50, friction: 9, useNativeDriver: true }),
      ]),
      // Tagline fades in
      Animated.timing(taglineOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      // Hold
      Animated.delay(1000),
      // Fade everything out
      Animated.timing(fadeOut, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start(() => onFinish());
  }, []);

  return (
    <Animated.View style={[styles.root, { opacity: fadeOut }]}>
      <LinearGradient
        colors={['#1a0035', '#0d0020', '#080010']}
        start={{ x: 0.3, y: 0 }}
        end={{ x: 0.7, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      <Animated.View style={{
        opacity: logoOpacity,
        transform: [{ translateY: logoY }],
      }}>
        <Image
          source={require('../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
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
