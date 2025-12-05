import React from "react";

import { SafeAreaView } from "react-native-safe-area-context";
import FiterTab from "../components/history/FiterTab";
import HistoryRender from "../components/history/HistoryRender";
import Header from "../components/ui/Header";
import { useTheme } from "../store/ThemeProvider";

export default function HistoryScreen() {
  const { theme } = useTheme();
  return (
    <SafeAreaView style={[{ padding: 16, flex: 1 }, { backgroundColor: theme.colors.background }]}>
      <Header title="History" />
      <HistoryRender />
    </SafeAreaView>
  );
}
