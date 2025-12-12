import React from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LongButton from "../components/buttons/LongButton";

type Props = {
  routeDistanceKm?: number | null;
  priceEstimate?: number | null;
  isSearchingDriver: boolean;
  isDriverMoving: boolean;
  rideCompleted: boolean;
  onConfirm: () => void;
  onReset: () => void;
  theme: any;
};

export default function RideControls({ routeDistanceKm, priceEstimate, isSearchingDriver, isDriverMoving, rideCompleted, onConfirm, onReset, theme }: Props) {
  if (rideCompleted) {
    return (
      <SafeAreaView style={{ padding: 16, borderTopWidth: 1, borderTopColor: theme.colors.border, backgroundColor: theme.colors.surface }} edges={["bottom"]}>
        <LongButton text="Book Another Ride" onPress={onReset} />
      </SafeAreaView>
    );
  }

  if (routeDistanceKm && routeDistanceKm > 0 && !isDriverMoving) {
    return (
      <SafeAreaView style={{ padding: 16, borderTopWidth: 1, borderTopColor: theme.colors.border, backgroundColor: theme.colors.surface }} edges={["bottom"]}>
        <View style={{ marginBottom: 8 }}>
          <Text style={{ fontSize: 14, color: theme.colors.textSecondary, marginBottom: 2 }}>Estimated distance: {routeDistanceKm.toFixed(1)} km</Text>
          <Text style={{ fontSize: 16, fontWeight: "600", color: theme.colors.text }}>Estimated fare: ₦{priceEstimate ?? Math.round((routeDistanceKm ?? 0) * 500)}</Text>
          {/* <Text style={{ fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 }}>(₦500 per km) */}
        </View>
        <LongButton text={isSearchingDriver ? "Searching for driver..." : "Confirm ride & find driver"} onPress={onConfirm} />
      </SafeAreaView>
    );
  }

  return null;
}
