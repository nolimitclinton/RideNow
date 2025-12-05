import React from 'react';
import { Text, Pressable, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import * as LucideIcons from 'lucide-react-native';
import { useTheme } from '../../store/ThemeProvider';

type SmallButtonProps = {
  text?: string;
  onPress?: () => void;
  icon?: keyof typeof LucideIcons;
  iconColor?: string;
  iconSize?: number;
  style?: ViewStyle;
  textStyle?: TextStyle;
};

export default function SmallButton({
  text,
  onPress,
  icon,
  iconColor = '#ffffff',
  iconSize = 16,
  style,
  textStyle,
}: SmallButtonProps) {
  const { theme } = useTheme();
  const IconComponent =
    icon
      ? (LucideIcons[icon as keyof typeof LucideIcons] as unknown as React.ComponentType<any>)
      : null;

  const RenderedIcon =
    IconComponent ? (
      <IconComponent color={iconColor} size={iconSize} style={styles.icon as any} />
    ) : null;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: theme.colors.primary },
        style,
        pressed && { opacity: 0.8 },
      ]}
    >
      {RenderedIcon}
      {text&&(<Text style={[styles.text, { color: theme.colors.background }, textStyle]}>{text}</Text>)}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
  },
  icon: {
    marginRight: 4,
  },
});
