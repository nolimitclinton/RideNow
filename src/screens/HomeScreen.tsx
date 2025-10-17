import React, { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  View,
  Alert,
  Text,
  ActivityIndicator,
} from "react-native";
import MapView, {
  PROVIDER_GOOGLE,
} from "react-native-maps";
import * as Location from "expo-location";

interface Coord {
  latitude: number;
  longitude: number;
}

export default function HomeScreen() {
  const [location, setLocation] = useState<Coord | null>(null);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied", "Location access is required.");
        return;
      }

      const lastKnown = await Location.getLastKnownPositionAsync();
      if (lastKnown) {
        const cachedCoords = {
          latitude: lastKnown.coords.latitude,
          longitude: lastKnown.coords.longitude,
        };
        setLocation(cachedCoords);
        mapRef.current?.animateCamera({ center: cachedCoords, zoom: 30 });
      }

      // Fetch a more accurate, fresh location in background
      const fresh = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const coords = {
        latitude: fresh.coords.latitude,
        longitude: fresh.coords.longitude,
      };
      setLocation(coords);

      // animate camera to the new location
      mapRef.current?.animateCamera({ center: coords });
    })();
  }, []);

  //Show loader until we have any location
  if (!location) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Getting Location...</Text>
      </View>
    );
  }

  // ✅ Render the map once we have a location
  return (
    <MapView
      ref={mapRef}
      provider={PROVIDER_GOOGLE}
      style={styles.map}
      initialRegion={{
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }}
      region={{
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }}
      showsUserLocation={true}
      showsMyLocationButton={true}
    />
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#333",
  },
  map: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
});
