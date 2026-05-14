import { Image } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function Logo({ size = 40 }) {
  const theme = useTheme();
  return (
    <Image
      source={require('../assets/logo.png')}
      style={{
        width: size,
        height: size,
        tintColor: theme.text,
      }}
      resizeMode="contain"
    />
  );
}
