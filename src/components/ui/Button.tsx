import React from "react";
import {
  TouchableOpacity,
  Text,
  Image,
  StyleSheet,
  ImageSourcePropType,
} from "react-native";
import { COLORS } from "../../constants/colors";

type ButtonVariant = "default" | "outline-green" | "black_outline";

interface Props {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  icon?: ImageSourcePropType;
  style?: object;
}

export default function Button({
  title,
  onPress,
  variant = "default",
  icon,
  style,
}: Props) {
  let backgroundColor = "";
  let borderColor = "";
  let textColor = "";

  if (variant === "default") {
    backgroundColor = COLORS.GREEN;
    borderColor = COLORS.GREEN;
    textColor = COLORS.WHITE;
  } else if (variant === "outline-green") {
    backgroundColor = "transparent";
    borderColor = COLORS.GREEN;
    textColor = COLORS.GREEN;
  } else if (variant === "black_outline") {
    backgroundColor = "transparent";
    borderColor = COLORS.LIGHT_GRAY;
    textColor = COLORS.DARK_GRAY;
  }

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
