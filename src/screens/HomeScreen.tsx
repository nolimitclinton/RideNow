import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { PROVIDER_GOOGLE, Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";
import { useNavigation, DrawerActions, useRoute } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import SmallButton from "../components/buttons/SmallButton";
import { useTheme } from "../store/ThemeProvider";
import { DARK_MAP_STYLE, LIGHT_MAP_STYLE } from "../constants/mapStyles";
import "react-native-get-random-values";
import LongButton from "../components/buttons/LongButton";
import { db } from "../services/firebase";
import { useAuth } from "../store/AuthProvider";
import { auth } from '../services/firebase';
import { collection, addDoc } from "firebase/firestore";

const GOOGLE_API_KEY = "AIzaSyC3B1BNTq8re47QL2ltM5zdZYujKIX4tKs";
const DEFAULT_CAR_IMAGE = "https://cdn-icons-png.flaticon.com/512/743/743922.png";


// ₦ per km
const PRICE_PER_KM = 500;

type LatLng = { latitude: number; longitude: number };

export default function HomeScreen() {
  const { theme, themeMode } = useTheme();
  const route = useRoute<any>();
  const navigation = useNavigation();
  const [location, setLocation] = useState<LatLng | null>(null);
  const [locationName, setLocationName] = useState<string>("");
  const [destinationMarker, setDestinationMarker] = useState<LatLng | null>(null);
  const [destinationName, setDestinationName] = useState<string>("");
  const [routeCoords, setRouteCoords] = useState<LatLng[]>([]);
  const [routeDistanceKm, setRouteDistanceKm] = useState<number | null>(null);
  const [priceEstimate, setPriceEstimate] = useState<number | null>(null);

  const [isSearchingDriver, setIsSearchingDriver] = useState(false);
  const [driverLocation, setDriverLocation] = useState<LatLng | null>(null);
  const [isDriverMoving, setIsDriverMoving] = useState(false);
  const [rideCompleted, setRideCompleted] = useState(false);

  const mapRef = useRef<MapView | null>(null);
  const { user } = useAuth();
  const findDriver = async () => {
    if (isSearchingDriver || isDriverMoving) return;
    if (!location || routeCoords.length === 0) {
      Alert.alert("No route", "Please choose a pickup and destination first.");
      return;
    }

    setIsSearchingDriver(true);

    // Simulate “searching for driver…”
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Start driver from user location initially
    setDriverLocation(location);
    setIsSearchingDriver(false);
    setIsDriverMoving(true);

    let currentIndex = 0;
    const coordsCopy = [...routeCoords];

    const animateDriver = async () => {
      while (currentIndex < coordsCopy.length - 1) {
        setDriverLocation(coordsCopy[currentIndex]);
        currentIndex++;
        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      // Reached destination
      setIsDriverMoving(false);
      setRideCompleted(true);
      Alert.alert("Arrived!", "You have reached your destination!");

      try {
        const driverNames = [
          "Ngozi Okafor",
          "Chinedu Obi",
          "Amaka Umeh",
          "Femi Adewale",
          "Bola Hassan",
        ];
        const carNames = [
          "Toyota Corolla",
          "Honda Civic",
          "Ford Fiesta",
          "Chevrolet Spark",
          "Hyundai Accent",
        ];
        const randomDriver =
          driverNames[Math.floor(Math.random() * driverNames.length)];
        const randomCar =
          carNames[Math.floor(Math.random() * carNames.length)];

        const distanceKm = routeDistanceKm ?? 0;
        const price =
          distanceKm > 0 ? Math.round(distanceKm * PRICE_PER_KM) : null;

        const currentUser = auth.currentUser;
        const userId = user?.uid ?? currentUser?.uid ?? null;

        await addDoc(collection(db, "completed_drives"), {
         userId, 
          origin: location,
          originName: locationName || "Unknown Origin",
          destination: destinationMarker,
          destinationName: destinationName || "Unknown Destination",
          driverName: randomDriver,
          carName: randomCar,
          distanceKm,
          pricePerKm: PRICE_PER_KM,
          price,
          completedAt: new Date(),
        });
        console.log("Drive saved to Firestore with price + distance");
      } catch (error) {
        console.error("Error saving drive:", error);
      }
    };

    animateDriver();
  };

  const resetRide = () => {
    setRideCompleted(false);
    setDestinationMarker(null);
    setDestinationName("");
    setRouteCoords([]);
    setRouteDistanceKm(null);
    setPriceEstimate(null);
    setDriverLocation(null);
  };

  // Get route from OSRM between two points
  const getRouteFromOSRM = async (
    start: LatLng,
    end: LatLng
  ): Promise<{ coords: LatLng[]; distanceKm: number }> => {
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?overview=full&geometries=geojson`
      );
      const data = await response.json();

      if (!data.routes || !data.routes[0]) {
        return { coords: [], distanceKm: 0 };
      }

      const route = data.routes[0];
      const distanceMeters = route.distance ?? 0;
      const distanceKm = distanceMeters / 1000;

      const coords: LatLng[] = route.geometry.coordinates.map(
        ([lng, lat]: [number, number]) => ({
          latitude: lat,
          longitude: lng,
        })
      );

      return { coords, distanceKm };
    } catch (error) {
      console.error("OSRM route error:", error);
      return { coords: [], distanceKm: 0 };
    }
  };

  // Navigate to AddressInput screen with current locations
  const openAddressInput = () => {
    const initialOrigin = location
      ? {
          latitude: location.latitude,
          longitude: location.longitude,
          name: locationName || "Current Location",
        }
      : null;

    const initialDestination = destinationMarker
      ? {
          latitude: destinationMarker.latitude,
          longitude: destinationMarker.longitude,
          name: destinationName || "Destination",
        }
      : null;

    (navigation as any).navigate("AddressInput", {
      initialOrigin,
      initialDestination,
    });
  };

  useEffect(() => {
    // Handle returned data from AddressInput screen
    const params = route.params || {};
    const { selectedOrigin, selectedDestination } = params;

    if (!selectedOrigin && !selectedDestination) return;

    if (selectedOrigin) {
      setLocation({
        latitude: selectedOrigin.latitude,
        longitude: selectedOrigin.longitude,
      });
      setLocationName(selectedOrigin.name || "");
    }

    if (selectedDestination) {
      setDestinationMarker({
        latitude: selectedDestination.latitude,
        longitude: selectedDestination.longitude,
      });
      setDestinationName(selectedDestination.name || "");
    }

    // Compute route if both origin and destination are set
    if (selectedOrigin && selectedDestination) {
      (async () => {
        const { coords, distanceKm } = await getRouteFromOSRM(
          {
            latitude: selectedOrigin.latitude,
            longitude: selectedOrigin.longitude,
          },
          {
            latitude: selectedDestination.latitude,
            longitude: selectedDestination.longitude,
          }
        );
        setRouteCoords(coords);
        setRouteDistanceKm(distanceKm);

        if (distanceKm > 0) {
          setPriceEstimate(Math.round(distanceKm * PRICE_PER_KM));
        } else {
          setPriceEstimate(null);
        }

        // Instead of fitToCoordinates → animateToRegion with clamped deltas
      if (mapRef.current) {
        const origin = selectedOrigin;
        const dest = selectedDestination;

        const midLat = (origin.latitude + dest.latitude) / 2;
        const midLng = (origin.longitude + dest.longitude) / 2;

        const latSpan = Math.abs(origin.latitude - dest.latitude) || 0.01;
        const lngSpan = Math.abs(origin.longitude - dest.longitude) || 0.01;

        // how “wide” the camera is allowed to be
        const MAX_DELTA = 0.5;  // tweak: ~city scale
        const MIN_DELTA = 0.01; // tweak: not too close

        let latDelta = latSpan * 2;
        let lngDelta = lngSpan * 2;

        latDelta = Math.min(Math.max(latDelta, MIN_DELTA), MAX_DELTA);
        lngDelta = Math.min(Math.max(lngDelta, MIN_DELTA), MAX_DELTA);

        setTimeout(() => {
          mapRef.current?.animateToRegion(
            {
              latitude: midLat,
              longitude: midLng,
              latitudeDelta: latDelta,
              longitudeDelta: lngDelta,
            },
            800
          );
        }, 300);
      }
    })();
  }

    // Clear params after processing
    const timer = setTimeout(() => {
      try {
        (navigation as any).setParams({
          selectedOrigin: undefined,
          selectedDestination: undefined,
        });
      } catch {}
    }, 100);

    return () => clearTimeout(timer);
  }, [route.params?.selectedOrigin, route.params?.selectedDestination]);

  useEffect(() => {
    // Get initial location on mount
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied", "Location access is required.");
        return;
      }

      let coords;
      const cachedLocation = await Location.getLastKnownPositionAsync();
      if (cachedLocation) {
        coords = cachedLocation.coords;
      } else {
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        coords = currentLocation.coords;
      }

      const center = {
        latitude: coords.latitude,
        longitude: coords.longitude,
      };

      setLocation(center);

      mapRef.current?.animateCamera(
        {
          center,
          zoom: 15,
          heading: 0,
          pitch: 0,
        },
        { duration: 1000 }
      );

      const address = await Location.reverseGeocodeAsync(center);

      if (address.length > 0) {
        const place = address[0];
        setLocationName(
          place.name || place.street || place.city || "Current Location"
        );
      }
    })();
  }, []);

  if (!location) {
    return (
      <View
        style={[
          styles.loaderContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text
          style={[styles.loadingText, { color: theme.colors.text }]}
        >{`Getting Location...`}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView
      edges={["top"]}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Top header */}
      <View
        style={[
          styles.topHeader,
          {
            backgroundColor: theme.colors.surface,
            borderBottomColor: theme.colors.border,
          },
        ]}
      >
        <View style={styles.overlayButton}>
          <SmallButton
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            icon="Menu"
          />
        </View>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          RideNow
        </Text>
      </View>

      {/* Location selection cards */}
      <TouchableOpacity
        style={[
          styles.locationCardsContainer,
          {
            backgroundColor: theme.colors.surface,
            borderBottomColor: theme.colors.border,
          },
        ]}
        onPress={openAddressInput}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.locationCard,
            { borderColor: theme.colors.border },
          ]}
        >
          <View
            style={[
              styles.locationDot,
              { backgroundColor: theme.colors.primary },
            ]}
          />
          <View style={styles.locationTextContainer}>
            <Text
              style={{ color: theme.colors.textSecondary, fontSize: 12 }}
            >
              Pickup
            </Text>
            <Text
              numberOfLines={1}
              style={{
                color: theme.colors.text,
                fontWeight: "600",
              }}
            >
              {locationName || "Current location"}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.locationCard,
            { borderColor: theme.colors.border },
          ]}
        >
          <View
            style={[
              styles.locationSquare,
              { borderColor: theme.colors.primary },
            ]}
          />
          <View style={styles.locationTextContainer}>
            <Text
              style={{ color: theme.colors.textSecondary, fontSize: 12 }}
            >
              Destination
            </Text>
            <Text
              numberOfLines={1}
              style={{
                color: destinationName
                  ? theme.colors.text
                  : theme.colors.textSecondary,
                fontWeight: "600",
              }}
            >
              {destinationName || "Where to?"}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Map */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={{ flex: 1 }}
        customMapStyle={
          themeMode === "dark" ? DARK_MAP_STYLE : LIGHT_MAP_STYLE
        }
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation
        showsMyLocationButton
      >
        {/* Current Location Marker */}
        <Marker
          coordinate={{
            latitude: location.latitude,
            longitude: location.longitude,
          }}
          title={locationName || "Current Location"}
          pinColor="blue"
        />

        {/* Destination Marker */}
        {destinationMarker && (
          <Marker
            coordinate={{
              latitude: destinationMarker.latitude,
              longitude: destinationMarker.longitude,
            }}
            title={destinationName || "Destination"}
            pinColor={theme.colors.primary}
          />
        )}

        {/* Route Polyline */}
        {routeCoords.length > 0 && (
          <Polyline
            coordinates={routeCoords}
            strokeWidth={4}
            strokeColor={theme.colors.primary}
          />
        )}

        {/* Driver Marker */}
        {driverLocation && (isSearchingDriver || isDriverMoving) && (
          <Marker
            coordinate={driverLocation}
            title="Driver"
            description={
              isSearchingDriver ? "Finding closest driver..." : "On the way"
            }
          >
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <Image
                source={require("../../assets/carIcon.png")}
                style={{ width: 44, height: 44 }}
                resizeMode="contain"
              />
            </View>
          </Marker>
        )}
      </MapView>

      {/* Bottom action area */}
      {routeCoords.length > 0 && !isDriverMoving && !rideCompleted && (
        <SafeAreaView
          style={[
            styles.bottomActions,
            { backgroundColor: theme.colors.surface },
          ]}
          edges={["bottom"]}
        >
          {routeDistanceKm !== null && routeDistanceKm > 0 && (
            <View style={{ marginBottom: 8 }}>
              <Text
                style={{
                  fontSize: 14,
                  color: theme.colors.textSecondary,
                  marginBottom: 2,
                }}
              >
                Estimated distance: {routeDistanceKm.toFixed(1)} km
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: theme.colors.text,
                }}
              >
                Estimated fare: ₦
                {priceEstimate ?? Math.round(routeDistanceKm * PRICE_PER_KM)}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: theme.colors.textSecondary,
                  marginTop: 2,
                }}
              >
                (₦{PRICE_PER_KM.toLocaleString()} per km)
              </Text>
            </View>
          )}

          <LongButton
            text={
              isSearchingDriver
                ? "Searching for driver..."
                : "Confirm ride & find driver"
            }
            onPress={findDriver}
          />
        </SafeAreaView>
      )}

      {rideCompleted && (
        <SafeAreaView
          style={[
            styles.bottomActions,
            { backgroundColor: theme.colors.surface },
          ]}
          edges={["bottom"]}
        >
          <LongButton text="Book Another Ride" onPress={resetRide} />
        </SafeAreaView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: { marginTop: 10, fontSize: 16 },
  overlayButton: { marginLeft: 4 },
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 18, fontWeight: "600", marginLeft: 12 },
  locationCardsContainer: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  locationCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  locationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  locationSquare: {
    width: 10,
    height: 10,
    borderWidth: 2,
    marginRight: 12,
  },
  locationTextContainer: {
    flex: 1,
  },
  bottomActions: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
});