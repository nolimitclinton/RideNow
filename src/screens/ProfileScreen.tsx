import React from "react";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Avatar from "../components/profile/Avatar";
import Details from "../components/profile/Details";
import Header from "../components/ui/Header";

export default function ProfileScreen() {
  return (
    <SafeAreaView style={{ padding: 16, flex: 1 }}>
      <Header title="Profile" />
      <Avatar />
      <Details />
    </SafeAreaView>
  );
}
