import React from "react";
import { Animated, Image } from "react-native";
import { Marker } from "react-native-maps";

type LatLng = { latitude: number; longitude: number };

type Props = {
  coordinate: LatLng;
  rotationAnim: Animated.Value;
  isSearching?: boolean;
  isMoving?: boolean;
};

export default function DriverMarker({ coordinate, rotationAnim, isSearching, isMoving }: Props) {
  const currentRotation = rotationAnim.interpolate({
    inputRange: [-360, 0, 360],
    outputRange: ["-360deg", "0deg", "360deg"],
    extrapolate: "extend",
  });

  // if coordinate is null, don't render anything (caller should guard)
  return (
    <Marker
      coordinate={coordinate}
      title="Driver"
      description={isSearching ? "Finding closest driver..." : isMoving ? "On the way" : ""}
      anchor={{ x: 0.5, y: 0.5 }}
      flat
    >
      <Animated.View style={{ transform: [{ rotate: currentRotation }] }}>
        <Image source={require("../../assets/carIcon.png")} style={{ width: 40, height: 40 }} resizeMode="contain" />
      </Animated.View>
    </Marker>
  );
}
