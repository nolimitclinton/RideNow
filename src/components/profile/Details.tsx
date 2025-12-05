import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../constants/colors';
import Button from '../ui/Button';
import { Globe, Mail, Phone, User as UserIcon  } from 'lucide-react-native';
import { useAuth } from '../../store/AuthProvider';
import { db } from '../../services/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { logOut } from '../../services/auth';
import { ScrollView } from 'react-native-gesture-handler';

type ExtraProfile = {
  country?: string | null;
  phone?: string | null;
  gender?: string | null;
};

const Details = () => {
  const { user } = useAuth();
  const [extra, setExtra] = useState<ExtraProfile>({});

  useEffect(() => {
    if (!user) return;

    const ref = doc(db, 'users', user.uid);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const data = snap.data() as any;
        setExtra({
          country: data.country ?? null,
          phone: data.phone ?? null,
          gender: data.gender ?? null,
        });
      }
    });

    return unsub;
  }, [user]);

  const name = user?.displayName || 'Guest';
  const email = user?.email || 'No email';
  const phone = extra.phone || 'Not set';
  const country = extra.country || 'Not set';
  const gender = extra.gender || 'Not set';


  return (
    <View>
      <Text style={styles.name}>{name}</Text>
      <View style={{ gap: 20, marginTop: 20 }}>
        <View style={styles.optionContainer}>
          <Mail color={COLORS.GRAY} />
          <Text style={styles.text}>{email}</Text>
        </View>
        <View style={styles.optionContainer}>
          <Phone color={COLORS.GRAY} />
          <Text style={styles.text}>{phone}</Text>
        </View>
        <View style={styles.optionContainer}>
          <Globe color={COLORS.GRAY} />
          <View>
            <Text style={styles.text}>Country</Text>
            <Text style={styles.subtext}>{country}</Text>
          </View>
        </View>
         <View style={styles.optionContainer}>
          <UserIcon color={COLORS.GRAY} />
          <View>
            <Text style={styles.text}>Gender</Text>
            <Text style={styles.subtext}>{gender}</Text>
          </View>
        </View>

        <View>
          <Button
            variant="outline-green"
            title="Logout"
            onPress={logOut}
          />
        </View>
      </View>
    </View>
  );
};

export default Details;

const styles = StyleSheet.create({
  name: {
    color: COLORS.DARK_GRAY,
    fontSize: 32,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 20,
  },
  optionContainer: {
    borderWidth: 2,
    borderColor: COLORS.LIGHT_GRAY,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  text: { color: COLORS.DARK_GRAY, fontWeight: '400', fontSize: 16 },
  subtext: { color: COLORS.GRAY, fontWeight: '400', fontSize: 12 },
});