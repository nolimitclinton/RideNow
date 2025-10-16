import React from 'react';
import { View, StyleSheet, Pressable, Image, Text, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type TabIconMap = {
  [routeName: string]: { active: any; inactive: any; label?: string };
};

const ICONS: TabIconMap = {
  Home: {
    active: require('../../assets/icons/home-active.png'),
    inactive: require('../../assets/icons/home-inactive.png'),
    label: 'Home',
  },
  History: {
    active: require('../../assets/icons/history-active.png'),
    inactive: require('../../assets/icons/history-inactive.png'),
    label: 'History',
  },
  Profile: {
    active: require('../../assets/icons/profile-active.png'),
    inactive: require('../../assets/icons/profile-inactive.png'),
    label: 'Profile',
  },
};

export default function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {state.routes.map((route: any, index: number) => {
        const isFocused = state.index === index;
        const iconSet = ICONS[route.name];

        if (!iconSet) return null;

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
        };

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            onPress={onPress}
            style={({ pressed }) => [styles.item, pressed && { opacity: 0.7 }]}
            hitSlop={8}
          >
            <Image
              source={isFocused ? iconSet.active : iconSet.inactive}
              style={styles.icon}
              resizeMode="contain"
            />
            <Text style={[styles.label, isFocused && styles.labelActive]}>
              {iconSet.label ?? route.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5E5E7',
    backgroundColor: '#FFFFFF',
    paddingTop: 8,
    alignItems: 'center',
    ...Platform.select({
      android: { height: 64 },
      ios: { minHeight: 64 },
    }),
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  icon: { width: 24, height: 24 },
  label: { fontSize: 11, color: '#A1A1A6' },
  labelActive: { color: '#111113', fontWeight: '600' },
});