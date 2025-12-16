import React from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LongButton from "../components/buttons/LongButton";

const PRICE_PER_KM = 500;

const formatNaira = (amount: number) =>
  `₦${Math.round(amount).toLocaleString("en-NG")}`;

const formatDistance = (km: number) =>
  km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;

type Props = {
  routeDistanceKm?: number | null;
  priceEstimate?: number | null;
  isSearchingDriver: boolean;
  isDriverMoving: boolean;
  rideCompleted: boolean;
  onConfirm: () => void;
  onReset: () => void;
  theme: any;

  fareMin?: number | null;
  fareMax?: number | null;
  finalFare?: number | null;
};

export default function RideControls({
  routeDistanceKm,
  priceEstimate,
  isSearchingDriver,
  isDriverMoving,
  rideCompleted,
  onConfirm,
  onReset,
  theme,
  fareMin,
  fareMax,
  finalFare,
}: Props) {
  
  const fallbackFare =
    routeDistanceKm != null
      ? Math.round(routeDistanceKm * PRICE_PER_KM)
      : Math.round(priceEstimate ?? 0);

  const hasRange =
    fareMin != null &&
    fareMax != null &&
    fareMin > 0 &&
    fareMax > 0 &&
    fareMax >= fareMin;

  const showFareText = () => {
    //  If user accepted and you picked a final fare, show the final fare
    if (finalFare != null && finalFare > 0) return formatNaira(finalFare);

    //  Otherwise show range if available
    if (hasRange) return `${formatNaira(fareMin!)} – ${formatNaira(fareMax!)}`;

    //  Otherwise fallback
    return formatNaira(fallbackFare);
  };

  if (rideCompleted) {
    return (
      <SafeAreaView
        style={{
          padding: 16,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
        }}
        edges={["bottom"]}
      >
        <LongButton text="Book Another Ride" onPress={onReset} />
      </SafeAreaView>
    );
  }

  if (routeDistanceKm && routeDistanceKm > 0 && !isDriverMoving) {
    return (
      <SafeAreaView
        style={{
          padding: 16,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
          backgroundColor: theme.colors.surface,
        }}
        edges={["bottom"]}
      >
        <View style={{ marginBottom: 8 }}>
          <Text
            style={{
              fontSize: 14,
              color: theme.colors.textSecondary,
              marginBottom: 2,
            }}
          >
            Estimated distance: {formatDistance(routeDistanceKm)}
          </Text>

          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: theme.colors.text,
            }}
          >
            Estimated fare: {showFareText()}
          </Text>
        </View>

        <LongButton
          text={isSearchingDriver ? "Searching for driver..." : "Confirm ride & find driver"}
          onPress={onConfirm}
        />
      </SafeAreaView>
    );
  }

  return null;
}