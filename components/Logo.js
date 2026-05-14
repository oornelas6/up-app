import { Image, StyleSheet } from 'react-native';

export default function Logo({ size = 40 }) {
  return (
    <Image
      source={require('../assets/icon.png')}
      style={[styles.logo, { width: size, height: size, borderRadius: size * 0.22, marginRight: 4 }]}
    />
  );
}