import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { COLORS } from "../../constants/colors";

export interface HistoryItemProp {
  name: string;
  carName: string;
  date: string;
  time: string;
}

const HistoryItem = ({ name, carName, date, time }: HistoryItemProp) => {
  return (
    <View style={styles.container}>
      <View style={{ gap: 8 }}>
        <Text style={{ fontWeight: 500, color: COLORS.DARK_GRAY }}>{name}</Text>
        <Text style={{ color: COLORS.GRAY }}>{carName}</Text>
      </View>
      <Text style={{ fontWeight: 400, color: COLORS.GRAY }}>
        {date} at {time}
      </Text>
    </View>
  );
};

export default HistoryItem;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginVertical: 8,
    borderColor: COLORS.LIGHT_GREEN,
    borderWidth: 1.5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 8,
  },
});
