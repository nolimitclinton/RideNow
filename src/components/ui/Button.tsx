import React from "react";
import {
  TouchableOpacity,
  Text,
  Image,
  StyleSheet,
  ImageSourcePropType,
} from "react-native";
import { COLORS } from "../../constants/colors";

type ButtonVariant = "default" | "outline-green" | "outline-black";

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
  } else if (variant === "outline-black") {
    backgroundColor = "transparent";
    borderColor = COLORS.DARK_GRAY;
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
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderRadius: 8,
    paddingVertical: 16,
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
    fontWeight: "400",
  },
});
