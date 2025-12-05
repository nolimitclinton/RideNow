import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { useTheme } from "../../store/ThemeProvider";

export interface HistoryItemProp {
  name: string;
  carName: string;
  date: string;
  time: string;
}

const HistoryItem = ({ name, carName, date, time }: HistoryItemProp) => {
  const { theme } = useTheme();
  return (
    <View style={[styles.container, { borderColor: theme.colors.primaryLight }]}>
      <View style={{ gap: 8 }}>
        <Text style={{ fontWeight: 500, color: theme.colors.text }}>{name}</Text>
        <Text style={{ color: theme.colors.textSecondary }}>{carName}</Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={{ fontWeight: 400, color: theme.colors.textSecondary }}>
          {date}
        </Text>
        <Text style={{ fontWeight: 400, color: theme.colors.textSecondary }}>
          {time}
        </Text>
      </View>
    </View>
  );
};

export default HistoryItem;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginVertical: 8,
    borderWidth: 1.5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 8,
  },
});
