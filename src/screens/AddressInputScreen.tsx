import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Keyboard,
  Alert,
  ActivityIndicator
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import SearchBar from "../components/SearchBar";
import LongButton from "../components/buttons/LongButton";
import { useTheme } from "../store/ThemeProvider";
import * as Location from "expo-location";

const GOOGLE_API_KEY = "AIzaSyC3B1BNTq8re47QL2ltM5zdZYujKIX4tKs"; // Replace with your actual API key

const LocationDisplayCard: React.FC<{
  label: string;
  locationName: string;
  iconName: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  onClear?: () => void;
}> = ({ label, locationName, iconName, onPress, onClear }) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.locationCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
    >
      <Ionicons name={iconName} size={20} color={theme.colors.primary} style={styles.cardIcon} />
      <View style={styles.cardTextContainer}>
        <Text style={[styles.cardLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
        <Text numberOfLines={1} style={[styles.cardLocationName, { color: theme.colors.text }]}>
          {locationName}
        </Text>
      </View>
      {onClear && locationName && (
        <TouchableOpacity onPress={onClear} style={styles.clearButton}>
          <Ionicons name="close-circle" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

export default function AddressInputScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const [originQuery, setOriginQuery] = useState("");
  const [destinationQuery, setDestinationQuery] = useState("");

  const [originResults, setOriginResults] = useState<any[]>([]);
  const [destinationResults, setDestinationResults] = useState<any[]>([]);

  const [selectedOrigin, setSelectedOrigin] = useState<{ name: string; latitude: number; longitude: number } | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<{ name: string; latitude: number; longitude: number } | null>(null);

  const [activeSearchInput, setActiveSearchInput] = useState<"origin" | "destination" | null>(null);
  const [isFetchingLocation, setIsFetchingLocation] = useState(true);

  useEffect(() => {
    const { initialOrigin, initialDestination } = route.params || {};
    if (initialOrigin) {
      setSelectedOrigin(initialOrigin);
      setOriginQuery(initialOrigin.name);
    }
    if (initialDestination) {
      setSelectedDestination(initialDestination);
      setDestinationQuery(initialDestination.name);
    }

    if (!initialOrigin) {
      (async () => {
        setIsFetchingLocation(true);
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== "granted") {
            Alert.alert("Permission denied", "Location access is required to set your current location.");
            return;
          }

          const cachedLocation = await Location.getLastKnownPositionAsync();
          const coords = cachedLocation?.coords ?? (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })).coords;

          if (coords) {
            const address = await Location.reverseGeocodeAsync({ latitude: coords.latitude, longitude: coords.longitude });
            const placeName = address.length > 0 ? address[0].name || address[0].street || address[0].city || "Current Location" : "Current Location";
            setSelectedOrigin({ latitude: coords.latitude, longitude: coords.longitude, name: placeName });
            setOriginQuery(placeName);
          }
        } catch (error) {
          console.error("Error getting current location:", error);
          setSelectedOrigin(null);
          setOriginQuery("");
        } finally {
          setIsFetchingLocation(false);
        }
      })();
    } else {
      setIsFetchingLocation(false);
    }
  }, [route.params]);

  const fetchPlaces = async (query: string, setResults: React.Dispatch<React.SetStateAction<any[]>>) => {
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

  const handleSearchChange = (
    text: string,
    type: "origin" | "destination",
    setQuery: React.Dispatch<React.SetStateAction<string>>,
    setResults: React.Dispatch<React.SetStateAction<any[]>>
  ) => {
    setQuery(text);
    fetchPlaces(text, setResults); // immediate fetch, no debounce
  };

  const selectPlace = async (placeId: string, description: string, type: "origin" | "destination") => {
    Keyboard.dismiss();
    try {
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GOOGLE_API_KEY}`;
      const detailsRes = await fetch(detailsUrl);
      const detailsData = await detailsRes.json();

      if (detailsData.status === "OK") {
        const coords = detailsData.result.geometry.location;
        const newLocation = { latitude: coords.lat, longitude: coords.lng, name: description };

        if (type === "origin") {
          setSelectedOrigin(newLocation);
          setOriginQuery(description);
          setOriginResults([]);
        } else {
          setSelectedDestination(newLocation);
          setDestinationQuery(description);
          setDestinationResults([]);
        }
        setActiveSearchInput(null);
      }
    } catch (error) {
      console.error("Error fetching place details:", error);
      Alert.alert("Error", "Could not fetch details for the selected location.");
    }
  };

  const handleConfirmLocation = () => {
    if (!selectedOrigin) {
      Alert.alert("Missing Origin", "Please select a pick-up location.");
      return;
    }
    if (!selectedDestination) {
      Alert.alert("Missing Destination", "Please select a destination.");
      return;
    }

    (navigation as any).navigate('MainTabs', {
      screen: 'Home',
      params: { selectedOrigin, selectedDestination },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Set Your Address</Text>
      </View>

      <View style={styles.addressInputsContainer}>
        {isFetchingLocation ? (
          <View style={styles.loadingLocationContainer}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text style={styles.loadingLocationText}>Detecting current location...</Text>
          </View>
        ) : selectedOrigin && activeSearchInput !== "origin" ? (
          <LocationDisplayCard
            label="Pick-up Location"
            locationName={selectedOrigin.name}
            iconName="location"
            onPress={() => {
              setActiveSearchInput("origin");
              setOriginQuery(selectedOrigin.name);
            }}
            onClear={() => {
              setSelectedOrigin(null);
              setOriginQuery("");
              setActiveSearchInput("origin");
            }}
          />
        ) : (
          <SearchBar
            placeholder="Pick-up Location (Current Location)"
            value={originQuery}
            onChangeText={(text) => handleSearchChange(text, "origin", setOriginQuery, setOriginResults)}
            onFocus={() => setActiveSearchInput("origin")}
            style={styles.searchBar}
          />
        )}

        {selectedDestination && activeSearchInput !== "destination" ? (
          <LocationDisplayCard
            label="Destination"
            locationName={selectedDestination.name}
            iconName="pin"
            onPress={() => {
              setActiveSearchInput("destination");
              setDestinationQuery(selectedDestination.name);
            }}
            onClear={() => {
              setSelectedDestination(null);
              setDestinationQuery("");
              setActiveSearchInput("destination");
            }}
          />
        ) : (
          <SearchBar
            placeholder="Enter destination or drop-off point"
            value={destinationQuery}
            onChangeText={(text) => handleSearchChange(text, "destination", setDestinationQuery, setDestinationResults)}
            onFocus={() => setActiveSearchInput("destination")}
            style={styles.searchBar}
          />
        )}
      </View>

      {(activeSearchInput === "origin" && originResults.length > 0) ||
      (activeSearchInput === "destination" && destinationResults.length > 0) ? (
        <ScrollView style={styles.suggestionsContainer}>
          <Text style={styles.suggestionsTitle}>Suggestions</Text>
          {(activeSearchInput === "origin" ? originResults : destinationResults).map((item) => (
            <TouchableOpacity
              key={item.place_id}
              onPress={() => selectPlace(item.place_id, item.description, activeSearchInput || "origin")}
              style={styles.resultItem}
            >
              <Ionicons name="time-outline" size={20} color={theme.colors.textSecondary} style={styles.resultIcon} />
              <View style={styles.resultTextContainer}>
                <Text style={styles.resultPrimaryText}>{item.structured_formatting.main_text}</Text>
                <Text style={styles.resultSecondaryText}>{item.structured_formatting.secondary_text}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : null}

      <View style={styles.footer}>
        <LongButton text="Confirm Location" onPress={handleConfirmLocation} />
      </View>
    </View>
  );
}

function createStyles(theme: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background, paddingTop: 40 },
    header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 15, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
    backButton: { padding: 5, marginRight: 10 },
    headerTitle: { fontSize: 20, fontWeight: "bold", color: theme.colors.text },
    addressInputsContainer: { padding: 15, backgroundColor: theme.colors.background },
    searchBar: { marginBottom: 10 },
    loadingLocationContainer: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: theme.colors.surface, borderRadius: 8, marginBottom: 10 },
    loadingLocationText: { marginLeft: 10, color: theme.colors.textSecondary },
    locationCard: { flexDirection: "row", alignItems: "center", padding: 15, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: theme.colors.border },
    cardIcon: { marginRight: 10 },
    cardTextContainer: { flex: 1 },
    cardLabel: { fontSize: 12, color: theme.colors.textSecondary },
    cardLocationName: { fontSize: 16, fontWeight: "500", color: theme.colors.text },
    clearButton: { padding: 5, marginLeft: 10 },
    suggestionsContainer: { flex: 1, marginHorizontal: 15 },
    suggestionsTitle: { fontSize: 16, fontWeight: "bold", color: theme.colors.text, marginBottom: 10, marginTop: 5 },
    resultItem: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
    resultIcon: { marginRight: 10 },
    resultTextContainer: { flex: 1 },
    resultPrimaryText: { fontSize: 16, color: theme.colors.text },
    resultSecondaryText: { fontSize: 12, color: theme.colors.textSecondary },
    footer: { padding: 15, backgroundColor: theme.colors.background, borderTopWidth: 1, borderTopColor: theme.colors.border },
  });
}
