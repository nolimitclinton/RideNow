import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../components/ui/Header";
import HistoryRender from "../components/history/HistoryRender";
import { useTheme } from "../store/ThemeProvider";

export default function HistoryScreen() {
  const { theme } = useTheme();

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      edges={["top"]} // only top safe area; bottom handled by tab bar
    >
      <Header title="History" />
      <HistoryRender />
    </SafeAreaView>
  );
}