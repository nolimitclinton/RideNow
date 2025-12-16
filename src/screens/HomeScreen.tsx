import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";
import { useNavigation, DrawerActions, useRoute } from "@react-navigation/native";
import SmallButton from "../components/buttons/SmallButton";
import { useTheme } from "../store/ThemeProvider";
import { DARK_MAP_STYLE, LIGHT_MAP_STYLE } from "../constants/mapStyles";
import { db, auth } from "../services/firebase";
import { useAuth } from "../store/AuthProvider";
import {
  collection,
  addDoc,
  updateDoc,
  doc as fsDoc,
} from "firebase/firestore";
import {
  calculateBearing,
  normalizeAngle,
  getShortestRotation,
} from "../utils/rotation";
import RouteMap from "../components/RouteMap";
import LocationCards from "../components/LocationCards";
import RideControls from "../components/RideControls";
import MapView from "react-native-maps";
import PaymentModal from "../components/PaymentModal";
import RatingModal from "../components/RatingModal";
import DriverOfferModal from "../components/DriverOfferModal";
import { DeviceEventEmitter } from "react-native";

// Constants
const PRICE_PER_KM = 500; // ₦ per km
const DRIVER_SEARCH_DURATION = 5000; // 5 seconds
const DRIVER_ANIMATION_STEP = 300; // ms between each route step

type LatLng = { latitude: number; longitude: number };

