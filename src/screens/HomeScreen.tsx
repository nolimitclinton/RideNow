import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Alert,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  Animated,
  DeviceEventEmitter,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { PROVIDER_GOOGLE, Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";
import { useNavigation, DrawerActions } from "@react-navigation/native";
import { useRoute } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import SearchBar from "../components/SearchBar";
import SmallButton from "../components/buttons/SmallButton";
import { useTheme } from "../store/ThemeProvider";
import { DARK_MAP_STYLE, LIGHT_MAP_STYLE } from "../constants/mapStyles";
import "react-native-get-random-values";
import LongButton from "../components/buttons/LongButton";
import { db } from "../services/firebase";
import { collection, addDoc } from "firebase/firestore";

const GOOGLE_API_KEY = "AIzaSyC3B1BNTq8re47QL2ltM5zdZYujKIX4tKs";
const DEFAULT_CAR_IMAGE = 'https://cdn-icons-png.flaticon.com/512/743/743922.png';

export default function HomeScreen() {
  const { theme, themeMode } = useTheme();
  const route = useRoute<any>();
  const navigation = useNavigation();
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationName, setLocationName] = useState<string>("");
  const [destinationMarker, setDestinationMarker] = useState<{ latitude: number; longitude: number } | null>(null);
  const [destinationName, setDestinationName] = useState<string>("");
  const [routeCoords, setRouteCoords] = useState<{ latitude: number; longitude: number }[]>([]);
  const [isSearchingDriver, setIsSearchingDriver] = useState(false);
  const [driverLocation, setDriverLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isDriverMoving, setIsDriverMoving] = useState(false);
  const [rideCompleted, setRideCompleted] = useState(false);
  // optional driver image url (if driver profile/photo is available)
  const [driverImageUrl, setDriverImageUrl] = useState<string | null>(null);

  const mapRef = useRef<MapView | null>(null);

  const findDriver = async () => {
    if (isSearchingDriver || isDriverMoving) return;
    
    setIsSearchingDriver(true);
    // Simulate searching for driver for 3 seconds
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Start driver at current location
    if (location) {
      setDriverLocation(location);
      setIsSearchingDriver(false);
      setIsDriverMoving(true);
      
      // Animate driver along route
      let currentIndex = 0;
      const animateDriver = async () => {
        while (currentIndex < routeCoords.length - 1) {
          setDriverLocation(routeCoords[currentIndex]);
          currentIndex++;
          await new Promise(resolve => setTimeout(resolve, 300));
        }
        // Reached destination
        setIsDriverMoving(false);
        setRideCompleted(true);
        Alert.alert("Arrived!", "You have reached your destination!");
        
        try {
          const driverNames = ["John Doe", "Jane Smith", "Mike Johnson", "Sarah Wilson", "David Brown"];
          const carNames = ["Toyota Corolla", "Honda Civic", "Ford Fiesta", "Chevrolet Spark", "Hyundai Accent"];
          const randomDriver = driverNames[Math.floor(Math.random() * driverNames.length)];
          const randomCar = carNames[Math.floor(Math.random() * carNames.length)];

          await addDoc(collection(db, 'completed_drives'), {
            origin: location,
            originName: locationName || "Unknown Origin",
            destination: destinationMarker,
            destinationName: destinationName || "Unknown Destination",
            driverName: randomDriver,
            carName: randomCar,
            completedAt: new Date(),
          });
          console.log("Drive saved to Firestore");
          DeviceEventEmitter.emit('driveCompleted');
        } catch (error) {
          console.error("Error saving drive:", error);
        }
      };
      
      animateDriver();
    }
  };

  const resetRide = () => {
    setRideCompleted(false);
    setDestinationMarker(null);
    setDestinationName("");
    setRouteCoords([]);
    setDriverLocation(null);
  };

  // Get route from OSRM between two points
  const getRouteFromOSRM = async (
    start: { latitude: number; longitude: number },
    end: { latitude: number; longitude: number }
  ): Promise<{ latitude: number; longitude: number }[]> => {
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?overview=full&geometries=geojson`
      );
      const data = await response.json();

      const coords = data.routes[0].geometry.coordinates.map(([lng, lat]: [number, number]) => ({
        latitude: lat,
        longitude: lng,
      }));

      return coords;
    } catch (error) {
      console.error("OSRM route error:", error);
      return [];
    }
  };

  // Navigate to AddressInput screen with current locations
  const openAddressInput = () => {
    const initialOrigin = location ? {
      latitude: location.latitude,
      longitude: location.longitude,
      name: locationName || "Current Location"
    } : null;

    const initialDestination = destinationMarker ? {
      latitude: destinationMarker.latitude,
      longitude: destinationMarker.longitude,
      name: destinationName || "Destination"
    } : null;

    (navigation as any).navigate('AddressInput', {
      initialOrigin,
      initialDestination
    });
  };

  useEffect(() => {
    // Handle returned data from AddressInput screen
    const params = route.params || {};
    const { selectedOrigin, selectedDestination } = params;
    
    // Only process if params exist
    if (!selectedOrigin && !selectedDestination) return;

    if (selectedOrigin) {
      setLocation({ latitude: selectedOrigin.latitude, longitude: selectedOrigin.longitude });
      setLocationName(selectedOrigin.name || "");
      mapRef.current?.animateCamera({ 
        center: { latitude: selectedOrigin.latitude, longitude: selectedOrigin.longitude }, 
        zoom: 15 
      });
    }
    
    if (selectedDestination) {
      setDestinationMarker({ latitude: selectedDestination.latitude, longitude: selectedDestination.longitude });
      setDestinationName(selectedDestination.name || "");
    }

    // Compute route if both origin and destination are set
    if (selectedOrigin && selectedDestination) {
      (async () => {
        const routeCoordsRes = await getRouteFromOSRM(
          { latitude: selectedOrigin.latitude, longitude: selectedOrigin.longitude }, 
          { latitude: selectedDestination.latitude, longitude: selectedDestination.longitude }
        );
        setRouteCoords(routeCoordsRes);
        
        // Fit map to show both markers
        if (mapRef.current && routeCoordsRes.length > 0) {
          setTimeout(() => {
            mapRef.current?.fitToCoordinates([selectedOrigin, selectedDestination], {
              edgePadding: { top: 100, right: 50, bottom: 300, left: 50 },
              animated: true,
            });
          }, 500);
        }
      })();
    }

    // Clear params after processing to prevent infinite loop
    const timer = setTimeout(() => {
      try {
        (navigation as any).setParams({ selectedOrigin: undefined, selectedDestination: undefined });
      } catch (e) {
        // ignore if setParams unavailable
      }
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
        const currentLocation = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        coords = currentLocation.coords;
      }

      setLocation({ latitude: coords.latitude, longitude: coords.longitude });

      mapRef.current?.animateCamera({
        center: {
          latitude: coords.latitude,
          longitude: coords.longitude,
        },
        zoom: 15,
        heading: 0,
        pitch: 0
      }, { duration: 1000 });

      const address = await Location.reverseGeocodeAsync({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });

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

  return (
    
    <SafeAreaView 
     edges={["top"]} 
    style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      {/* Top header */}
      <View style={[styles.topHeader, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <View style={styles.overlayButton}>
          <SmallButton
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            icon="Menu"
          />
        </View>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>{'RideNow'}</Text>
      </View>

      {/* Location selection cards */}
      <TouchableOpacity 
        style={[styles.locationCardsContainer, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}
        onPress={openAddressInput}
        activeOpacity={0.7}
      >
        <View style={[styles.locationCard, { borderColor: theme.colors.border }]}>
          <View style={[styles.locationDot, { backgroundColor: theme.colors.primary }]} />
          <View style={styles.locationTextContainer}>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Pickup</Text>
            <Text numberOfLines={1} style={{ color: theme.colors.text, fontWeight: '600' }}>
              {locationName || 'Current location'}
            </Text>
          </View>
        </View>

        <View style={[styles.locationCard, { borderColor: theme.colors.border }]}>
          <View style={[styles.locationSquare, { borderColor: theme.colors.primary }]} />
          <View style={styles.locationTextContainer}>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Destination</Text>
            <Text numberOfLines={1} style={{ color: destinationName ? theme.colors.text : theme.colors.textSecondary, fontWeight: '600' }}>
              {destinationName || 'Where to?'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Map */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={{ flex: 1 }}
        customMapStyle={themeMode === 'dark' ? DARK_MAP_STYLE : LIGHT_MAP_STYLE}
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
          coordinate={{ latitude: location.latitude, longitude: location.longitude }}
          title={locationName || "Current Location"}
          pinColor="blue"
        />
        
        {/* Destination Marker */}
        {destinationMarker && (
          <Marker
            coordinate={{ latitude: destinationMarker.latitude, longitude: destinationMarker.longitude }}
            title={destinationName || "Destination"}
            pinColor={theme.colors.primary}
          />
        )}

        {/* Route Polyline */}
        {routeCoords.length > 0 && (
          <Polyline coordinates={routeCoords} strokeWidth={4} strokeColor={theme.colors.primary} />
        )}

        {/* Driver Marker: show driver's image if available, otherwise a car icon from the web */}
        {driverLocation && (isSearchingDriver || isDriverMoving) && (
          <Marker
            coordinate={driverLocation}
            title="Driver"
            description={isSearchingDriver ? "Finding closest driver..." : "On the way"}
          >
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Image
               source={require('../../assets/carIcon.png')}
              
                style={{ width: 44, height: 44 }}
                resizeMode="contain"
              />
              
            </View>
          </Marker>
        )}
      </MapView>

      {/* Bottom action buttons */}
      {routeCoords.length > 0 && !isDriverMoving && !rideCompleted && (
        <SafeAreaView style={[styles.bottomActions, { backgroundColor: theme.colors.surface }]} edges={['bottom']}>
          <LongButton
            text={isSearchingDriver ? "Searching for driver..." : "Find Driver"}
            onPress={findDriver}
          />
        </SafeAreaView>
      )}

      {rideCompleted && (
        <SafeAreaView style={[styles.bottomActions, { backgroundColor: theme.colors.surface }]} edges={['bottom']}>
          <LongButton
            text="Book Another Ride"
            onPress={resetRide}
          />
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
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 12, 
    paddingVertical: 10, 
    borderBottomWidth: 1 
  },
  headerTitle: { fontSize: 18, fontWeight: '600', marginLeft: 12 },
  locationCardsContainer: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
    borderTopColor: '#e0e0e0',
  },
});