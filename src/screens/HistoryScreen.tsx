import React from "react";
import { View, Text } from "react-native";
import Button from "../components/ui/Button";
import { SafeAreaView } from "react-native-safe-area-context";
import FiterTab from "../components/history/FiterTab";
import HistoryRender from "../components/history/HistoryRender";

export default function HistoryScreen() {
  return (
    <SafeAreaView style={{ padding: 16, flex: 1 }}>
      <FiterTab />
      <HistoryRender />
    </SafeAreaView>
  );
}
