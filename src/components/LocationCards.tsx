import React from "react";
import { TouchableOpacity, View, Text } from "react-native";

type Props = {
  onPress: () => void;
  locationName?: string;
  destinationName?: string;
  theme: any;
};

export default function LocationCards({ onPress, locationName, destinationName, theme }: Props) {
  return (
    <TouchableOpacity
      style={{ paddingHorizontal: 12, paddingVertical: 12, borderBottomWidth: 1, gap: 12, backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={{ flexDirection: "row", alignItems: "center", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: theme.colors.border }}>
        <View style={{ width: 10, height: 10, borderRadius: 5, marginRight: 12, backgroundColor: theme.colors.primary }} />
        <View style={{ flex: 1 }}>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Pickup</Text>
          <Text numberOfLines={1} style={{ color: theme.colors.text, fontWeight: "600" }}>{locationName || "Current location"}</Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, marginTop: 8, borderColor: theme.colors.border }}>
        <View style={{ width: 10, height: 10, borderWidth: 2, marginRight: 12, borderColor: theme.colors.primary }} />
        <View style={{ flex: 1 }}>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Destination</Text>
          <Text numberOfLines={1} style={{ color: destinationName ? theme.colors.text : theme.colors.textSecondary, fontWeight: "600" }}>{destinationName || "Where to?"}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
