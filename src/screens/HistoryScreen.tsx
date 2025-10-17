import React from "react";
import { View, Text } from "react-native";
import Button from "../components/ui/Button";

export default function HistoryScreen() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>History</Text>
      <Button variant="outline-green" title="Hello" />
    </View>
  );
}
