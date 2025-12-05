import React from 'react';
import { Text, Pressable, StyleSheet, ViewStyle, TextStyle, Switch } from 'react-native';
import * as LucideIcons from 'lucide-react-native';
import { COLORS } from '../../constants/colors';
import { useTheme } from '../../store/ThemeContext';

type LongButtonProps = {
  text: string;
  onPress?: () => void;
  icon?: keyof typeof LucideIcons;
  iconColor?: string;
  iconSize?: number;
  style?: ViewStyle;
  textStyle?: TextStyle;

  // NEW — optional switch
  enableSwitch?: boolean;
  switchValue?: boolean;
  onToggleSwitch?: (value: boolean) => void;
};

export default function LongButton({
  text,
  onPress,
  icon,
  iconColor = COLORS.WHITE,
  iconSize = 20,
  style,
  textStyle,

  enableSwitch = false,
  switchValue = false,
  onToggleSwitch,
}: LongButtonProps) {
  const { theme } = useTheme();
  const IconComponent = icon
    ? (LucideIcons[icon] as unknown as React.ComponentType<any>)
    : null;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: theme.primary },
        style,
        pressed && { opacity: 0.8 },
      ]}
    >
      {IconComponent && <IconComponent color={iconColor} size={iconSize} style={styles.icon} />}

      <Text style={[styles.text, textStyle]}>{text}</Text>

      {/* Optional Switch */}
      {enableSwitch && (
        <Switch
          value={switchValue}
          onValueChange={onToggleSwitch}
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // ← adjust spacing
    backgroundColor: COLORS.GREEN,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: '100%',
    gap: 8,
  },
  text: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: '600',
  },
  icon: {
    marginRight: 6,
  },
});
