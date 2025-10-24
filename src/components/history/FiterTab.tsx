import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { COLORS } from "../../constants/colors";

const filterNav = ["Upcoming", "Completed", "Cancelled"];

interface FilterTabProps {
  onFilterChange: (filter: string) => void;
}

const FilterTab = ({ onFilterChange }: FilterTabProps) => {
  const [activeFilter, setActiveFilter] = useState("Upcoming");

  const handlePress = (item: string) => {
    setActiveFilter(item);
    // Convert to lowercase to match dummyhistory category format
    onFilterChange(item.toLowerCase());
  };

  return (
    <View style={styles.container}>
      {filterNav.map((item) => {
        const isActive = item === activeFilter;
        return (
          <Pressable
            key={item}
            onPress={() => handlePress(item)}
            style={[styles.button, isActive && styles.buttonActive]}
          >
            <Text
              style={isActive ? styles.buttonActiveText : styles.buttonText}
            >
              {item}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

export default FilterTab;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    borderColor: COLORS.LIGHT_GREEN,
    backgroundColor: COLORS.EXTRA_LIGHT_GREEN,
    overflow: "hidden",
    marginBottom: 12,
  },
  button: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    borderRadius: 7,
  },
  buttonActive: {
    backgroundColor: COLORS.GREEN,
  },
  buttonText: {
    color: COLORS.DARK_GRAY,
    fontWeight: "500",
  },
  buttonActiveText: {
    color: COLORS.WHITE,
    fontWeight: "600",
  },
});
