import React, { useRef, useEffect } from "react";
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  Animated,
  Easing,
} from "react-native";
import Svg, { Circle } from "react-native-svg";
import { COLORS } from "../../constants/colors";
import { ArrowRight } from "lucide-react-native";
import { Color } from "react-native/types_generated/Libraries/Animated/AnimatedExports";

interface Props {
  progress: number; // 0..1
  onPress: () => void;
  isLast: boolean;
}

const SIZE = 80;
const STROKE_WIDTH = 5;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function CircularProgressButton({
  progress,
  onPress,
  isLast,
}: Props) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: progress,
      duration: 400,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [progress, animatedValue]);

  // REVERSED outputRange to make the stroke animate counterclockwise
  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [CIRCUMFERENCE, 0], // reversed direction
  });

  return (
    <View style={styles.container}>
      <Svg width={SIZE} height={SIZE} style={StyleSheet.absoluteFill}>
        {/* background ring */}
        <Circle
          stroke="#E0E0E0"
          fill="none"
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          strokeWidth={STROKE_WIDTH}
        />

        {/* animated ring: rotate to start at top-right (-90deg) */}
        <AnimatedCircle
          stroke={COLORS.LIGHT_GREEN}
          fill="none"
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          strokeWidth={STROKE_WIDTH}
          strokeDasharray={`${CIRCUMFERENCE}, ${CIRCUMFERENCE}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
        />
      </Svg>

      <TouchableOpacity style={styles.button} onPress={onPress}>
        <Text style={styles.text}>
          {isLast ? "Go" : <ArrowRight color={COLORS.WHITE} />}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SIZE,
    height: SIZE,
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 35,
    backgroundColor: COLORS.LIGHT_GREEN,
    justifyContent: "center",
    alignItems: "center",
  },
  text: { color: "#fff", fontSize: 20, fontWeight: "700" },
});
