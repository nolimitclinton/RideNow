import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// Map is handled by `RouteMap` component
import * as Location from "expo-location";
import { useNavigation, DrawerActions, useRoute } from "@react-navigation/native";
import SmallButton from "../components/buttons/SmallButton";
import { useTheme } from "../store/ThemeProvider";
import { DARK_MAP_STYLE, LIGHT_MAP_STYLE } from "../constants/mapStyles";
import { db, auth } from "../services/firebase";
import { useAuth } from "../store/AuthProvider";
import { collection, addDoc } from "firebase/firestore";
import { updateDoc, doc } from "firebase/firestore";
import { calculateBearing, normalizeAngle, getShortestRotation } from "../utils/rotation";
import RouteMap from "../components/RouteMap";
import LocationCards from "../components/LocationCards";
import RideControls from "../components/RideControls";
import MapView from "react-native-maps";
import PaymentModal from "../components/PaymentModal";
import RatingModal from "../components/RatingModal";
// Constants
const PRICE_PER_KM = 500; // ₦ per km
const DRIVER_SEARCH_DURATION = 2000; // 2 seconds
const DRIVER_ANIMATION_STEP = 300; // ms between each route step

type LatLng = { latitude: number; longitude: number };

// (Rotation utilities have been moved to `src/utils/rotation.ts`)

