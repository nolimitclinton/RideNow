import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../../constants/colors';
import { signUpEmail } from '../../services/auth'; 

const BORDER = '#E6E6E6';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignupScreen() {
  const nav = useNavigation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secure, setSecure] = useState(true);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    const okName = name.trim().length >= 2;
    const okEmail = EMAIL_RE.test(email.trim());
    const okPass = password.length >= 6;
    return okName && okEmail && okPass && !loading;
  }, [name, email, password, loading]);

  async function onSubmit() {
    if (!canSubmit) return;
    setErr(null);
    setLoading(true);
    try {
      await signUpEmail(name.trim(), email.trim(), password);
     
    } catch (e: any) {
      const msg = e?.code || e?.message || 'Sign up failed';
      setErr(humanizeFirebaseError(msg));
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>Join RideNow and get moving</Text>
        </View>

        {/* Error */}
        {err ? (
          <View style={styles.errorBox} accessibilityLiveRegion="polite">
            <Text style={styles.errorText}>{err}</Text>
          </View>
        ) : null}

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Full name</Text>
            <TextInput
              value={name}
              onChangeText={(t) => { setName(t); if (err) setErr(null); }}
              placeholder="Ada Lovelace"
              placeholderTextColor={COLORS.GRAY}
              style={[styles.input, name && name.trim().length < 2 && styles.inputInvalid]}
              returnKeyType="next"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              value={email}
              onChangeText={(t) => { setEmail(t); if (err) setErr(null); }}
              placeholder="name@example.com"
              placeholderTextColor={COLORS.GRAY}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="username"
              style={[styles.input, email && !EMAIL_RE.test(email.trim()) && styles.inputInvalid]}
              returnKeyType="next"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordRow}>
              <TextInput
                value={password}
                onChangeText={(t) => { setPassword(t); if (err) setErr(null); }}
                placeholder="Minimum 6 characters"
                placeholderTextColor={COLORS.GRAY}
                secureTextEntry={secure}
                autoCapitalize="none"
                textContentType="newPassword"
                returnKeyType="done"
                onSubmitEditing={onSubmit}
                style={[styles.input, styles.passwordInput, password && password.length < 6 && styles.inputInvalid]}
              />
              <Pressable
                onPress={() => setSecure((s) => !s)}
                accessibilityRole="button"
                accessibilityLabel={secure ? 'Show password' : 'Hide password'}
                style={({ pressed }) => [styles.eyeBtn, pressed && { opacity: 0.7 }]}
              >
                <Text style={styles.eyeText}>{secure ? 'Show' : 'Hide'}</Text>
              </Pressable>
            </View>
          </View>

          {/* CTA */}
          <Pressable
            onPress={onSubmit}
            disabled={!canSubmit}
            style={({ pressed }) => [
              styles.cta,
              (!canSubmit || loading) && styles.ctaDisabled,
              pressed && !loading && styles.ctaPressed,
            ]}
          >
            <Text style={styles.ctaText}>{loading ? 'Creating…' : 'Sign Up'}</Text>
          </Pressable>

          {/* Footer link */}
          <View style={styles.switchRow}>
            <Text style={styles.switchText}>Already have an account? </Text>
            <Pressable onPress={() => nav.goBack()}>
              <Text style={styles.switchLink}>Log in</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function humanizeFirebaseError(codeOrMsg: string) {
  if (codeOrMsg.includes('auth/email-already-in-use')) return 'Email already in use.';
  if (codeOrMsg.includes('auth/invalid-email')) return 'Please enter a valid email address.';
  if (codeOrMsg.includes('auth/weak-password')) return 'Use at least 6 characters.';
  return 'Sign up failed. Please try again.';
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.WHITE,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
  },
  header: { marginBottom: 20 },
  title: { color: COLORS.DARK_GRAY, fontSize: 28, lineHeight: 34, fontWeight: '700' },
  subtitle: { color: COLORS.GRAY, fontSize: 14, marginTop: 6 },

  errorBox: {
    borderWidth: 1,
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  errorText: { color: '#991B1B', fontSize: 13 },

  form: { gap: 16 },
  field: { gap: 8 },
  label: { color: COLORS.DARK_GRAY, fontSize: 14, fontWeight: '500' },

  input: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.DARK_GRAY,
    backgroundColor: COLORS.WHITE,
  },
  inputInvalid: { borderColor: '#FCA5A5' },

  passwordRow: { position: 'relative' },
  passwordInput: { paddingRight: 64 },
  eyeBtn: {
    position: 'absolute',
    right: 8,
    top: 8,
    bottom: 8,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  eyeText: { color: COLORS.GREEN, fontWeight: '600' },

  cta: {
    marginTop: 8,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.LIGHT_GREEN,
  },
  ctaDisabled: { opacity: 0.6 },
  ctaPressed: { opacity: 0.9 },
  ctaText: { color: COLORS.WHITE, fontSize: 16, fontWeight: '700' },

  switchRow: { marginTop: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  switchText: { color: COLORS.GRAY, fontSize: 14 },
  switchLink: { color: COLORS.GREEN, fontSize: 14, fontWeight: '700' },
});