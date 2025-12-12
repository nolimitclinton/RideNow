import React from "react";
import MapView, { PROVIDER_GOOGLE, Marker, Polyline } from "react-native-maps";
import { View } from "react-native";
import DriverMarker from "./DriverMarker";

type LatLng = { latitude: number; longitude: number };

type Props = {
  mapRef: React.RefObject<MapView | null>;
  location: LatLng;
  locationName?: string;
  destinationMarker?: LatLng | null;
  destinationName?: string;
  routeCoords: LatLng[];
  driverLocation?: LatLng | null;
  rotationAnim: any;
  themeMode?: string;
  DARK_MAP_STYLE?: any;
  LIGHT_MAP_STYLE?: any;
};

export default function RouteMap({
  mapRef,
  location,
  locationName,
  destinationMarker,
  destinationName,
  routeCoords,
  driverLocation,
  rotationAnim,
  themeMode,
  DARK_MAP_STYLE,
  LIGHT_MAP_STYLE,
}: Props) {
  return (
    <View style={{ flex: 1 }}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={{ flex: 1 }}
        customMapStyle={themeMode === "dark" ? DARK_MAP_STYLE : LIGHT_MAP_STYLE}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation
        showsMyLocationButton
      >
        <Marker coordinate={location} title={locationName || "Current Location"} pinColor="blue" />

        {destinationMarker && (
          <Marker coordinate={destinationMarker} title={destinationName || "Destination"} pinColor="#007AFF" />
        )}

        {routeCoords.length > 0 && <Polyline coordinates={routeCoords} strokeWidth={4} strokeColor="#007AFF" />}

        {driverLocation && rotationAnim && <DriverMarker coordinate={driverLocation} rotationAnim={rotationAnim} isMoving={true} />}
      </MapView>
    </View>
  );
}
