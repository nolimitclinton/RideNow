import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Avatar from "../components/profile/Avatar";
import Details from "../components/profile/Details";
import Header from "../components/ui/Header";
import { useAuth } from "../../src/store/AuthProvider";


export default function ProfileScreen() {
  const { user } = useAuth();
  return (
    <SafeAreaView style={{ padding: 16, flex: 1 }}>
      <Header title="Profile" />
      <Avatar user={user}/>
      <Details user={user} />
    </SafeAreaView>
  );
}
