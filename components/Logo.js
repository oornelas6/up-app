import { Image, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function Logo({ size = 40, tappable = true, onPress }) {
  const theme = useTheme();

  if (!tappable && !onPress) {
    return (
      <Image
        source={require('../assets/logo.png')}
        style={{ width: size, height: size, tintColor: theme.text }}
        resizeMode="contain"
      />
    );
  }

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Image
        source={require('../assets/logo.png')}
        style={{ width: size, height: size, tintColor: theme.text }}
        resizeMode="contain"
      />
    </TouchableOpacity>
  );
}
