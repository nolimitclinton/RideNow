import React from "react";
import { Image, StyleSheet, Text, View, Dimensions } from "react-native";
import { COLORS } from "../../constants/colors";

interface OnboardingItemProps {
  image: any; // or number
  message: string;
  description: string;
}

const { width, height } = Dimensions.get("window");

const OnboardingItem = ({
  image,
  message,
  description,
}: OnboardingItemProps) => {
  return (
    <View style={[styles.container, { width }]}>
      <Image source={image} style={styles.image} resizeMode="contain" />
      <Text style={styles.title}>{message}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
};

export default OnboardingItem;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 140,
  },
  image: {
    width: "100%",
    height: height * 0.3,
  },
  title: {
    fontSize: 24,
    fontWeight: "400",
    color: COLORS.DARK_GRAY,
    marginBottom: 10,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    maxWidth: 280,
    color: COLORS.GRAY,
    textAlign: "center",
  },
});
