import { Image, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';

export default function Logo({ size = 40, tappable = true }) {
  const theme = useTheme();
  const navigation = useNavigation();

  const handlePress = () => {
    navigation.navigate('HomeTab');
  };

  if (!tappable) {
    return (
      <Image
        source={require('../assets/logo.png')}
        style={{ width: size, height: size, tintColor: theme.text }}
        resizeMode="contain"
      />
    );
  }

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
      <Image
        source={require('../assets/logo.png')}
        style={{ width: size, height: size, tintColor: theme.text }}
        resizeMode="contain"
      />
    </TouchableOpacity>
  );
}
