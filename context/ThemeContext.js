import { createContext, useContext } from 'react';
import { useColorScheme } from 'react-native';

const darkTheme = {
  bg: '#080010',
  bgSecondary: '#1a0035',
  bgCard: 'rgba(255,255,255,0.03)',
  bgCardBorder: 'rgba(255,255,255,0.06)',
  text: '#ffffff',
  textSecondary: 'rgba(255,255,255,0.4)',
  textTertiary: 'rgba(255,255,255,0.2)',
  accent: '#9d4edd',
  accentDark: '#7b2cbf',
  accentDeep: '#4a0080',
  gradientBg: ['rgba(50,0,90,0.5)', 'rgba(8,0,16,1)'],
  gradientBtn: ['#7b2cbf', '#4a0080'],
};

const lightTheme = {
  bg: '#f5f0ff',
  bgSecondary: '#ede5ff',
  bgCard: 'rgba(123,44,191,0.06)',
  bgCardBorder: 'rgba(123,44,191,0.15)',
  text: '#1a0035',
  textSecondary: 'rgba(26,0,53,0.6)',
  textTertiary: 'rgba(26,0,53,0.4)',
  accent: '#7b2cbf',
  accentDark: '#5a189a',
  accentDeep: '#3c096c',
  gradientBg: ['#f5f0ff', '#ede5ff'],
  gradientBtn: ['#7b2cbf', '#4a0080'],
};

const ThemeContext = createContext(darkTheme);

export function ThemeProvider({ children }) {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'light' ? lightTheme : darkTheme;
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}