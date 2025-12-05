import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View, Pressable, Modal, TouchableOpacity } from 'react-native';
import { COLORS } from '../../constants/colors';
import Button from '../ui/Button';
import { Globe, Mail, Phone, User as UserIcon, Edit3 } from 'lucide-react-native';
import { useAuth } from '../../store/AuthProvider';
import { db } from '../../services/firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { logOut } from '../../services/auth';
import { updateProfile } from 'firebase/auth';

type ExtraProfile = {
  country?: string | null;
  phone?: string | null;
  gender?: string | null;
};

const Details = () => {
  const { user } = useAuth();
  const [extra, setExtra] = useState<ExtraProfile>({});

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [nameInput, setNameInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [countryInput, setCountryInput] = useState('');
  const [genderInput, setGenderInput] = useState<string>('');
  const [showGenderPicker, setShowGenderPicker] = useState(false);

  useEffect(() => {
    if (!user) return;

    const ref = doc(db, 'users', user.uid);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const data = snap.data() as any;
        const country = data.country ?? null;
        const phone = data.phone ?? null;
        const gender = data.gender ?? null;
        setExtra({ country, phone, gender });

        // sync edit inputs when not actively editing
        if (!editing) {
          setNameInput(data.name || user.displayName || '');
          setPhoneInput(phone ?? '');
          setCountryInput(country ?? '');
          setGenderInput(gender ?? '');
        }
      } else if (!editing) {
        // doc doesn't exist yet get default from auth
        setNameInput(user.displayName || '');
      }
    });

    return unsub;
  }, [user]);

  const name = user?.displayName || 'Guest';
  const email = user?.email || 'No email';
  const phone = extra.phone || 'Not set';
  const country = extra.country || 'Not set';
  const gender = extra.gender || 'Not set';

  const phoneValid =
    phoneInput.trim().length === 0 || phoneInput.trim().length === 11;

  async function onSave() {
    if (!user) return;
    if (!nameInput.trim()) {
      Alert.alert('Name required', 'Please enter your name.');
      return;
    }
    if (!phoneValid) {
      Alert.alert('Invalid phone', 'Phone number must be 11 digits.');
      return;
    }

    setSaving(true);
    try {
      // update auth profile name
      if (nameInput.trim() !== user.displayName) {
        await updateProfile(user, { displayName: nameInput.trim() });
      }

      // update Firestore user doc
      await updateDoc(doc(db, 'users', user.uid), {
        name: nameInput.trim(),
        phone: phoneInput.trim() || null,
        country: countryInput.trim() || null,
        gender: genderInput || null,
      });

      setEditing(false);
    } catch (e: any) {
      console.log('Profile save error', e);
      Alert.alert('Error', e?.message || 'Could not save your profile.');
    } finally {
      setSaving(false);
    }
  }

  if (!user) {
    return (
      <View>
        <Text style={styles.name}>Guest</Text>
        <Text style={{ color: COLORS.GRAY, marginTop: 8 }}>
          Sign in to see your profile.
        </Text>
      </View>
    );
  }

  return (
    <View>
      {/* Header row with edit button */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 8 }}>
        <Text style={[styles.name, { flex: 1, textAlign: 'left', marginTop: 0 }]}>
          {editing ? 'Edit profile' : name}
        </Text>
        {!editing && (
          <Pressable
            style={styles.editBtn}
            onPress={() => {
              setEditing(true);
              setNameInput(name);
              setPhoneInput(extra.phone ?? '');
              setCountryInput(extra.country ?? '');
              setGenderInput(extra.gender ?? '');
            }}
          >
            <Edit3 size={18} color={COLORS.GREEN} />
            <Text style={styles.editText}>Edit</Text>
          </Pressable>
        )}
      </View>

      <View style={{ gap: 20, marginTop: 8 }}>
        {/* Email – read-only */}
        <View style={styles.optionContainer}>
          <Mail color={COLORS.GRAY} />
          <Text style={styles.text}>{email}</Text>
        </View>

        {/* Phone */}
        <View style={styles.optionContainer}>
          <Phone color={COLORS.GRAY} />
          {editing ? (
            <TextInput
              value={phoneInput}
              onChangeText={setPhoneInput}
              keyboardType="phone-pad"
              placeholder="Phone (11 digits)"
              placeholderTextColor={COLORS.GRAY}
              style={[
                styles.inputInline,
                !!phoneInput && !phoneValid && { borderColor: '#FCA5A5' },
              ]}
            />
          ) : (
            <Text style={styles.text}>{phone}</Text>
          )}
        </View>

        {/* Country */}
        <View style={styles.optionContainer}>
          <Globe color={COLORS.GRAY} />
          {editing ? (
            <TextInput
              value={countryInput}
              onChangeText={setCountryInput}
              placeholder="Country"
              placeholderTextColor={COLORS.GRAY}
              style={styles.inputInline}
            />
          ) : (
            <View>
              <Text style={styles.text}>Country</Text>
              <Text style={styles.subtext}>{country}</Text>
            </View>
          )}
        </View>

        {/* Gender */}
        <View style={styles.optionContainer}>
          <UserIcon color={COLORS.GRAY} />
          {editing ? (
            <Pressable
              style={styles.genderSelect}
              onPress={() => setShowGenderPicker(true)}
            >
              <Text
                style={[
                  styles.genderText,
                  genderInput ? { color: COLORS.DARK_GRAY } : { color: COLORS.GRAY },
                ]}
              >
                {genderInput || 'Gender'}
              </Text>
              <Text style={{ color: COLORS.GRAY }}>▾</Text>
            </Pressable>
          ) : (
            <View>
              <Text style={styles.text}>Gender</Text>
              <Text style={styles.subtext}>{gender}</Text>
            </View>
          )}
        </View>

        {/* Save / Cancel when editing */}
        {editing && (
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Button
              variant="outline-green"
              title={saving ? 'Saving…' : 'Save changes'}
              onPress={onSave}
              disabled={saving}
            />
            <Button
              variant="outline-green"
              title="Cancel"
              onPress={() => setEditing(false)}
            />
          </View>
        )}

        {/* Logout */}
        <View>
          <Button variant="outline-green" title="Logout" onPress={logOut} />
        </View>
      </View>

      {/* Gender picker modal */}
      <Modal
        visible={showGenderPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowGenderPicker(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            {(['Male', 'Female', 'Other'] as const).map((g) => (
              <TouchableOpacity
                key={g}
                style={styles.modalItem}
                onPress={() => {
                  setGenderInput(g);
                  setShowGenderPicker(false);
                }}
              >
                <Text style={{ color: COLORS.DARK_GRAY, fontSize: 16 }}>{g}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.modalItem, { borderTopWidth: 1, borderColor: '#E5E7EB' }]}
              onPress={() => setShowGenderPicker(false)}
            >
              <Text style={{ color: COLORS.GRAY }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Details;

const styles = StyleSheet.create({
  name: {
    color: COLORS.DARK_GRAY,
    fontSize: 28,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 20,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_GREEN,
  },
  editText: {
    color: COLORS.GREEN,
    fontSize: 12,
    fontWeight: '600',
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
  inputInline: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 14,
    color: COLORS.DARK_GRAY,
  },
  genderSelect: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  genderText: {
    fontSize: 14,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCard: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 8,
    overflow: 'hidden',
  },
  modalItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
});