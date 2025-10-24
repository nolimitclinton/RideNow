import React from "react";

import { SafeAreaView } from "react-native-safe-area-context";
import FiterTab from "../components/history/FiterTab";
import HistoryRender from "../components/history/HistoryRender";
import Header from "../components/ui/Header";

export default function HistoryScreen() {
  return (
    <SafeAreaView style={{ padding: 16, flex: 1 }}>
      <Header title="History" />
      <HistoryRender />
    </SafeAreaView>
  );
}
