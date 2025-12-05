import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Alert } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import TabNavigator from './TabNavigator';
import LongButton from '../components/buttons/LongButton';
import SmallButton from '../components/buttons/SmallButton';
import { COLORS } from '../constants/colors';
import { auth, db } from '../services/firebase';
import { signOut } from 'firebase/auth';
import { useAuth } from '../store/AuthProvider';
import { doc, onSnapshot } from 'firebase/firestore';

type DrawerParamList = {
  MainTabs: undefined;
  History: undefined;
};

const Drawer = createDrawerNavigator<DrawerParamList>();

function CustomDrawerContent(props: any) {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [firestorePhotoURL, setFirestorePhotoURL] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const ref = doc(db, 'users', user.uid);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const data = snap.data() as any;
        setFirestorePhotoURL(data.photoURL ?? null);
      }
    });

    return unsub;
  }, [user]);

  const displayName =
    user?.displayName || (user?.email ? user.email.split('@')[0] : 'Rider');
  const email = user?.email || '—';
  const effectivePhotoURL = firestorePhotoURL || user?.photoURL || null;

  async function onLogout() {
    try {
      await signOut(auth);
      props.navigation.closeDrawer();
    } catch (e: any) {
      Alert.alert('Logout failed', e?.message || 'Please try again.');
    }
  }

  return (
    <View style={styles.container}>
      <DrawerContentScrollView {...props} contentContainerStyle={{ flexGrow: 1 }}>
        {/* Back */}
        <View style={{ paddingHorizontal: 15 }}>
          <SmallButton
            text="Back"
            icon="ArrowBigLeft"
            iconColor={COLORS.DARK_GRAY}
            style={styles.backButton}
            textStyle={{ color: COLORS.DARK_GRAY }}
            onPress={() => navigation.goBack()}
          />
        </View>

        {/* Profile */}
        <View style={styles.profileContainer}>
          {effectivePhotoURL ? (
            <Image source={{ uri: effectivePhotoURL }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <Text style={styles.initials}>
                {displayName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}

          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.email}>{email}</Text>
        </View>

        {/* Menu */}
        <ScrollView style={{ paddingHorizontal: 20 }}>
          <LongButton
            text="History"
            icon="Clock"
            iconColor={COLORS.DARK_GRAY}
            onPress={() => navigation.navigate('History' as never)}
            style={styles.menuButton}
            textStyle={{ color: COLORS.DARK_GRAY }}
          />

          <LongButton
            text="About Us"
            icon="Info"
            iconColor={COLORS.DARK_GRAY}
            onPress={() => {}}
            style={styles.menuButton}
            textStyle={{ color: COLORS.DARK_GRAY }}
          />

          <LongButton
            text="Settings"
            icon="Settings"
            iconColor={COLORS.DARK_GRAY}
            onPress={() => {}}
            style={styles.menuButton}
            textStyle={{ color: COLORS.DARK_GRAY }}
          />

          {/* Logout */}
          <LongButton
            text="Logout"
            icon="LogOut"
            onPress={onLogout}
            style={{ ...styles.loginButton, backgroundColor: COLORS.GREEN }}
          />
        </ScrollView>
      </DrawerContentScrollView>
    </View>
  );
}

export default function AppDrawer() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          width: '80%',
          borderTopRightRadius: 20,
          borderBottomRightRadius: 20,
        },
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen name="MainTabs" component={TabNavigator} />
      {/* <Drawer.Screen name="History" component={HistoryScreen} /> */}
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.WHITE },
  backButton: { backgroundColor: 'transparent', alignSelf: 'flex-start' },
  profileContainer: {
    alignItems: 'flex-start',
    padding: 20,
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.WHITE,
  },
  avatar: { width: 80, height: 80, borderRadius: 40, marginBottom: 10 },
  avatarFallback: {
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.DARK_GRAY,
  },
  name: { fontSize: 22, fontWeight: 'bold', color: COLORS.DARK_GRAY, marginTop: 5 },
  email: { fontSize: 16, color: 'gray' },
  menuButton: {
    marginBottom: 12,
    justifyContent: 'flex-start',
    backgroundColor: 'transparent',
    paddingLeft: 5,
  },
  loginButton: { marginBottom: 12, justifyContent: 'flex-start' },
});