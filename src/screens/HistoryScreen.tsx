import React from "react";
import { View, Text } from "react-native";
import Button from "../components/ui/Button";

export default function HistoryScreen() {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
      }}
    >
      <Text>History</Text>
      <Button
        icon={require("../../assets/icons/Gmail.png")}
        title="Hello"
        variant="black_outline"
      />
    </View>
  );
}
