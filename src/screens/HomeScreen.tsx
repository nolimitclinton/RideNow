import React, { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  View,
  Alert,
  Text,
  ActivityIndicator,
} from "react-native";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { COLORS } from "../constants/colors";
import CustomBottomModal from "../components/modals/BottomModal";
import SmallButton from "../components/buttons/SmallButton";

interface Coord {
  latitude: number;
  longitude: number;
}

export default function HomeScreen() {
  const [location, setLocation] = useState<Coord | null>(null);
  const [enableModal, setModalValue] = useState(false);
  const showModal = () => setModalValue(true);
  const closeModal = () => setModalValue(false);
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

      const fresh = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const coords = {
        latitude: fresh.coords.latitude,
        longitude: fresh.coords.longitude,
      };
      setLocation(coords);
      mapRef.current?.animateCamera({ center: coords });
    })();
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
    <View style={styles.container}>
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

      {/* ✅ Button overlayed on top of the map */}
      <View style={styles.overlayButton}>
        <SmallButton onPress={()=>{console.log("open drawer navigation")}} icon="Menu"/>
      </View>

      {/* ✅ Modal */}
      {enableModal && (
        <CustomBottomModal
          visible={enableModal}
          onClose={closeModal}
          disableBackgroundClose={false}
          title="My Custom Modal"
          height={"70%"}
          showCloseButton={false}
        >
          <Text style={{ textAlign: "center", marginVertical: 10 }}>
            This is your modal content 🎉
          </Text>
        </CustomBottomModal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.WHITE,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.DARK_GRAY,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
  },
  overlayButton: {
    position: "absolute",
    top:50,
    left:20,
    alignSelf: "center",
    zIndex: 10,
  },
});
