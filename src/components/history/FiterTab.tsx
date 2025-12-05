import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../../store/ThemeProvider";

const filterNav = ["Upcoming", "Completed", "Cancelled"];

interface FilterTabProps {
  onFilterChange: (filter: string) => void;
}

const FilterTab = ({ onFilterChange }: FilterTabProps) => {
  const [activeFilter, setActiveFilter] = useState("Upcoming");
  const { theme } = useTheme();

  const handlePress = (item: string) => {
    setActiveFilter(item);
    // Convert to lowercase to match dummyhistory category format
    onFilterChange(item.toLowerCase());
  };

  return (
    <View style={[styles.container, { borderColor: theme.colors.primaryLight, backgroundColor: theme.colors.secondary }]}>
      {filterNav.map((item) => {
        const isActive = item === activeFilter;
        return (
          <Pressable
            key={item}
            onPress={() => handlePress(item)}
            style={[styles.button, isActive && [styles.buttonActive, { backgroundColor: theme.colors.primary }]]}
          >
            <Text
              style={isActive ? [styles.buttonActiveText, { color: theme.colors.background }] : [styles.buttonText, { color: theme.colors.text }]}
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
  },
  buttonText: {
    fontWeight: "500",
  },
  buttonActiveText: {
    fontWeight: "600",
  },
});
