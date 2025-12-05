// src/screens/auth/VerifyEmailScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, TextInput } from 'react-native';
import { COLORS } from '../../constants/colors';
import { auth } from '../../services/firebase';
import { refreshCurrentUser, resendVerificationEmail, verifyWithCode } from '../../services/auth';
import { useTheme } from '../../store/ThemeProvider';
export default function VerifyEmailScreen() {
  const email = auth.currentUser?.email ?? '';
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const{theme}=useTheme();
  async function onResend() {
  setBusy(true);
  try {
    const code = await resendVerificationEmail();
    Alert.alert(
      'Sent',
      `We re-sent the verification email.\n\nDEV code: ${code}`
    );
  } catch (e: any) {
    Alert.alert('Error', e?.message || 'Could not resend.');
  } finally {
    setBusy(false);
  }
}

  async function onSubmitCode() {
    setBusy(true);
    try {
      await verifyWithCode(code);
      Alert.alert('Verified', 'Account verified. Sign in again.');
    } catch (e: any) {
      Alert.alert('Invalid', e?.message || 'Wrong code');
    } finally {
      setBusy(false);
    }
  }

  async function onIUsedEmailLink() {
    setBusy(true);
    try {
      const user = await refreshCurrentUser();
      if (user.emailVerified) {
        Alert.alert('Verified', 'Email verified. Sign in again.');
      } else {
        Alert.alert('Not verified yet', 'Tap the link in your email, then try again.');
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={[styles.container,{backgroundColor:theme.colors.background}]}>
      <Text style={[styles.title,{color:theme.colors.text}]}>Verify your account</Text>
      <Text style={[styles.subtitle,{color:theme.colors.textSecondary}]}>We sent a link to:</Text>
      <Text style={[styles.email,{color:theme.colors.text}]}>{email}</Text>

      <View style={{ height: 16 }} />

      <Text style={{  marginBottom: 8, color:theme.colors.textSecondary }}>
        Development shortcut: enter the 6-digit code (see console/logs).
      </Text>
      <TextInput
        value={code}
        onChangeText={setCode}
        placeholder="6-digit code"
        placeholderTextColor={theme.colors.text}
        keyboardType="numeric"
        style={[styles.input, { color:theme.colors.text, borderColor:theme.colors.border }]}
      />
      <Pressable disabled={busy} onPress={onSubmitCode} style={[styles.cta, busy && { opacity: 0.6 }]}>
        <Text style={styles.ctaTxt}>Verify with code</Text>
      </Pressable>

      <View style={{ height: 12 }} />

      <Pressable disabled={busy} onPress={onIUsedEmailLink} style={styles.outline}>
        <Text style={styles.outlineTxt}>I used the email link</Text>
      </Pressable>

      <Pressable disabled={busy} onPress={onResend} style={{ marginTop: 16 }}>
        <Text style={{ color: COLORS.GREEN, fontWeight: '700' }}>Resend email & code</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center' },
  title: {  fontSize: 24, fontWeight: '700' },
  subtitle: { marginTop: 8, color: COLORS.GRAY, fontSize: 14 },
  email: { marginTop: 4, color: COLORS.DARK_GRAY, fontSize: 16, fontWeight: '600' },
  input: {
    marginTop: 10,
    borderWidth: 1, borderColor: '#E6E6E6', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12, width: '80%', textAlign: 'center',
  },
  cta: { marginTop: 12, height: 48, borderRadius: 12, backgroundColor: COLORS.LIGHT_GREEN,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 },
  ctaTxt: { color: COLORS.WHITE, fontSize: 16, fontWeight: '700' },
  outline: { marginTop: 8, height: 48, borderRadius: 12, borderWidth: 1, borderColor: COLORS.GREEN,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18, backgroundColor: COLORS.WHITE },
  outlineTxt: { color: COLORS.GREEN, fontSize: 16, fontWeight: '700' },
});