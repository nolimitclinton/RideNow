import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../store/ThemeProvider';

export default function WelcomeScreen() {
  const nav = useNavigation();
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Illustration */}
      <Image
        source={require('../../../assets/icons/welcome.png')}
        style={styles.image}
        resizeMode="contain"
      />

      {/* Title + subtitle */}
      <Text style={[styles.title, { color: theme.colors.text }]}>Welcome</Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Have a better sharing experience</Text>

      {/* Buttons */}
      <View style={styles.btnWrap}>
        <Pressable
          onPress={() => nav.navigate('Signup' as never)}
          style={({ pressed }) => [styles.primary, { backgroundColor: theme.colors.primaryLight }, pressed && { opacity: 0.9 }]}
        >
          <Text style={[styles.primaryTxt, { color: theme.colors.background }]}>Create an account</Text>
        </Pressable>

        <Pressable
          onPress={() => nav.navigate('Login' as never)}
          style={({ pressed }) => [styles.outline, { borderColor: theme.colors.primary, backgroundColor: theme.colors.background }, pressed && { opacity: 0.9 }]}
        >
          <Text style={[styles.outlineTxt, { color: theme.colors.primary }]}>Log In</Text>
        </Pressable>
      </View>
    </View>
  );
}

const BORDER = '#E6E6E6';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 260,
    marginTop: 24,
  },
  title: {
    marginTop: 18,
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
  },
  btnWrap: {
    width: '100%',
    marginTop: 28,
  },
  primary: {
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryTxt: {
    fontSize: 16,
    fontWeight: '700',
  },
  outline: {
    marginTop: 12,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineTxt: {
    fontSize: 16,
    fontWeight: '700',
  },
});