import { createContext, useContext, useState, useEffect } from 'react';
import { Appearance } from 'react-native';

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
  gradientBtnLight: false,
  btnText: '#ffffff',
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
  gradientBtn: ['#c77dff', '#9d4edd'],
  gradientBtnLight: true,
  btnText: '#1a0035',
};

const ThemeContext = createContext(darkTheme);

export function ThemeProvider({ children }) {
  const [scheme, setScheme] = useState(Appearance.getColorScheme());

  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      setScheme(colorScheme);
    });
    return () => sub.remove();
  }, []);

  const theme = scheme === 'light' ? lightTheme : darkTheme;

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
