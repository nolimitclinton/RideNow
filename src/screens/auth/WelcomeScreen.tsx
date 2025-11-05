import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../../constants/colors';

export default function WelcomeScreen() {
  const nav = useNavigation();

  return (
    <View style={styles.container}>
      {/* Illustration */}
      <Image
        source={require('../../../assets/icons/welcome.png')}
        style={styles.image}
        resizeMode="contain"
      />

      {/* Title + subtitle */}
      <Text style={styles.title}>Welcome</Text>
      <Text style={styles.subtitle}>Have a better sharing experience</Text>

      {/* Buttons */}
      <View style={styles.btnWrap}>
        <Pressable
          onPress={() => nav.navigate('Signup' as never)}
          style={({ pressed }) => [styles.primary, pressed && { opacity: 0.9 }]}
        >
          <Text style={styles.primaryTxt}>Create an account</Text>
        </Pressable>

        <Pressable
          onPress={() => nav.navigate('Login' as never)}
          style={({ pressed }) => [styles.outline, pressed && { opacity: 0.9 }]}
        >
          <Text style={styles.outlineTxt}>Log In</Text>
        </Pressable>
      </View>
    </View>
  );
}

const BORDER = '#E6E6E6';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
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
    color: COLORS.DARK_GRAY,
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 6,
    color: COLORS.GRAY,
    fontSize: 14,
  },
  btnWrap: {
    width: '100%',
    marginTop: 28,
  },
  primary: {
    height: 52,
    borderRadius: 12,
    backgroundColor: COLORS.LIGHT_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryTxt: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: '700',
  },
  outline: {
    marginTop: 12,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.GREEN,
    backgroundColor: COLORS.WHITE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineTxt: {
    color: COLORS.GREEN,
    fontSize: 16,
    fontWeight: '700',
  },
});