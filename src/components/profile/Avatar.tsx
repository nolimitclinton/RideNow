import React, { useEffect, useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Camera } from 'lucide-react-native';
import { COLORS } from '../../constants/colors';
import { useAuth } from '../../store/AuthProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

const AVATAR_KEY_PREFIX = 'avatar:';

const Avatar = () => {
  const { user } = useAuth();
  const [localUri, setLocalUri] = useState<string | null>(null);

  const initials = user?.displayName?.[0]?.toUpperCase() ?? '?';

  useEffect(() => {
    if (!user) {
      setLocalUri(null);
      return;
    }
    const key = AVATAR_KEY_PREFIX + user.uid;
    AsyncStorage.getItem(key).then((uri) => {
      if (uri) setLocalUri(uri);
    });
  }, [user]);

  const photoURL = localUri || user?.photoURL || null;

  async function onChangePhoto() {
    if (!user) {
      Alert.alert('Not signed in', 'You must be signed in to change your photo.');
      return;
    }

    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Allow photo access to change your avatar.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.length) {
        const uri = result.assets[0].uri;
        setLocalUri(uri);
        await AsyncStorage.setItem(AVATAR_KEY_PREFIX + user.uid, uri);
      }
    } catch (e) {
      console.log('Avatar picker error', e);
      Alert.alert('Error', 'Could not change your photo.');
    }
  }

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
          onPress={onChangePhoto}
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