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
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../../constants/colors';
import { signInEmail } from '../../services/auth'; 
import { useTheme } from '../../store/ThemeProvider';

const BORDER = '#E6E6E6';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
  const nav = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secure, setSecure] = useState(true);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const{theme}=useTheme();

  const canSubmit = useMemo(
    () => EMAIL_RE.test(email.trim()) && password.length >= 6 && !loading,
    [email, password, loading]
  );

  async function onSubmit() {
    if (!canSubmit) return;
    setErr(null);
    setLoading(true);
    try {
      await signInEmail(email.trim(), password);
      // AuthProvider will route you to Tabs automatically
    } catch (e: any) {
      const msg = e?.code || e?.message || 'Sign in failed';
      setErr(humanizeFirebaseError(msg));
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={[styles.container,{backgroundColor:theme.colors.background}]} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Welcome back</Text>
          {/* <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Already have an account?</Text><Text style={styles.subtitle}>Sign in to continue</Text> */}
        </View>

        {/* Error */}
        {err ? (
          <View style={[styles.errorBox, { backgroundColor: theme.colors.error }]} role="alert" aria-relevant="additions" aria-atomic={true} accessibilityLiveRegion="polite">
            <Text style={[{ color: theme.colors.background }]}>Error</Text><Text style={styles.errorText}>{err}</Text>
          </View>
        ) : null}

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={[styles.label,{color:theme.colors.text}]}>Email</Text>
            <TextInput
              value={email}
              onChangeText={(t) => { setEmail(t); if (err) setErr(null); }}
              placeholder="name@example.com"
              placeholderTextColor={COLORS.GRAY}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="username"
              returnKeyType="next"
              style={[styles.input, email && !EMAIL_RE.test(email.trim()) && styles.inputInvalid]}
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label,{color:theme.colors.text}]}>Password</Text>
            <View style={styles.passwordRow}>
              <TextInput
                value={password}
                onChangeText={(t) => { setPassword(t); if (err) setErr(null); }}
                placeholder="••••••••"
                placeholderTextColor={COLORS.GRAY}
                secureTextEntry={secure}
                autoCapitalize="none"
                textContentType="password"
                returnKeyType="done"
                onSubmitEditing={onSubmit}
                style={[styles.input, styles.passwordInput]}
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

            <TouchableOpacity style={styles.forgotWrap}>
              <Text style={styles.forgot}>Forgot password?</Text>
            </TouchableOpacity>
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
            <Text style={styles.ctaText}>{loading ? 'Signing in…' : 'Sign In'}</Text>
          </Pressable>

          {/* Footer link */}
          <View style={styles.switchRow}>
            <Text style={styles.switchText}>Don’t have an account? </Text>
            <Pressable onPress={() => nav.navigate('Signup' as never)}>
              <Text style={styles.switchLink}>Sign up</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function humanizeFirebaseError(codeOrMsg: string) {
  // basic mapper; expand later
  if (codeOrMsg.includes('auth/invalid-credential')) return 'Invalid email or password.';
  if (codeOrMsg.includes('auth/invalid-email')) return 'Please enter a valid email address.';
  if (codeOrMsg.includes('auth/too-many-requests')) return 'Too many attempts. Try again later.';
  return 'Sign in failed. Please try again.';
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    
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

  forgotWrap: { alignSelf: 'flex-end', marginTop: 8 },
  forgot: { color: COLORS.GREEN, fontSize: 13, fontWeight: '600' },

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