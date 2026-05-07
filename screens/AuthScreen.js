import { StyleSheet, Text, View, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const REGION = 'us-east-1';
const CLIENT_ID = '2og2vg8nn27svmjlpo4ah6j1na';

const cognitoRequest = async (action, body) => {
  const response = await fetch(`https://cognito-idp.${REGION}.amazonaws.com/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-amz-json-1.1',
      'X-Amz-Target': `AWSCognitoIdentityProviderService.${action}`,
    },
    body: JSON.stringify({ ...body, ClientId: CLIENT_ID }),
  });
  const data = await response.json();
  if (data.__type) throw new Error(data.message || data.__type);
  return data;
};

export default function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    setError('');
    try {
      const data = await cognitoRequest('InitiateAuth', {
        AuthFlow: 'USER_PASSWORD_AUTH',
        AuthParameters: { USERNAME: email, PASSWORD: password },
      });
      const token = data.AuthenticationResult.AccessToken;
      const userId = data.AuthenticationResult.IdToken;
      await AsyncStorage.setItem('auth_token', token);
      await AsyncStorage.setItem('user_id', email);
      onAuth();
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password) return;
    setLoading(true);
    setError('');
    try {
     await cognitoRequest('SignUp', {
  Username: email,
  Password: password,
  UserAttributes: [
    { Name: 'email', Value: email },
    { Name: 'name', Value: email.split('@')[0] },
  ],
});
      
      setMode('confirm');
    } catch (err) {
      setError(err.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!code) return;
    setLoading(true);
    setError('');
    try {
      await cognitoRequest('ConfirmSignUp', {
        Username: email,
        ConfirmationCode: code,
      });
      await handleLogin();
    } catch (err) {
      setError(err.message || 'Confirmation failed');
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <View style={styles.root}>
        <LinearGradient colors={['#1a0035', '#0a000f']} style={StyleSheet.absoluteFillObject} />
        <View style={styles.container}>
          <Text style={styles.logo}>UP</Text>
          <Text style={styles.tagline}>train smarter.</Text>

          {mode === 'confirm' ? (
            <>
              <Text style={styles.title}>Check your email</Text>
              <Text style={styles.subtitle}>We sent a code to {email}</Text>
              <TextInput
                style={styles.input}
                placeholder="Confirmation code"
                placeholderTextColor="rgba(255,255,255,0.25)"
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                autoFocus
              />
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <TouchableOpacity style={styles.btn} onPress={handleConfirm} activeOpacity={0.8}>
                <LinearGradient colors={['#7b2cbf', '#4a0080']} style={styles.btnGradient}>
                  {loading ? <ActivityIndicator color="white" /> : <Text style={styles.btnText}>VERIFY</Text>}
                </LinearGradient>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="rgba(255,255,255,0.25)"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TextInput
                style={styles.input}
                placeholder="Password (min 8 characters)"
                placeholderTextColor="rgba(255,255,255,0.25)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <TouchableOpacity
                style={styles.btn}
                onPress={mode === 'login' ? handleLogin : handleSignUp}
                activeOpacity={0.8}
              >
                <LinearGradient colors={['#7b2cbf', '#4a0080']} style={styles.btnGradient}>
                  {loading
                    ? <ActivityIndicator color="white" />
                    : <Text style={styles.btnText}>{mode === 'login' ? 'LOG IN' : 'CREATE ACCOUNT'}</Text>
                  }
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}>
                <Text style={styles.switchText}>
                  {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a000f' },
  container: { flex: 1, paddingHorizontal: 28, paddingTop: 100, paddingBottom: 48 },
  logo: { fontSize: 56, fontWeight: '900', color: '#ffffff', letterSpacing: 4, textAlign: 'center', marginBottom: 4 },
  tagline: { fontSize: 14, color: 'rgba(255,255,255,0.3)', textAlign: 'center', letterSpacing: 3, marginBottom: 60 },
  title: { fontSize: 28, fontWeight: '800', color: '#ffffff', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginBottom: 32 },
  input: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(157,78,221,0.3)', borderRadius: 14, paddingHorizontal: 18, paddingVertical: 16, color: '#ffffff', fontSize: 16, marginBottom: 12 },
  error: { color: '#ff6b6b', fontSize: 13, marginBottom: 12, textAlign: 'center' },
  btn: { marginTop: 8, marginBottom: 16 },
  btnGradient: { paddingVertical: 20, borderRadius: 16, alignItems: 'center' },
  btnText: { color: 'white', fontSize: 15, fontWeight: '800', letterSpacing: 3 },
  switchText: { color: 'rgba(157,78,221,0.7)', fontSize: 13, textAlign: 'center', fontWeight: '600' },
});