import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Avatar from "../components/profile/Avatar";
import Details from "../components/profile/Details";
import Header from "../components/ui/Header";
import { useAuth } from "../store/AuthProvider";
import { useTheme } from "../store/ThemeProvider";
import { ScrollView } from "react-native-gesture-handler";


export default function ProfileScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  return (
    <SafeAreaView style={[{ padding: 16, flex: 1 }, { backgroundColor: theme.colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
      <Header title="Profile" />
      <Avatar/>
      <Details/>
      </ScrollView>
    </SafeAreaView>
  );
}
