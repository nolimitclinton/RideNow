import React from "react";
import {
  TouchableOpacity,
  Text,
  Image,
  StyleSheet,
  ImageSourcePropType,
  ViewStyle,
} from "react-native";
import { useTheme } from "../../store/ThemeProvider";

type ButtonVariant = "default" | "outline-green" | "outline-black";

interface Props {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  icon?: ImageSourcePropType;
  style?: ViewStyle | ViewStyle[];
  disabled?: boolean;
}

export default function Button({
  title,
  onPress,
  variant = "default",
  icon,
  style,
  disabled = false,
}: Props) {
  const { theme } = useTheme();

  let backgroundColor = "";
  let borderColor = "";
  let textColor = "";

  if (variant === "default") {
    backgroundColor = theme.colors.primary;
    borderColor = theme.colors.primary;
    textColor = theme.colors.background;
  } else if (variant === "outline-green") {
    backgroundColor = "transparent";
    borderColor = theme.colors.primary;
    textColor = theme.colors.primary;
  } else if (variant === "outline-black") {
    backgroundColor = "transparent";
    borderColor = theme.colors.border;
    textColor = theme.colors.textSecondary;
  }
  const opacityStyle = disabled ? { opacity: 0.6 } : null;
  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor, borderColor }, opacityStyle,style]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={disabled}
    >
      {icon && <Image source={icon} style={styles.icon} />}
      <Text style={[styles.text, { color: textColor }]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 8,
    width: "100%",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 10,
    resizeMode: "contain",
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
  },
});
