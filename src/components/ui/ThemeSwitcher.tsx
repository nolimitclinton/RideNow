import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../../store/ThemeProvider';
import { Moon, Sun } from 'lucide-react-native';

export function ThemeSwitcher() {
  const { theme, themeMode, toggleTheme } = useTheme();

  return (
    <Pressable
      onPress={toggleTheme}
      style={[
        styles.container,
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }
      ]}
    >
      {themeMode === 'dark' ? (
        <Sun color={theme.colors.primary} size={24} />
      ) : (
        <Moon color={theme.colors.primary} size={24} />
      )}
      <Text style={[styles.text, { color: theme.colors.text }]}>
        {themeMode === 'dark' ? 'Light' : 'Dark'} Mode
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
  },
});
