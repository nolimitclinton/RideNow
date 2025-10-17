import React from "react";
import {
  TouchableOpacity,
  Text,
  Image,
  StyleSheet,
  ImageSourcePropType,
} from "react-native";
import { COLORS } from "../../constants/colors";

type ButtonVariant = "filled-green" | "outline-green" | "outline-black";

interface Props {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: ImageSourcePropType;
  style?: object;
}

export default function AppButton({
  title,
  onPress,
  variant = "filled-green",
  icon,
  style,
}: Props) {
  const getStyle = () => {
    switch (variant) {
      case "filled-green":
        return {
          backgroundColor: COLORS.GREEN,
          borderColor: COLORS.GREEN,
          textColor: COLORS.GREEN,
        };
      case "outline-green":
        return {
          backgroundColor: "transparent",
          borderColor: COLORS.GREEN,
          textColor: COLORS.GREEN,
        };
      case "outline-black":
        return {
          backgroundColor: "transparent",
          borderColor: COLORS.DARK_GRAY,
          textColor: COLORS.DARK_GRAY,
        };
    }
  };

  const { backgroundColor, borderColor, textColor } = getStyle();

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor, borderColor }, style]}
      onPress={onPress}
      activeOpacity={0.8}
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
    borderWidth: 1.5,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 8,
    resizeMode: "contain",
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
  },
});
