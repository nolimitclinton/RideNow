import { Pressable, StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import { COLORS } from "../../constants/colors";

const filterNav = ["Upcoming", "Completed", "Cancelled"];

const FiterTab = () => {
  const [activeFilter, setActiveFilter] = useState("Upcoming");
  return (
    <View style={[styles.container]}>
      {filterNav.map((item, index) => (
        <Pressable
          key={index}
          onPress={() => setActiveFilter(item)}
          style={[item === activeFilter && styles.buttonActive, styles.button]}
        >
          <Text
            style={
              item === activeFilter
                ? styles.buttonActiveText
                : styles.buttonText
            }
          >
            {item}
          </Text>
        </Pressable>
      ))}
    </View>
  );
};

export default FiterTab;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: COLORS.LIGHT_GREEN,
    backgroundColor: COLORS.EXTRA_LIGHT_GREEN,
  },
  button: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    borderRadius: 7,
  },
  buttonActive: {
    backgroundColor: COLORS.GREEN,
  },
  buttonActiveText: {
    color: COLORS.WHITE,
  },
  buttonText: {
    color: COLORS.DARK_GRAY,
  },
});
