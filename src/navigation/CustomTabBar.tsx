import React from "react";
import { View, Pressable, Image, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { COLORS } from "../constants/colors";

type TabIcon = {
  active: any;
  inactive: any;
  label: string;
};

type IconMap = Record<string, TabIcon>;

const icons: IconMap = {
  Home: {
    active: require("../../assets/icons/home-active.png"),
    inactive: require("../../assets/icons/home-inactive.png"),
    label: "Home",
  },
  History: {
    active: require("../../assets/icons/history-active.png"),
    inactive: require("../../assets/icons/history-inactive.png"),
    label: "History",
  },
  Profile: {
    active: require("../../assets/icons/profile-active.png"),
    inactive: require("../../assets/icons/profile-inactive.png"),
    label: "Profile",
  },
};

export default function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: insets.bottom,
          height: 65 + insets.bottom, 
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const icon = icons[route.name];

        if (!icon) return null;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name as never);
          }
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            style={({ pressed }) => [
              styles.item,
              pressed && { opacity: 0.6 },
            ]}
          >
            <Image
              source={focused ? icon.active : icon.inactive}
              style={styles.icon}
              resizeMode="contain"
            />
            <Text style={[styles.label, focused && styles.activeLabel]}>
              {icon.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.WHITE,
    backgroundColor: COLORS.WHITE,
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    width: 26,
    height: 26,
    marginBottom: 2,
  },
  label: {
    fontSize: 11,
    color: COLORS.LIGHT_GRAY,
  },
  activeLabel: {
    color: COLORS.DARK_GRAY,
    fontWeight: "600",
  },
});
