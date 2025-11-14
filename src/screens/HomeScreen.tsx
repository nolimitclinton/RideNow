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
  Animated
} from "react-native";
import MapView, { PROVIDER_GOOGLE, Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";
import { useNavigation, DrawerActions } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import SearchBar from "../components/SearchBar";
import BottomPanel, { BottomPanelHandle } from "../components/modals/BottomPanel";
import SmallButton from "../components/buttons/SmallButton";
import { COLORS } from "../constants/colors";
import "react-native-get-random-values"; // ✅ prevents UUID crash
import LongButton from "../components/buttons/LongButton";

const GOOGLE_API_KEY = "AIzaSyC3B1BNTq8re47QL2ltM5zdZYujKIX4tKs"; // 🔑 replace with your API Key

export default function HomeScreen() {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationName, setLocationName] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [destinationQuery, setDestinationQuery] = useState("");
  const [destinationResults, setDestinationResults] = useState<any[]>([]);
  const [destinationMarker, setDestinationMarker] = useState<{ latitude: number; longitude: number } | null>(null);
  const [routeCoords, setRouteCoords] = useState<{ latitude: number; longitude: number }[]>([]);
  const [isSearchingDriver, setIsSearchingDriver] = useState(false);
  const [driverLocation, setDriverLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isDriverMoving, setIsDriverMoving] = useState(false);

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
      handleSearchFocus(1);
      // Animate driver along route
      let currentIndex = 0;
      const animateDriver = async () => {
        while (currentIndex < routeCoords.length - 1) {
          setDriverLocation(routeCoords[currentIndex]);
          currentIndex++;
          await new Promise(resolve => setTimeout(resolve, 300)); // Move every 100ms
        }
        // Reached destination
        setIsDriverMoving(false);
        Alert.alert("Arrived!", "I don reach!");
      };
      
      animateDriver();
    }
  };
  const bottomSheetRef = useRef<BottomPanelHandle>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debounceTimerRefDest = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigation = useNavigation();

  const [activeInput, setActiveInput] = useState<"origin" | "destination" | null>(null);

  const DEBOUNCE_DELAY = 500; // ms

  const handleSearchFocus = (num:number = 2) => {
    bottomSheetRef.current?.snapToIndex(num);
  };

  // Get route from OSRM between two points (start/end are { latitude, longitude })
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

  // Update search text immediately, but debounce the places API call
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // If text is empty, clear results immediately
    if (!text) {
      setSearchResults([]);
      return;
    }

    // Set new timer to call fetchPlaces after delay
    debounceTimerRef.current = setTimeout(() => {
      fetchPlaces(text);
    }, DEBOUNCE_DELAY);
  };

  const handleDestinationFocus = () => {
    setActiveInput("destination");
    bottomSheetRef.current?.snapToIndex(2);
  };

  const handleDestinationChange = (text: string) => {
    setDestinationQuery(text);

    // Clear existing timer
    if (debounceTimerRefDest.current) {
      clearTimeout(debounceTimerRefDest.current);
    }

    // If text is empty, clear results immediately
    if (!text) {
      setDestinationResults([]);
      setDestinationMarker(null);
      setRouteCoords([]);
      return;
    }

    // Set new timer to call fetchPlaces after delay
    debounceTimerRefDest.current = setTimeout(() => {
      fetchPlaces(text, setDestinationResults);
    }, DEBOUNCE_DELAY);
  };

  // 🔹 Fetch autocomplete results from Google Places
  const fetchPlaces = async (
    query: string,
    setResults: React.Dispatch<React.SetStateAction<any[]>> = setSearchResults
  ) => {
    if (!query) {
      setResults([]);
      return;
    }

    try {
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?key=${GOOGLE_API_KEY}&input=${encodeURIComponent(query)}&types=establishment`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.status === "OK") {
        setResults(data.predictions);
      } else {
        setResults([]);
        console.warn("Google Places error:", data.status);
      }
    } catch (error) {
      console.error("Places fetch error:", error);
    }
  };

  useEffect(() => {
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

      // Animate to current location with zoom
      mapRef.current?.animateCamera({
        center: {
          latitude: coords.latitude,
          longitude: coords.longitude,
        },
        zoom: 15,
        heading: 0,
        pitch: 0
      }, { duration: 1000 }); // Animation duration in ms

      const address = await Location.reverseGeocodeAsync({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });

      if (address.length > 0) {
        const place = address[0];
        setLocationName(place.city ?? "");
        console.log("Current location name:", place.name, place.street, place.city, place.region);
      }
    })();

    // cleanup: clear debounce timers on unmount
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      if (debounceTimerRefDest.current) {
        clearTimeout(debounceTimerRefDest.current);
        debounceTimerRefDest.current = null;
      }
    };
  }, []);

  if (!location) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={COLORS.GREEN} />
        <Text style={styles.loadingText}>Getting Location...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TouchableWithoutFeedback
        onPress={() => {
          bottomSheetRef.current?.snapToIndex(0);
          Keyboard.dismiss();
        }}
      >
        <View style={styles.container}>
          {/* 🗺️ Map */}
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={StyleSheet.absoluteFillObject}
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
              description={searchQuery || "Your location"}
              pinColor="blue"
            />
            
            {/* Destination Marker */}
            {destinationMarker ? (
              <Marker
                coordinate={{ latitude: destinationMarker.latitude, longitude: destinationMarker.longitude }}
                title={destinationQuery || "Destination"}
                pinColor={COLORS.GREEN}
              />
            ) : null}
            {/* Route Polyline */}
            {routeCoords.length > 0 ? (
              <Polyline coordinates={routeCoords} strokeWidth={4} strokeColor={COLORS.GREEN} />
            ) : null}

            {/* Driver Marker */}
            {driverLocation && (isSearchingDriver || isDriverMoving) ? (
              <Marker
                coordinate={driverLocation}
                title="Driver"
                description={isSearchingDriver ? "Finding closest driver..." : "On the way"}
                pinColor="yellow"
              />
            ) : null}
          </MapView>

          {/* ☰ Drawer Menu Button */}
          <View style={styles.overlayButton}>
            <SmallButton
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
              icon="Menu"
            />
          </View>

          {/* 📍 Bottom Panel with Search Bar */}
          <BottomPanel ref={bottomSheetRef}>
            <View style={styles.bottomContent}>
              <Text style={styles.panelTitle}>Search Location</Text>

              <View style={styles.searchContainer}>
                <SearchBar
                  placeholder={locationName || "Current Location"}
                  value={searchQuery}
                  onChangeText={handleSearchChange}
                  onFocus={() => {
                    setActiveInput("origin");
                    handleSearchFocus();
                  }}
                />

                <SearchBar
                  placeholder="Destination"
                  value={destinationQuery}
                  onChangeText={handleDestinationChange}
                  onFocus={handleDestinationFocus}
                />

                <ScrollView style={{ maxHeight: 250 }}>
                  { (activeInput === "destination" ? destinationResults : searchResults).length === 0 ? (
                   null
                  ) : (
                    (activeInput === "destination" ? destinationResults : searchResults).map((item) => (
                      <TouchableOpacity
                        key={item.place_id}
                        onPress={async () => {
                          const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${item.place_id}&key=${GOOGLE_API_KEY}`;
                          const detailsRes = await fetch(detailsUrl);
                          const detailsData = await detailsRes.json();

                          if (detailsData.status === "OK") {
                            const coords = detailsData.result.geometry.location;
                            // If destination input is active, add a marker there and center map without overwriting user location
                            if (activeInput === "destination") {
                              setDestinationMarker({ latitude: coords.lat, longitude: coords.lng });
                              mapRef.current?.animateCamera({
                                center: { latitude: coords.lat, longitude: coords.lng },
                                zoom: 15,
                              });
                              bottomSheetRef.current?.snapToIndex(0); // collapse sheet
                              setDestinationResults([]);
                              setDestinationQuery(item.description);
                              // compute route from current location to destination
                              if (location) {
                                const route = await getRouteFromOSRM(
                                  { latitude: location.latitude, longitude: location.longitude },
                                  { latitude: coords.lat, longitude: coords.lng }
                                );
                                setRouteCoords(route);
                              } else {
                                setRouteCoords([]);
                              }
                            } else {
                              // Origin selection: update main location and center map
                              setLocation({
                                latitude: coords.lat,
                                longitude: coords.lng,
                              });
                              mapRef.current?.animateCamera({
                                center: { latitude: coords.lat, longitude: coords.lng },
                                zoom: 15,
                              });
                              bottomSheetRef.current?.snapToIndex(0); // collapse sheet
                              setSearchResults([]);
                              setSearchQuery(item.description);
                              // clear any existing route when origin is manually set
                              setRouteCoords([]);
                            }
                          }
                        }}
                        style={styles.resultItem}
                      >
                        <Text>{item.description}</Text>
                      </TouchableOpacity>
                    ))
                  )}
                </ScrollView>
                {destinationMarker ? (
                  <>
                    {handleSearchFocus(2)}
                    <LongButton 
                      text={isSearchingDriver ? "Finding Driver..." : (isDriverMoving ? "Driving to destination" : "Find Driver")}
                      onPress={findDriver}
                    />
                  </>
                ): null}
              </View>
            </View>
          </BottomPanel>
        </View>
      </TouchableWithoutFeedback>
    </GestureHandlerRootView>
  );
}

// 🎨 Styles
const styles = StyleSheet.create({
  container: { flex: 1 },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.WHITE,
  },
  loadingText: { marginTop: 10, fontSize: 16, color: COLORS.DARK_GRAY },
  overlayButton: { position: "absolute", top: 50, left: 20, zIndex: 10 },
  bottomContent: { gap: 5, padding: 10 },
  panelTitle: { fontWeight: "bold", alignSelf: "center", fontSize: 20 },
  searchContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "flex-start",
    gap: 5,
    //backgroundColor: COLORS.LIGHT_GRAY,
    borderRadius: 8,
  
  },
  resultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.LIGHT_GRAY,
  },
});
