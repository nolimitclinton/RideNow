// src/components/profile/Avatar.tsx
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Camera } from 'lucide-react-native';
import { COLORS } from '../../constants/colors';
import { useAuth } from '../../store/AuthProvider';

const Avatar = () => {
  const { user } = useAuth();
  const photoURL = user?.photoURL || null;
  const initials = user?.displayName?.[0]?.toUpperCase() ?? '?';

  return (
    <View style={{ alignItems: 'center' }}>
      <View style={{ position: 'relative' }}>
        {photoURL ? (
          <Image
            source={{ uri: photoURL }}
            style={{ width: 200, height: 200, borderRadius: 100 }}
          />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.initials}>{initials}</Text>
          </View>
        )}

        <Pressable
          hitSlop={20}
          style={styles.cameraButton}
          onPress={() => {
            // later: hook into "change photo" flow
          }}
        >
          <Camera />
        </Pressable>
      </View>
    </View>
  );
};

export default Avatar;

const styles = StyleSheet.create({
  placeholder: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontSize: 64,
    fontWeight: '700',
    color: COLORS.DARK_GRAY,
  },
  cameraButton: {
    backgroundColor: COLORS.EXTRA_LIGHT_GREEN,
    height: 40,
    width: 40,
    borderWidth: 2,
    borderColor: COLORS.LIGHT_GREEN,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 10,
    right: 0,
    transform: [{ translateX: -0.45 * 40 }],
  },
});