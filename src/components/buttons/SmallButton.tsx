import React from 'react';
import { Text, Pressable, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import * as LucideIcons from 'lucide-react-native';
import { COLORS } from '../../constants/colors';

type SmallButtonProps = {
  text: string;
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
  iconColor = COLORS.WHITE,
  iconSize = 16,
  style,
  textStyle,
}: SmallButtonProps) {
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
        style,
        pressed && { opacity: 0.8 },
      ]}
    >
      {RenderedIcon}
      <Text style={[styles.text, textStyle]}>{text}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.GREEN,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  text: {
    color: COLORS.WHITE,
    fontSize: 14,
    fontWeight: '600',
  },
  icon: {
    marginRight: 4,
  },
});