export default function HomeScreen() {
  const { theme, themeMode } = useTheme();
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { user } = useAuth();

  // Pricing helpers

  const formatNaira = (amount: number) =>
    `₦${Math.round(amount).toLocaleString("en-NG")}`;

  const getFareRange = (baseFare: number) => {
    const variance = 0.12; 
    const min = baseFare * (1 - variance);
    const max = baseFare * (1 + variance);
    return { min, max };
  };

  const pickRandomFareInRange = (min: number, max: number) => {
    const raw = min + Math.random() * (max - min);
    return Math.round(raw / 50) * 50;
  };

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

  // Offer details
  const [selectedCarYear, setSelectedCarYear] = useState<number | null>(null);
  const [selectedPlateNumber, setSelectedPlateNumber] = useState<string | null>(null);

  // Offer modal flow
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [loadingAnotherDriver, setLoadingAnotherDriver] = useState(false);

  // Payment & rating state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [completedDriveId, setCompletedDriveId] = useState<string | null>(null);

  const [finalFare, setFinalFare] = useState<number | null>(null);

  // Animation refs
  const mapRef = useRef<MapView | null>(null);
  const rotationAnim = useRef(new Animated.Value(0)).current;
  const lastRotationRef = useRef<number>(0);

  // Helpers: year + plate

  const randomCarYear = () => {
    const years = [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024];
    return years[Math.floor(Math.random() * years.length)];
  };

  const randomPlate = () => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const randL = () => letters[Math.floor(Math.random() * letters.length)];
    const randN = () => Math.floor(Math.random() * 10);
    return `${randL()}${randL()}${randL()}-${randN()}${randN()}${randN()}${randL()}${randL()}`;
  };

  const generateDriverOffer = () => {
    const driverNames = ["Ngozi Okafor", "Chinedu Obi", "Amaka Umeh", "Femi Adewale", "Bola Hassan"];
    const carNames = ["Toyota Corolla", "Honda Civic", "Ford Fiesta", "Chevrolet Spark", "Hyundai Accent"];

    const driverName = driverNames[Math.floor(Math.random() * driverNames.length)];
    const carName = carNames[Math.floor(Math.random() * carNames.length)];
    const carYear = randomCarYear();
    const plate = randomPlate();

    setSelectedDriver(driverName);
    setSelectedCar(carName);
    setSelectedCarYear(carYear);
    setSelectedPlateNumber(plate);
  };

  // Base fare + range 

  const baseFare = useMemo(() => {
    if (routeDistanceKm != null) return routeDistanceKm * PRICE_PER_KM;
    if (priceEstimate != null) return priceEstimate;
    return 0;
  }, [routeDistanceKm, priceEstimate]);

  const fareRange = useMemo(() => {
    if (!baseFare || baseFare <= 0) return { min: 0, max: 0 };
    return getFareRange(baseFare);
  }, [baseFare]);

  const fareMin = fareRange.min;
  const fareMax = fareRange.max;

  const computedFareForPayment = finalFare ?? baseFare;

  // Fetch route from OSRM

  const getRouteFromOSRM = async (
    start: LatLng,
    end: LatLng
  ): Promise<{ coords: LatLng[]; distanceKm: number }> => {
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?overview=full&geometries=geojson`;
      const response = await fetch(url);
      const data = await response.json();

      if (!data.routes?.[0]) return { coords: [], distanceKm: 0 };

      const r = data.routes[0];
      const distanceKm = (r.distance ?? 0) / 1000;

      const coords: LatLng[] = r.geometry.coordinates.map(
        ([lng, lat]: [number, number]) => ({ latitude: lat, longitude: lng })
      );

      return { coords, distanceKm };
    } catch (error) {
      console.error("OSRM route error:", error);
      return { coords: [], distanceKm: 0 };
    }
  };
  // Animate driver along the route

  const animateDriver = useCallback(
    async (coords: LatLng[]) => {
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
          lastRotationRef.current = target;
        });

        setDriverLocation(currentCoord);
        currentIndex++;
        await new Promise((resolve) => setTimeout(resolve, DRIVER_ANIMATION_STEP));
      }

      // Arrived -> payment modal (we save AFTER payment)
      setIsDriverMoving(false);
      setShowPaymentModal(true);
    },
    [rotationAnim]
  );
  // Save completed drive to Firestore

  const saveCompletedDrive = async (payment?: {
    amount: number;
    method?: string;
    paidAt?: Date;
  }) => {
    try {
      const distanceKm = routeDistanceKm ?? 0;
      const price =
        (finalFare != null ? Math.round(finalFare) : distanceKm > 0 ? Math.round(distanceKm * PRICE_PER_KM) : null);

      const uid = user?.uid ?? auth.currentUser?.uid ?? null;

      const docRef = await addDoc(collection(db, "completed_drives"), {
        userId: uid,
        origin: location,
        originName: locationName || "Unknown Origin",
        destination: destinationMarker,
        destinationName: destinationName || "Unknown Destination",

        driverName: selectedDriver ?? null,
        carName: selectedCar ?? null,
        carYear: selectedCarYear ?? null,
        plateNumber: selectedPlateNumber ?? null,

        distanceKm,
        pricePerKm: PRICE_PER_KM,
        price,
        fareMin: fareMin ? Math.round(fareMin) : null,
        fareMax: fareMax ? Math.round(fareMax) : null,
        finalFare: finalFare != null ? Math.round(finalFare) : null,

        payment: payment ?? null,

        ratingScore: null,
        ratingComment: null,
        ratedAt: null,

        completedAt: new Date(),
      });

      setCompletedDriveId(docRef.id);
      DeviceEventEmitter.emit("driveCompleted");
      return docRef.id;
    } catch (error) {
      console.error("Error saving drive:", error);
      return null;
    }
  };

  // Find driver 
  
  const findDriver = async () => {
    if (isSearchingDriver || isDriverMoving) return;
    if (!location || routeCoords.length === 0) {
      Alert.alert("No route", "Please choose a pickup and destination first.");
      return;
    }

    setIsSearchingDriver(true);
    await new Promise((resolve) => setTimeout(resolve, DRIVER_SEARCH_DURATION));
    setIsSearchingDriver(false);
    setFinalFare(null);

    generateDriverOffer();
    setLoadingAnotherDriver(false);
    setShowOfferModal(true);
  };

  // Accept offer -> lock fare + start simulation
  
  const handleAcceptOffer = () => {
    if (!location || routeCoords.length === 0) return;

    // Lock a final fare within the range (if baseFare exists)
    if (baseFare > 0 && fareMin > 0 && fareMax > 0) {
      const locked = pickRandomFareInRange(fareMin, fareMax);
      setFinalFare(locked);
    } else {
      setFinalFare(null);
    }

    // Init driver location & rotation
    setDriverLocation(location);

    if (routeCoords.length > 1) {
      const initialBearing = calculateBearing(location, routeCoords[1]);
      const normalized = normalizeAngle(initialBearing);
      rotationAnim.setValue(normalized);
      lastRotationRef.current = normalized;
    } else {
      rotationAnim.setValue(0);
      lastRotationRef.current = 0;
    }

    setShowOfferModal(false);
    setIsDriverMoving(true);
    animateDriver(routeCoords);
  };

  // Reject offer -> show another offer
  const handleRejectOffer = async () => {
    setLoadingAnotherDriver(true);
    await new Promise((r) => setTimeout(r, 900));
    generateDriverOffer();
    setLoadingAnotherDriver(false);
  };
  // Reset ride

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
    setSelectedCarYear(null);
    setSelectedPlateNumber(null);

    setShowOfferModal(false);
    setLoadingAnotherDriver(false);

    setShowPaymentModal(false);
    setShowRatingModal(false);
    setCompletedDriveId(null);
    setFinalFare(null);
  };

  // Navigate to AddressInput screen
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
        {
          latitude: midLat,
          longitude: midLng,
          latitudeDelta: latDelta,
          longitudeDelta: lngDelta,
        },
        800
      );
    }, 300);
  }, []);

  // Handle route params
  useEffect(() => {
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

        // Keep this if you still want it — but range uses baseFare anyway
        setPriceEstimate(distanceKm > 0 ? Math.round(distanceKm * PRICE_PER_KM) : null);

        // New trip => clear locked fare
        setFinalFare(null);

        fitMapToRoute(selectedOrigin, selectedDestination);
      })();
    }

    const timer = setTimeout(() => {
      try {
        (navigation as any).setParams({
          selectedOrigin: undefined,
          selectedDestination: undefined,
        });
      } catch {}
    }, 100);

    return () => clearTimeout(timer);
  }, [route.params?.selectedOrigin, route.params?.selectedDestination, fitMapToRoute]);

  // Payment handlers
  const handlePay = async () => {
    if (paymentProcessing) return;
    setPaymentProcessing(true);

    await new Promise((r) => setTimeout(r, 1400)); 

    setPaymentProcessing(false);
    setShowPaymentModal(false);

    const amountToCharge = finalFare ?? (routeDistanceKm ? Math.round(routeDistanceKm * PRICE_PER_KM) : 0);

    const payment = {
      amount: amountToCharge,
      method: "simulated_card",
      paidAt: new Date(),
    };

    const id = await saveCompletedDrive(payment);

    setRideCompleted(true);
    if (id) setShowRatingModal(true);
  };

  const handlePaymentCancel = () => {
    setShowPaymentModal(false);
    setRideCompleted(true);
  };

  // Rating handler
  const handleSubmitRating = async (score: number, comment?: string) => {
    setShowRatingModal(false);

    if (!completedDriveId) return;

    try {
      const ref = fsDoc(db, "completed_drives", completedDriveId);
      await updateDoc(ref, {
        ratingScore: score,
        ratingComment: comment?.trim() || null,
        ratedAt: new Date(),
      });
      DeviceEventEmitter.emit("driveCompleted");
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

      const cached = await Location.getLastKnownPositionAsync();
      const coords = cached
        ? cached.coords
        : (
            await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
            })
          ).coords;

      const center = { latitude: coords.latitude, longitude: coords.longitude };
      setLocation(center);

      mapRef.current?.animateCamera(
        { center, zoom: 15, heading: 0, pitch: 0 },
        { duration: 1000 }
      );

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
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>
          Getting Location...
        </Text>
      </View>
    );
  }

  // rotation (RouteMap uses this)
  const currentRotation = rotationAnim.interpolate({
    inputRange: [-360, 0, 360],
    outputRange: ["-360deg", "0deg", "360deg"],
    extrapolate: "extend",
  });

  return (
    <SafeAreaView
      edges={["top"]}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Header */}
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

      {/* Location Cards */}
      {isDriverMoving ? null : (
        <LocationCards
          onPress={openAddressInput}
          locationName={locationName}
          destinationName={destinationName}
          theme={theme}
        />
      )}

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

      {/* Driver Offer Modal */}
      <DriverOfferModal
        visible={showOfferModal}
        loadingAnother={loadingAnotherDriver}
        onAccept={handleAcceptOffer}
        onReject={handleRejectOffer}
        driverName={selectedDriver}
        carName={selectedCar}
        carYear={selectedCarYear}
        plateNumber={selectedPlateNumber}
        fareMin={Math.round(fareMin)}
        fareMax={Math.round(fareMax)}
      />

      {/* Payment Modal (pay locked finalFare) */}
      <PaymentModal
        visible={showPaymentModal}
        amount={computedFareForPayment}
        driverName={selectedDriver}
        driverCar={
          selectedCar
            ? `${selectedCar}${selectedCarYear ? ` • ${selectedCarYear}` : ""}${
                selectedPlateNumber ? ` • ${selectedPlateNumber}` : ""
              }`
            : null
        }
        processing={paymentProcessing}
        onPay={handlePay}
        onCancel={handlePaymentCancel}
      />

      {/* Rating Modal */}
      <RatingModal
        visible={showRatingModal}
        onSubmit={handleSubmitRating}
        onClose={() => setShowRatingModal(false)}
      />

      {/* Controls (show range until locked finalFare exists) */}
      <RideControls
        routeDistanceKm={routeDistanceKm}
        priceEstimate={priceEstimate}
        fareMin={fareMin}
        fareMax={fareMax}
        finalFare={finalFare}
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
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 18, fontWeight: "600", marginLeft: 12 },
});