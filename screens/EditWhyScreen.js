import { StyleSheet, Text, View, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import * as Haptics from 'expo-haptics';

const PROMPTS = [
  "I train because...",
  "What keeps me coming back is...",
  "I do this for...",
  "My goal is to...",
];

export default function EditWhyScreen({ navigation, route }) {
  const theme = useTheme();
  const styles = getStyles(theme);
  const existing = route.params?.current || '';
  const [why, setWhy] = useState(existing);
  const [promptIdx, setPromptIdx] = useState(0);

  const save = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await AsyncStorage.setItem('user_why', why.trim());
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={[styles.root, { backgroundColor: theme.bg }]}>
          <LinearGradient colors={theme.gradientBg} style={StyleSheet.absoluteFillObject} />

          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={[styles.back, { color: theme.textSecondary }]}>← Back</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={[styles.eyebrow, { color: theme.accent }]}>YOUR DRIVE</Text>
            <Text style={[styles.title, { color: theme.text }]}>Why do you{'\n'}train?</Text>
            <Text style={[styles.sub, { color: theme.textTertiary }]}>
              This stays private. It's just for you — a reminder of what this is all for.
            </Text>

            <TextInput
              style={[styles.input, { backgroundColor: theme.bgCard, borderColor: theme.bgCardBorder, color: theme.text }]}
              placeholder={PROMPTS[promptIdx]}
              placeholderTextColor={theme.textTertiary}
              value={why}
              onChangeText={setWhy}
              multiline
              numberOfLines={5}
              autoFocus
              textAlignVertical="top"
              autoCorrect={false}
            />

            {/* Prompt suggestions */}
            <View style={styles.prompts}>
              {PROMPTS.map((p, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.promptChip, { backgroundColor: promptIdx === i ? 'rgba(157,78,221,0.2)' : theme.bgCard, borderColor: promptIdx === i ? theme.accent : theme.bgCardBorder }]}
                  onPress={() => { setPromptIdx(i); if (!why) setWhy(''); }}
                >
                  <Text style={[styles.promptText, { color: promptIdx === i ? theme.accent : theme.textTertiary }]}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.saveBtn, !why.trim() && { opacity: 0.3 }]}
              onPress={() => why.trim() && save()}
              activeOpacity={0.85}
            >
              <LinearGradient colors={theme.gradientBtn} style={styles.saveBtnGradient}>
                <Text style={[styles.saveBtnText, { color: theme.btnText }]}>SAVE</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const getStyles = (theme) => ({
  root: { flex: 1 },
  header: { paddingHorizontal: 24, paddingTop: 64, marginBottom: 8 },
  back: { fontSize: 15, fontWeight: '600' },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 16 },
  eyebrow: { fontSize: 10, fontWeight: '700', letterSpacing: 4, marginBottom: 12 },
  title: { fontSize: 40, fontWeight: '900', letterSpacing: -1, lineHeight: 46, marginBottom: 8 },
  sub: { fontSize: 14, lineHeight: 20, marginBottom: 24 },
  input: { borderWidth: 1, borderRadius: 16, padding: 18, fontSize: 16, lineHeight: 24, minHeight: 140, marginBottom: 16 },
  prompts: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  promptChip: { borderWidth: 1, borderRadius: 100, paddingHorizontal: 12, paddingVertical: 6 },
  promptText: { fontSize: 12, fontWeight: '500' },
  footer: { paddingHorizontal: 24, paddingBottom: 48 },
  saveBtn: { borderRadius: 18, overflow: 'hidden' },
  saveBtnGradient: { paddingVertical: 22, alignItems: 'center', borderRadius: 18 },
  saveBtnText: { fontSize: 15, fontWeight: '800', letterSpacing: 3 },
});
