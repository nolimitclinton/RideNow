import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ActivityIndicator, ScrollView, Pressable, StyleSheet, Alert } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import BottomPanel, { BottomPanelHandle } from '../components/modals/BottomPanel';
import SearchBar from '../components/SearchBar';
import SmallButton from '../components/buttons/SmallButton';
import { COLORS } from '../constants/colors';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { fetchPhoton } from '../constants/apiRoutes';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function HomeScreen() {
  const [location, setLocation] = useState<any>(null);
  const [fromQuery, setFromQuery] = useState('');
  const [toQuery, setToQuery] = useState('');
  const [fromSuggestions, setFromSuggestions] = useState<any[]>([]);
  const [toSuggestions, setToSuggestions] = useState<any[]>([]);

  const mapRef = useRef<MapView | null>(null);
  const bottomSheetRef = useRef<BottomPanelHandle>(null); // ✅ ref for bottom sheet
  const navigation = useNavigation();

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return Alert.alert('Permission denied');

      const cached = await Location.getLastKnownPositionAsync();
      if (cached) {
        const coords = { latitude: cached.coords.latitude, longitude: cached.coords.longitude };
        setLocation(coords);
        mapRef.current?.animateCamera({ center: coords });
      }

      const fresh = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const coords = { latitude: fresh.coords.latitude, longitude: fresh.coords.longitude };
      setLocation(coords);
      mapRef.current?.animateCamera({ center: coords });
    })();
  }, []);

  const handleFromChange = async (text: string) => {
    setFromQuery(text);
   // bottomSheetRef.current?.snapToIndex(1); // ✅ snap to 50%
    const results = await fetchPhoton(text);
    setFromSuggestions(results);
  };

  const handleToChange = async (text: string) => {
    setToQuery(text);
  //  bottomSheetRef.current?.snapToIndex(1); // ✅ snap to 50%
    const results = await fetchPhoton(text);
    setToSuggestions(results);
  };

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
      <View style={styles.container}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={StyleSheet.absoluteFillObject}
          initialRegion={{ latitude: location.latitude, longitude: location.longitude, latitudeDelta: 0.05, longitudeDelta: 0.05 }}
          showsUserLocation
          showsMyLocationButton
        />

        <View style={styles.overlayButton}>
          <SmallButton onPress={() => navigation.dispatch(DrawerActions.openDrawer())} icon="Menu" />
        </View>

        <BottomPanel ref={bottomSheetRef}>
          <Text style={styles.panelTitle}>Select Address</Text>
          <ScrollView style={styles.bottomContent} keyboardShouldPersistTaps="handled">
            <SearchBar onFocus={() => bottomSheetRef.current?.snapToIndex(2)} placeholder="From" value={fromQuery} onChangeText={handleFromChange} innerStyle={styles.searchBarInner} inputStyle={styles.searchInput} iconColor={COLORS.LIGHT_GRAY} debounce={20} />
            {fromSuggestions.map(item => (
              <Pressable
                key={item.properties.osm_id}
                onPress={() => {
                  setFromQuery(item.properties.name);
                  setFromSuggestions([]);
                  mapRef.current?.animateCamera({ center: { latitude: item.geometry.coordinates[1], longitude: item.geometry.coordinates[0] }, zoom: 15 });
                }}
                style={styles.suggestionItem}
              >
                <Text style={styles.suggestionText}>
                  {item.properties.name}, {item.properties.city || item.properties.country}
                </Text>
              </Pressable>
            ))}

            <SearchBar onFocus={() => bottomSheetRef.current?.snapToIndex(2)} placeholder="To" value={toQuery} onChangeText={handleToChange} innerStyle={styles.searchBarInner} inputStyle={styles.searchInput} iconColor={COLORS.LIGHT_GRAY} debounce={20} />
            {toSuggestions.map(item => (
              <Pressable
                key={item.properties.osm_id}
                onPress={() => {
                  setToQuery(item.properties.name);
                  setToSuggestions([]);
                  mapRef.current?.animateCamera({ center: { latitude: item.geometry.coordinates[1], longitude: item.geometry.coordinates[0] }, zoom: 15 });
                }}
                style={styles.suggestionItem}
              >
                <Text style={styles.suggestionText}>
                  {item.properties.name}, {item.properties.city || item.properties.country}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </BottomPanel>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.WHITE },
  loadingText: { marginTop: 10, fontSize: 16, color: COLORS.DARK_GRAY },
  container: { flex: 1 },
  overlayButton: { position: 'absolute', top: 50, left: 20, zIndex: 10 },
  bottomContent: { padding: 10, maxHeight: 300 },
  panelTitle: { fontWeight: 'bold', alignSelf: 'center', fontSize: 20 },
  searchBarInner: { backgroundColor: COLORS.GREEN, marginBottom: 10 },
  searchInput: { color: COLORS.LIGHT_GRAY },
  suggestionItem: { paddingVertical: 8, paddingHorizontal: 10 },
  suggestionText: { color: COLORS.DARK_GRAY },
});
