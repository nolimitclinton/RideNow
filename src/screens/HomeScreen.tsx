import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Alert, Text, ActivityIndicator } from 'react-native';
import MapView, { PROVIDER_GOOGLE, MapViewProps } from 'react-native-maps';
import * as Location from 'expo-location';
import { COLORS } from '../constants/colors';
import BottomPanel from '../components/modals/BottomPanel';
import SmallButton from '../components/buttons/SmallButton';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import SearchBar from '../components/SearchBar';

// ✅ Coordinate type
interface Coord {
  latitude: number;
  longitude: number;
}

export default function HomeScreen() {
  const [location, setLocation] = useState<Coord | null>(null);
  const [searchQuery, setSearchQuery] = useState(''); // 👈 Added state for SearchBar
  const mapRef = useRef<MapView | null>(null);
  const navigation = useNavigation();

  // ✅ Location fetch
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location access is required.');
        return;
      }

      const fresh = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const coords: Coord = {
        latitude: fresh.coords.latitude,
        longitude: fresh.coords.longitude,
      };

      setLocation(coords);
      mapRef.current?.animateCamera({ center: coords });
    })();
  }, []);

  // ✅ Handler for search input
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    console.log('User typing:', text);
  };

  const handleSearchSubmit = () => {
    Alert.alert('Search submitted', `Searching for: ${searchQuery}`);
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
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          showsUserLocation
          showsMyLocationButton
        />

        {/* ✅ Drawer Button */}
        <View style={styles.overlayButton}>
          <SmallButton
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            icon="Menu"
          />
        </View>

        {/* ✅ Bottom Sheet with SearchBar */}
        <BottomPanel>
          <View style={styles.bottomContent}>
            <SearchBar
              placeholder="From"
              value={searchQuery}
              onChangeText={handleSearchChange}
              onSubmitEditing={handleSearchSubmit}
              innerStyle={styles.searchBarInner}
              inputStyle={styles.searchInput}
              iconColor={COLORS.LIGHT_GRAY}
              placeholderColor={COLORS.LIGHT_GRAY}
            />
             <SearchBar
              placeholder="To"
              value={searchQuery}
              onChangeText={handleSearchChange}
              onSubmitEditing={handleSearchSubmit}
              innerStyle={styles.searchBarInner}
              inputStyle={styles.searchInput}
              iconColor={COLORS.LIGHT_GRAY}
              placeholderColor={COLORS.LIGHT_GRAY}
              
            />
          </View>
        </BottomPanel>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.DARK_GRAY,
  },
  container: {
    flex: 1,
  },
  overlayButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
  },
  bottomContent: {
    padding: 10,
  },
  searchBarInner: {
    backgroundColor: COLORS.GREEN,
    marginBottom:10
  },
  searchInput: {
    color: COLORS.LIGHT_GRAY,
    
  },
});
