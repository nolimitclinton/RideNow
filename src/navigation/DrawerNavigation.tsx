import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Alert } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';
import TabNavigator from './TabNavigator';
import LongButton from '../components/buttons/LongButton';
import SmallButton from '../components/buttons/SmallButton';
import { useTheme } from '../store/ThemeProvider';
import { auth } from '../services/firebase';
import { signOut } from 'firebase/auth';
import { useAuth } from '../store/AuthProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';

type DrawerParamList = {
  MainTabs: undefined;
  History: undefined;
};

const Drawer = createDrawerNavigator<DrawerParamList>();
const AVATAR_KEY_PREFIX = 'avatar:';

function CustomDrawerContent(props: any) {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { theme, themeMode, toggleTheme } = useTheme();
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setAvatarUri(null);
      return;
    }

    const key = AVATAR_KEY_PREFIX + user.uid;
    AsyncStorage.getItem(key).then((uri) => {
      if (uri) {
        setAvatarUri(uri);
      } else {
        setAvatarUri(null);
      }
    });
  }, [user]);

  const displayName =
    user?.displayName || (user?.email ? user.email.split('@')[0] : 'Rider');
  const email = user?.email || '—';

  const effectivePhotoURL = avatarUri || user?.photoURL || null;

  async function onLogout() {
    try {
      await signOut(auth);
      props.navigation.closeDrawer();
    } catch (e: any) {
      Alert.alert('Logout failed', e?.message || 'Please try again.');
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <DrawerContentScrollView {...props} contentContainerStyle={{ flexGrow: 1 }}>
        {/* Back */}
        <View style={{ paddingHorizontal: 15 }}>
          <SmallButton
            text="Back"
            icon="ArrowBigLeft"
            iconColor={theme.colors.text}
            style={styles.backButton}
            textStyle={{ color: theme.colors.text }}
            onPress={() => navigation.goBack()}
          />
        </View>

        {/* Profile */}
        <View style={[styles.profileContainer, { backgroundColor: theme.colors.background, borderBottomColor: theme.colors.border }]}>
          {effectivePhotoURL ? (
            <Image source={{ uri: effectivePhotoURL }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.initials, { color: theme.colors.text }]}>
                {displayName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}

          <Text style={[styles.name, { color: theme.colors.text }]}>{displayName}</Text>
          <Text style={[styles.email, { color: theme.colors.textSecondary }]}>{email}</Text>
        </View>

        {/* Menu */}
        <ScrollView style={{ paddingHorizontal: 20 }}>
          <LongButton
            text="History"
            icon="Clock"
            iconColor={theme.colors.text}
            onPress={() => navigation.navigate('History' as never)}
            style={styles.menuButton}
            textStyle={{ color: theme.colors.text }}
          />

          <LongButton
            text="About Us"
            icon="Info"
            iconColor={theme.colors.text}
            onPress={() => {}}
            style={styles.menuButton}
            textStyle={{ color: theme.colors.text }}
          />

          {/* <LongButton
            text="Settings"
            icon="Settings"
            iconColor={theme.colors.text}
            onPress={() => {}}
            style={styles.menuButton}
            textStyle={{ color: theme.colors.text }}
          /> */}

          {/* Theme Switcher */}
          <LongButton
            text={`${themeMode === 'dark' ? 'Light' : 'Dark'} Mode`}
            icon={themeMode === 'dark' ? 'Sun' : 'Moon'}
            iconColor={theme.colors.text}
            onPress={toggleTheme}
            style={[styles.menuButton, { backgroundColor: theme.colors.surface }]}
            textStyle={{ color: theme.colors.text }}
          />

          {/* Logout */}
          <LongButton
            text="Logout"
            icon="LogOut"
            onPress={onLogout}
            style={{ ...styles.loginButton, backgroundColor: theme.colors.primary }}
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
  container: { flex: 1 },
  backButton: { backgroundColor: 'transparent', alignSelf: 'flex-start' },
  profileContainer: {
    alignItems: 'flex-start',
    padding: 20,
    borderBottomWidth: 1,
  },
  avatar: { width: 80, height: 80, borderRadius: 40, marginBottom: 10 },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontSize: 28,
    fontWeight: '700',
  },
  name: { fontSize: 22, fontWeight: 'bold', marginTop: 5 },
  email: { fontSize: 16 },
  menuButton: {
    marginBottom: 12,
    justifyContent: 'flex-start',
    paddingLeft: 5,
    backgroundColor: 'transparent',
  },
  loginButton: { marginBottom: 12, justifyContent: 'flex-start' },
});