export default function HomeScreen() {
  const { theme, themeMode } = useTheme();
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { user } = useAuth();

  // Location state
  const [location, setLocation] = useState<LatLng | null>(null);
  const [locationName, setLocationName] = useState<string>("");
  const [destinationMarker, setDestinationMarker] = useState<LatLng | null>(null);
  const [destinationName, setDestinationName] = useState<string>("");

  // Route state
  const [routeCoords, setRouteCoords] = useState<LatLng[]>([]);
  const [routeDistanceKm, setRouteDistanceKm] = useState<number | null>(null);
  const [priceEstimate, setPriceEstimate] = useState<number | null>(null);

  // Driver state
  const [isSearchingDriver, setIsSearchingDriver] = useState(false);
  const [driverLocation, setDriverLocation] = useState<LatLng | null>(null);
  const [isDriverMoving, setIsDriverMoving] = useState(false);
  const [rideCompleted, setRideCompleted] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const [selectedCar, setSelectedCar] = useState<string | null>(null);

  // Payment & rating state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [completedDriveId, setCompletedDriveId] = useState<string | null>(null);

  // Animation refs
  const mapRef = useRef<MapView | null>(null);
  const rotationAnim = useRef(new Animated.Value(0)).current;
  const lastRotationRef = useRef<number>(0);

  // Fetch route from OSRM
  const getRouteFromOSRM = async (
    start: LatLng,
    end: LatLng
  ): Promise<{ coords: LatLng[]; distanceKm: number }> => {
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?overview=full&geometries=geojson`;
      const response = await fetch(url);
      const data = await response.json();

      if (!data.routes?.[0]) {
        return { coords: [], distanceKm: 0 };
      }

      const route = data.routes[0];
      const distanceKm = (route.distance ?? 0) / 1000;
      const coords: LatLng[] = route.geometry.coordinates.map(
        ([lng, lat]: [number, number]) => ({ latitude: lat, longitude: lng })
      );

      return { coords, distanceKm };
    } catch (error) {
      console.error("OSRM route error:", error);
      return { coords: [], distanceKm: 0 };
    }
  };

  // Animate driver along the route
  const animateDriver = useCallback(async (coords: LatLng[]) => {
    let currentIndex = 0;

    while (currentIndex < coords.length - 1) {
      const currentCoord = coords[currentIndex];
      const nextCoord = coords[currentIndex + 1];

      const bearing = calculateBearing(currentCoord, nextCoord);
      const from = lastRotationRef.current;
      const target = getShortestRotation(from, bearing);

      Animated.timing(rotationAnim, {
        toValue: target,
        duration: DRIVER_ANIMATION_STEP,
        useNativeDriver: true,
      }).start(() => {
        // Keep the raw target (not normalized) so the rotation value remains
        // continuous across animations and subsequent diffs use the shortest path.
        lastRotationRef.current = target;
      });

      setDriverLocation(currentCoord);
      currentIndex++;
      await new Promise((resolve) => setTimeout(resolve, DRIVER_ANIMATION_STEP));
    }

    // Reached destination -> show payment modal so user can pay before saving drive
    setIsDriverMoving(false);
    // show payment flow instead of immediately saving
    setShowPaymentModal(true);
  }, [rotationAnim]);

  // Save completed drive to Firestore
  const saveCompletedDrive = async (payment?: { amount: number; method?: string; paidAt?: Date }, rating?: { score: number; comment?: string }) => {
    try {
      const driverNames = ["Ngozi Okafor", "Chinedu Obi", "Amaka Umeh", "Femi Adewale", "Bola Hassan"];
      const carNames = ["Toyota Corolla", "Honda Civic", "Ford Fiesta", "Chevrolet Spark", "Hyundai Accent"];
      // Use previously selected driver/car if available, otherwise randomize
      const randomDriver = selectedDriver ?? driverNames[Math.floor(Math.random() * driverNames.length)];
      const randomCar = selectedCar ?? carNames[Math.floor(Math.random() * carNames.length)];
      const distanceKm = routeDistanceKm ?? 0;
      const price = distanceKm > 0 ? Math.round(distanceKm * PRICE_PER_KM) : null;

      const docRef = await addDoc(collection(db, "completed_drives"), {
        userId: user?.uid ?? auth.currentUser?.uid ?? null,
        origin: location,
        originName: locationName || "Unknown Origin",
        destination: destinationMarker,
        destinationName: destinationName || "Unknown Destination",
        driverName: randomDriver,
        carName: randomCar,
        distanceKm,
        pricePerKm: PRICE_PER_KM,
        price,
        payment: payment ?? null,
        rating: rating ?? null,
        completedAt: new Date(),
      });

      setCompletedDriveId(docRef.id);
      console.log("Drive saved to Firestore", docRef.id);
      return docRef.id;
    } catch (error) {
      console.error("Error saving drive:", error);
    }
  };

  // Find driver and start ride
  const findDriver = async () => {
    if (isSearchingDriver || isDriverMoving) return;
    if (!location || routeCoords.length === 0) {
      Alert.alert("No route", "Please choose a pickup and destination first.");
      return;
    }

    setIsSearchingDriver(true);
    await new Promise((resolve) => setTimeout(resolve, DRIVER_SEARCH_DURATION));

    // Initialize driver location and rotation
    if (routeCoords.length > 1) {
      const initialBearing = calculateBearing(location, routeCoords[1]);
      const normalizedBearing = normalizeAngle(initialBearing);
      rotationAnim.setValue(normalizedBearing);
      lastRotationRef.current = normalizedBearing;
    } else {
      rotationAnim.setValue(0);
      lastRotationRef.current = 0;
    }

    setDriverLocation(location);
    setIsSearchingDriver(false);
    setIsDriverMoving(true);

    // pick a random driver/car and store for later
    const driverNames = ["Ngozi Okafor", "Chinedu Obi", "Amaka Umeh", "Femi Adewale", "Bola Hassan"];
    const carNames = ["Toyota Corolla", "Honda Civic", "Ford Fiesta", "Chevrolet Spark", "Hyundai Accent"];
    const randomDriver = driverNames[Math.floor(Math.random() * driverNames.length)];
    const randomCar = carNames[Math.floor(Math.random() * carNames.length)];
    setSelectedDriver(randomDriver);
    setSelectedCar(randomCar);

    animateDriver(routeCoords);
  };

  // Reset ride to initial state
  const resetRide = () => {
    setRideCompleted(false);
    setDestinationMarker(null);
    setDestinationName("");
    setRouteCoords([]);
    setRouteDistanceKm(null);
    setPriceEstimate(null);
    setDriverLocation(null);
    rotationAnim.setValue(0);
    lastRotationRef.current = 0;
    setSelectedDriver(null);
    setSelectedCar(null);
    setShowPaymentModal(false);
    setShowRatingModal(false);
    setCompletedDriveId(null);
  };

  // Navigate to AddressInput screen
  const openAddressInput = () => {
    const initialOrigin = location
      ? { latitude: location.latitude, longitude: location.longitude, name: locationName || "Current Location" }
      : null;

    const initialDestination = destinationMarker
      ? { latitude: destinationMarker.latitude, longitude: destinationMarker.longitude, name: destinationName || "Destination" }
      : null;

    (navigation as any).navigate("AddressInput", { initialOrigin, initialDestination });
  };

  // Fit map to show both origin and destination
  const fitMapToRoute = useCallback((origin: LatLng, destination: LatLng) => {
    if (!mapRef.current) return;

    const midLat = (origin.latitude + destination.latitude) / 2;
    const midLng = (origin.longitude + destination.longitude) / 2;

    const latSpan = Math.abs(origin.latitude - destination.latitude) || 0.01;
    const lngSpan = Math.abs(origin.longitude - destination.longitude) || 0.01;

    const MAX_DELTA = 0.5;
    const MIN_DELTA = 0.01;

    const latDelta = Math.min(Math.max(latSpan * 2, MIN_DELTA), MAX_DELTA);
    const lngDelta = Math.min(Math.max(lngSpan * 2, MIN_DELTA), MAX_DELTA);

    setTimeout(() => {
      mapRef.current?.animateToRegion(
        { latitude: midLat, longitude: midLng, latitudeDelta: latDelta, longitudeDelta: lngDelta },
        800
      );
    }, 300);
  }, []);

  // Handle route params from AddressInput screen
  useEffect(() => {
    const params = route.params || {};
    const { selectedOrigin, selectedDestination } = params;

    if (!selectedOrigin && !selectedDestination) return;

    if (selectedOrigin) {
      setLocation({ latitude: selectedOrigin.latitude, longitude: selectedOrigin.longitude });
      setLocationName(selectedOrigin.name || "");
    }

    if (selectedDestination) {
      setDestinationMarker({ latitude: selectedDestination.latitude, longitude: selectedDestination.longitude });
      setDestinationName(selectedDestination.name || "");
    }

    if (selectedOrigin && selectedDestination) {
      (async () => {
        const { coords, distanceKm } = await getRouteFromOSRM(
          { latitude: selectedOrigin.latitude, longitude: selectedOrigin.longitude },
          { latitude: selectedDestination.latitude, longitude: selectedDestination.longitude }
        );

        setRouteCoords(coords);
        setRouteDistanceKm(distanceKm);
        setPriceEstimate(distanceKm > 0 ? Math.round(distanceKm * PRICE_PER_KM) : null);

        fitMapToRoute(selectedOrigin, selectedDestination);
      })();
    }

    const timer = setTimeout(() => {
      try {
        (navigation as any).setParams({ selectedOrigin: undefined, selectedDestination: undefined });
      } catch {}
    }, 100);

    return () => clearTimeout(timer);
  }, [route.params?.selectedOrigin, route.params?.selectedDestination, fitMapToRoute]);

  // Payment handlers
  const handlePay = async () => {
    if (paymentProcessing) return;
    setPaymentProcessing(true);
    // Simulate payment delay
    await new Promise((r) => setTimeout(r, 1400));
    setPaymentProcessing(false);
    setShowPaymentModal(false);

    // call save and open rating
    const price = routeDistanceKm ? Math.round(routeDistanceKm * PRICE_PER_KM) : 0;
    const payment = { amount: price, method: "simulated_card", paidAt: new Date() };
    const id = await saveCompletedDrive(payment);
    setShowRatingModal(true);
    setRideCompleted(true);
  };

  const handlePaymentCancel = () => {
    // allow user to pay later; keep ride completed state true
    setShowPaymentModal(false);
    setRideCompleted(true);
  };

  const handleSubmitRating = async (score: number, comment?: string) => {
    setShowRatingModal(false);
    if (!completedDriveId) return;
    try {
      const ref = doc(db, "completed_drives", completedDriveId);
      await updateDoc(ref, { rating: { score, comment, at: new Date() } });
      console.log("Rating saved");
    } catch (err) {
      console.error("Error saving rating", err);
    }
  };

  // Initialize location on mount
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied", "Location access is required.");
        return;
      }

      const cachedLocation = await Location.getLastKnownPositionAsync();
      const coords = cachedLocation
        ? cachedLocation.coords
        : (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })).coords;

      const center = { latitude: coords.latitude, longitude: coords.longitude };
      setLocation(center);

      mapRef.current?.animateCamera({ center, zoom: 15, heading: 0, pitch: 0 }, { duration: 1000 });

      const address = await Location.reverseGeocodeAsync(center);
      if (address.length > 0) {
        const place = address[0];
        setLocationName(place.name || place.street || place.city || "Current Location");
      }
    })();
  }, []);

  if (!location) {
    return (
      <View style={[styles.loaderContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>Getting Location...</Text>
      </View>
    );
  }

  // Interpolate rotation to support continuous angles (can be negative or >360)
  const currentRotation = rotationAnim.interpolate({
    inputRange: [-360, 0, 360],
    outputRange: ["-360deg", "0deg", "360deg"],
    extrapolate: "extend",
  });

  return (
    <SafeAreaView edges={["top"]} style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.topHeader, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <View style={styles.overlayButton}>
          <SmallButton onPress={() => navigation.dispatch(DrawerActions.openDrawer())} icon="Menu" />
        </View>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>RideNow</Text>
      </View>

      {/* Location Cards */}
      {isDriverMoving ? null :<LocationCards onPress={openAddressInput} locationName={locationName} destinationName={destinationName} theme={theme} />}
      {/* Map */}
      <RouteMap
        mapRef={mapRef}
        location={location}
        locationName={locationName}
        destinationMarker={destinationMarker}
        destinationName={destinationName}
        routeCoords={routeCoords}
        driverLocation={driverLocation}
        rotationAnim={rotationAnim}
        themeMode={themeMode}
        DARK_MAP_STYLE={DARK_MAP_STYLE}
        LIGHT_MAP_STYLE={LIGHT_MAP_STYLE}
      />

      {/* Payment & Rating modals */}
      <PaymentModal
        visible={showPaymentModal}
        amount={routeDistanceKm ? Math.round(routeDistanceKm * PRICE_PER_KM) : 0}
        driverName={selectedDriver}
        driverCar={selectedCar}
        processing={paymentProcessing}
        onPay={handlePay}
        onCancel={handlePaymentCancel}
      />

      <RatingModal visible={showRatingModal} onSubmit={handleSubmitRating} onClose={() => setShowRatingModal(false)} />

      <RideControls
        routeDistanceKm={routeDistanceKm}
        priceEstimate={priceEstimate}
        isSearchingDriver={isSearchingDriver}
        isDriverMoving={isDriverMoving}
        rideCompleted={rideCompleted}
        onConfirm={findDriver}
        onReset={resetRide}
        theme={theme}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, fontSize: 16 },
  overlayButton: { marginLeft: 4 },
  topHeader: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1 },
  headerTitle: { fontSize: 18, fontWeight: "600", marginLeft: 12 },
  locationCardsContainer: { paddingHorizontal: 12, paddingVertical: 12, borderBottomWidth: 1, gap: 12 },
  locationCard: { flexDirection: "row", alignItems: "center", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1 },
  locationDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  locationSquare: { width: 10, height: 10, borderWidth: 2, marginRight: 12 },
  locationTextContainer: { flex: 1 },
  bottomActions: { padding: 16, borderTopWidth: 1, borderTopColor: "#e0e0e0" },
});