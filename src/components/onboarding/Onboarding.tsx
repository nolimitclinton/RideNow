import React, { useRef, useState } from "react";
import {
  View,
  FlatList,
  Animated,
  StyleSheet,
  ViewToken,
  ListRenderItemInfo,
  TouchableOpacity,
  Text,
} from "react-native";
import OnboardingItem from "./OnboardingItem";
import { slides } from "../../constants/slides";
import CircularProgressButton from "./CircularProgressButton";
import { COLORS } from "../../constants/colors";

interface Slide {
  id: number;
  message: string;
  description: string;
  image: any;
}

interface OnboardingScreenProps {
  onDone: () => void;
}

export default function OnboardingScreen({ onDone }: OnboardingScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<FlatList<Slide>>(null);

  const viewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setCurrentIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      onDone();
    }
  };

  const renderItem = ({ item }: ListRenderItemInfo<Slide>) => (
    <OnboardingItem
      image={item.image}
      message={item.message}
      description={item.description}
    />
  );

  return (
    <View style={styles.container}>
      {/* Skip Button */}
      <TouchableOpacity style={styles.skipButton} onPress={onDone}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <FlatList
        data={slides}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        keyExtractor={(item) => item.id.toString()}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        ref={slidesRef}
      />

      <View style={styles.footer}>
        <CircularProgressButton
          progress={(currentIndex + 1) / slides.length}
          onPress={handleNext}
          isLast={currentIndex === slides.length - 1}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  skipButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 2,
  },
  skipText: {
    color: COLORS.GRAY,
    fontSize: 16,
    fontWeight: "400",
  },
  footer: {
    position: "absolute",
    bottom: 60,
    alignSelf: "center",
    alignItems: "center",
  },
});
