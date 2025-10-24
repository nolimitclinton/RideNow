import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import TabNavigator from './TabNavigator';
import HistoryScreen from '../screens/HistoryScreen';
import SmallButton from '../components/buttons/SmallButton';
import LongButton from '../components/buttons/LongButton';
import { COLORS } from '../constants/colors';

const Drawer = createDrawerNavigator();

function CustomDrawerContent(props:any) {
  const user = {
    name: 'Nate Samson',
    email: 'nate@email.com',
    avatar: 'https://i.pravatar.cc/100?img=68',
  };

  const { navigation } = props;

  return (
    <View style={styles.container}>
      <DrawerContentScrollView {...props} contentContainerStyle={{ flexGrow: 1 }}>
        {/* 🔹 Back Button (SmallButton) */}
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

        {/* 🔹 User Profile */}
        <View style={styles.profileContainer}>
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>

        {/* 🔹 Menu Section */}
        <ScrollView style={{ paddingHorizontal: 20 }}>
          <LongButton
            text="History"
            icon="Clock"
            iconColor={COLORS.DARK_GRAY}
            onPress={() => navigation.navigate('History')}
            style={styles.menuButton}
            textStyle={{color:COLORS.DARK_GRAY}}
          />
          
          
          <LongButton
            text="About Us"
            icon="Info"
            iconColor={COLORS.DARK_GRAY}
            onPress={() => {}}
            style={styles.menuButton}
             textStyle={{color:COLORS.DARK_GRAY}}
          />
          <LongButton
            text="Settings"
            icon="Settings"
            iconColor={COLORS.DARK_GRAY}
            onPress={() =>{}}
            style={styles.menuButton}
             textStyle={{color:COLORS.DARK_GRAY}}
          />
          
          {/* 🔹 Logout */}
          <LongButton
            text="Logout"
            icon="LogOut"
            onPress={() => alert('Logged Out')}
            //  textStyle={{color:COLORS.DARK_GRAY}}
            style={{ ...styles.loginButton, backgroundColor: COLORS.DARK_GRAY }}
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
      <Drawer.Screen name="Home" component={TabNavigator} />
      <Drawer.Screen name="History" component={HistoryScreen} />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
    container:{ flex: 1, backgroundColor: COLORS.WHITE },
  backButton: {
    backgroundColor: "transparent",
    alignSelf: 'flex-start',
    color:COLORS.DARK_GRAY,
    // alignItems:"flex-start"
  },
  profileContainer: {
    alignItems: 'flex-start',
    padding: 20,
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.WHITE,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color:COLORS.DARK_GRAY,
    marginTop: 5,
  },
  email: {
    fontSize: 16,
    color: 'gray',
  },
  menuButton: {
    marginBottom: 12,
    justifyContent:"flex-start",
    backgroundColor:"transparent",
    paddingLeft:5
    
  },
  loginButton:{
    marginBottom:12,
    justifyContent:"flex-start"
  }
});

