import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, StyleSheet } from "react-native";
import Avatar from "../components/profile/Avatar";
import Details from "../components/profile/Details";
import { useAuth } from "../store/AuthProvider";
import { useTheme } from "../store/ThemeProvider";

export default function ProfileScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={["top"]} //  only respect top inset; bottom is handled by the tab bar
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* <Header title="Profile" /> */}
        <Avatar />
        <Details />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24, 
  },
});