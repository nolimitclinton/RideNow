import React, { useMemo, useState, useEffect } from 'react';
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
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../../constants/colors';
import { signUpEmail } from '../../services/auth';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth, db } from '../../services/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

WebBrowser.maybeCompleteAuthSession();

const BORDER = '#E6E6E6';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignupScreen() {
  const nav = useNavigation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneCode, setPhoneCode] = useState('+880');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other' | ''>('');
  const [password, setPassword] = useState('');
  const [secure, setSecure] = useState(true);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [agree, setAgree] = useState(true);

  // Google auth setup
  
const redirectUri = makeRedirectUri();

const [request, response, promptAsync] = Google.useAuthRequest({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID!,
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID!,
  scopes: ['profile', 'email'],
  redirectUri, 
});
//console.log(makeRedirectUri());

  useEffect(() => {
    if (response?.type === 'success') {
      handleGoogleResponse(response);
    }
  }, [response]);

  async function handleGoogleResponse(res: any) {
    try {
      const idToken = res.authentication?.idToken;
      if (!idToken) return;

      const credential = GoogleAuthProvider.credential(idToken);
      const cred = await signInWithCredential(auth, credential);

      await setDoc(
        doc(db, 'users', cred.user.uid),
        {
          name: cred.user.displayName ?? '',
          email: cred.user.email,
          photoURL: cred.user.photoURL ?? null,
          provider: 'google',
          createdAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (e: any) {
      console.log('Google Sign Up Error:', e);
      setErr('Google sign-up failed. Please try again.');
    }
  }

  const canSubmit = useMemo(() => {
    const okName = name.trim().length >= 2;
    const okEmail = EMAIL_RE.test(email.trim());
    const okPass = password.length >= 6;
    return okName && okEmail && okPass && agree && !loading;
  }, [name, email, password, agree, loading]);

  async function onSubmit() {
    if (!canSubmit) return;
    setErr(null);
    setLoading(true);
    try {
      await signUpEmail(name.trim(), email.trim(), password);
      (nav as any).navigate('VerifyEmail');
    } catch (e: any) {
      const msg = e?.code || e?.message || 'Sign up failed';
      setErr(humanize(msg));
    } finally {
      setLoading(false);
    }
  }

  async function onGooglePress() {
    await promptAsync({ useProxy: true }as any);
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Back
        <TouchableOpacity onPress={() => nav.goBack()} style={styles.backBtn}>
          <Text style={styles.backTxt}>Back</Text>
        </TouchableOpacity> */}

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Sign up with your email or phone number</Text>
        </View>

        {/* Error */}
        {err ? (
          <View style={styles.errorBox} accessibilityLiveRegion="polite">
            <Text style={styles.errorText}>{err}</Text>
          </View>
        ) : null}

        {/* Form */}
        <View style={styles.form}>
          <TextInput
            value={name}
            onChangeText={(t) => {
              setName(t);
              if (err) setErr(null);
            }}
            placeholder="Name"
            placeholderTextColor={COLORS.GRAY}
            style={[styles.input, name && name.trim().length < 2 && styles.inputInvalid]}
            returnKeyType="next"
          />

          <TextInput
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              if (err) setErr(null);
            }}
            placeholder="Email"
            placeholderTextColor={COLORS.GRAY}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            style={[styles.input, email && !EMAIL_RE.test(email.trim()) && styles.inputInvalid]}
            returnKeyType="next"
          />

          {/* Phone row */}
          <View style={styles.phoneRow}>
            <Pressable style={styles.flagBtn}>
              <Text style={styles.flagTxt}>🇧🇩</Text>
            </Pressable>
            <TextInput
              value={phoneCode}
              onChangeText={setPhoneCode}
              style={[styles.input, styles.codeInput]}
              keyboardType="phone-pad"
            />
            <TextInput
              value={phone}
              onChangeText={setPhone}
              style={[styles.input, styles.phoneInput]}
              placeholder="Your mobile number"
              placeholderTextColor={COLORS.GRAY}
              keyboardType="phone-pad"
            />
          </View>

          {/* Gender selector */}
          <Pressable
            style={styles.select}
            onPress={() => {
              setGender(
                gender === ''
                  ? 'Male'
                  : gender === 'Male'
                  ? 'Female'
                  : gender === 'Female'
                  ? 'Other'
                  : ''
              );
            }}
          >
            <Text style={[styles.selectTxt, gender ? { color: COLORS.DARK_GRAY } : { color: COLORS.GRAY }]}>
              {gender || 'Gender'}
            </Text>
            <Text style={{ color: COLORS.GRAY }}>▾</Text>
          </Pressable>

          {/* Password */}
          <View style={styles.passwordRow}>
            <TextInput
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                if (err) setErr(null);
              }}
              placeholder="Minimum 6 characters"
              placeholderTextColor={COLORS.GRAY}
              secureTextEntry={secure}
              autoCapitalize="none"
              style={[styles.input, styles.passwordInput, password && password.length < 6 && styles.inputInvalid]}
              returnKeyType="done"
              onSubmitEditing={onSubmit}
            />
            <Pressable onPress={() => setSecure((s) => !s)} style={styles.eyeBtn}>
              <Text style={styles.eyeText}>{secure ? 'Show' : 'Hide'}</Text>
            </Pressable>
          </View>

          {/* Terms */}
          <Pressable onPress={() => setAgree((a) => !a)} style={styles.termsRow}>
            <Text style={[styles.checkbox, agree && styles.checkboxOn]}>{agree ? '✓' : ''}</Text>
            <Text style={styles.termsTxt}>
              By signing up, you agree to the <Text style={styles.link}>Terms of service</Text> and{' '}
              <Text style={styles.link}>Privacy policy</Text>.
            </Text>
          </Pressable>

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

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.hr} />
            <Text style={styles.or}>or</Text>
            <View style={styles.hr} />
          </View>

          {/* Google Sign Up */}
          <Pressable
            onPress={onGooglePress}
            disabled={!request}
            style={({ pressed }) => [{ alignItems: 'center' }, pressed && { opacity: 0.8 }]}
          >
            <Image
              source={require('../../../assets/icons/Gmail.png')}
              style={{ width: 44, height: 44 }}
              resizeMode="contain"
            />
          </Pressable>

          {/* Footer */}
          <View style={styles.switchRow}>
            <Text style={styles.switchText}>Already have an account? </Text>
            <Pressable onPress={() => nav.goBack()}>
              <Text style={styles.switchLink}>Sign in</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function humanize(codeOrMsg: string) {
  if (codeOrMsg.includes('auth/email-already-in-use')) return 'Email already in use.';
  if (codeOrMsg.includes('auth/invalid-email')) return 'Please enter a valid email address.';
  if (codeOrMsg.includes('auth/weak-password')) return 'Use at least 6 characters.';
  return 'Sign up failed. Please try again.';
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: COLORS.WHITE, paddingHorizontal: 24, paddingTop: 84, paddingBottom: 24 },
  
  header: { marginBottom: 8 },
  title: { color: COLORS.DARK_GRAY, fontSize: 22, lineHeight: 28, fontWeight: '700' },

  errorBox: { borderWidth: 1, borderColor: '#FCA5A5', backgroundColor: '#FEF2F2', padding: 12, borderRadius: 12, marginBottom: 8 },
  errorText: { color: '#991B1B', fontSize: 13 },

  form: { gap: 12 },

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

  phoneRow: { flexDirection: 'row', gap: 8 },
  flagBtn: {
    width: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  flagTxt: { fontSize: 18 },
  codeInput: { flexBasis: 90, textAlign: 'center' },
  phoneInput: { flex: 1 },

  select: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
    backgroundColor: '#fff',
  },
  selectTxt: { fontSize: 16 },

  passwordRow: { position: 'relative' },
  passwordInput: { paddingRight: 64 },
  eyeBtn: { position: 'absolute', right: 8, top: 8, bottom: 8, paddingHorizontal: 10, justifyContent: 'center' },
  eyeText: { color: COLORS.GREEN, fontWeight: '600' },

  termsRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: 6 },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 5,
    textAlign: 'center',
    lineHeight: 18,
    color: '#fff',
    backgroundColor: '#fff',
  },
  checkboxOn: { backgroundColor: COLORS.LIGHT_GREEN, borderColor: COLORS.LIGHT_GREEN },
  termsTxt: { color: COLORS.GRAY, flex: 1, fontSize: 12, lineHeight: 18 },
  link: { color: COLORS.GREEN, fontWeight: '700' },

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

  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 16 },
  hr: { flex: 1, height: 1, backgroundColor: BORDER },
  or: { color: COLORS.GRAY, fontSize: 13 },

  switchRow: { marginTop: 8, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  switchText: { color: COLORS.GRAY, fontSize: 14 },
  switchLink: { color: COLORS.GREEN, fontSize: 14, fontWeight: '700' },
});
