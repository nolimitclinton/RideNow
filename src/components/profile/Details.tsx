import React, { useEffect, useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Mail, Phone, Globe, User as UserIcon, Edit3, Check, X } from 'lucide-react-native';
import { useAuth } from '../../store/AuthProvider';
import { db } from '../../services/firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { logOut } from '../../services/auth';
import Button from '../ui/Button';
import { useTheme } from '../../store/ThemeProvider';
import { COLORS } from '../../constants/colors';

type ExtraProfile = {
  country?: string | null;
  phone?: string | null;
  gender?: string | null;
};

const Details = () => {
  const { user } = useAuth();
  const { theme } = useTheme();

  const [extra, setExtra] = useState<ExtraProfile>({});
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [nameInput, setNameInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [countryInput, setCountryInput] = useState('');
  const [genderInput, setGenderInput] = useState('');
  const [showGenderPicker, setShowGenderPicker] = useState(false);

  // Fetch user data
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

        if (!editing) {
          setNameInput(data.name || user.displayName || '');
          setPhoneInput(data.phone || '');
          setCountryInput(data.country || '');
          setGenderInput(data.gender || '');
        }
      } else {
        setNameInput(user.displayName || '');
      }
    });

    return unsub;
  }, [user]);

  // Save function
  async function onSave() {
    if (!user) return;

    if (!nameInput.trim()) {
      Alert.alert('Name required', 'Please enter your name.');
      return;
    }

    if (phoneInput && phoneInput.length !== 11) {
      Alert.alert('Invalid phone', 'Phone number must be 11 digits.');
      return;
    }

    setSaving(true);

    try {
      if (nameInput.trim() !== user.displayName) {
        await updateProfile(user, { displayName: nameInput.trim() });
      }

      await updateDoc(doc(db, 'users', user.uid), {
        name: nameInput.trim(),
        phone: phoneInput.trim() || null,
        country: countryInput.trim() || null,
        gender: genderInput || null,
      });

      setEditing(false);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Could not save profile.');
    } finally {
      setSaving(false);
    }
  }

  if (!user) {
    return (
      <View style={{ padding: 20 }}>
        <Text style={styles(theme).title}>Guest</Text>
        <Text style={styles(theme).labelCenter}>Sign in to view your profile</Text>
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        paddingHorizontal: 18,
        paddingTop: 20,
        paddingBottom: editing ? 140 : 40, // space for bottom bar
      }}
    >
      {/* Header */}
      <View style={styles(theme).headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles(theme).title}>{editing ? 'Edit Profile' : user.displayName}</Text>
          {!editing && <Text style={styles(theme).subtitle}>{user.email}</Text>}
        </View>

        {!editing && (
          <Pressable onPress={() => setEditing(true)} style={styles(theme).editBtn}>
            <Edit3 size={20} color={theme.colors.primary} strokeWidth={2.4} />
          </Pressable>
        )}
      </View>

      {/* Form Fields */}
      <ScrollView
        style={{ marginTop: 16 }}
        contentContainerStyle={{ gap: 14, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* NAME */}
        {editing && (
          <ProfileRow
            icon={<UserIcon size={20} color={theme.colors.primary} />}
            label="Name"
            editable
            inputValue={nameInput}
            onChangeText={setNameInput}
            placeholder="Enter your name"
            theme={theme}
          />
        )}

        {/* EMAIL */}
        <ProfileRow
          icon={<Mail size={20} color={theme.colors.primary} />}
          label="Email"
          value={user.email}
          theme={theme}
        />

        {/* PHONE */}
        <ProfileRow
          icon={<Phone size={20} color={theme.colors.primary} />}
          label="Phone"
          value={extra.phone || 'Not set'}
          editable={editing}
          inputValue={phoneInput}
          onChangeText={setPhoneInput}
          placeholder="Enter phone"
          theme={theme}
        />

        {/* COUNTRY */}
        <ProfileRow
          icon={<Globe size={20} color={theme.colors.primary} />}
          label="Country"
          value={extra.country || 'Not set'}
          editable={editing}
          inputValue={countryInput}
          onChangeText={setCountryInput}
          placeholder="Enter country"
          theme={theme}
        />

        {/* GENDER */}
        <View style={styles(theme).rowBox}>
          <View style={styles(theme).iconBox}>
            <UserIcon size={20} color={theme.colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles(theme).label}>Gender</Text>
            {editing ? (
              <Pressable onPress={() => setShowGenderPicker(true)} style={styles(theme).selectBox}>
                <Text style={styles(theme).value}>{genderInput || 'Select Gender'}</Text>
                <Text style={{ color: theme.colors.textSecondary }}>▼</Text>
              </Pressable>
            ) : (
              <Text style={styles(theme).value}>{extra.gender || 'Not set'}</Text>
            )}
          </View>
        </View>
      </ScrollView>

      {/* GENDER PICKER */}
      <Modal visible={showGenderPicker} transparent animationType="slide">
        <View style={styles(theme).modalOverlay}>
          <View style={styles(theme).sheet}>
            <Text style={styles(theme).sheetTitle}>Select Gender</Text>
            {['Male', 'Female', 'Other'].map((g) => (
              <TouchableOpacity
                key={g}
                style={styles(theme).sheetItem}
                onPress={() => {
                  setGenderInput(g);
                  setShowGenderPicker(false);
                }}
              >
                <Text style={styles(theme).sheetItemText}>{g}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles(theme).sheetCancel} onPress={() => setShowGenderPicker(false)}>
              <Text style={styles(theme).sheetCancelText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* SAVE / CANCEL */}
      {editing ? (
        <View style={styles(theme).bottomBar}>
          <Pressable style={styles(theme).saveBtn} onPress={onSave}>
            <Check size={20} color={COLORS.WHITE} />
            <Text style={styles(theme).saveText}>{saving ? 'Saving...' : 'Save'}</Text>
          </Pressable>

          <Pressable style={styles(theme).cancelBtn} onPress={() => setEditing(false)}>
            <X size={20} color={theme.colors.textSecondary} />
            <Text style={styles(theme).cancelText}>Cancel</Text>
          </Pressable>
        </View>
      ) : (
        <View style={{ marginTop: 100 }}>
          <Button title="Logout" variant="outline-green" onPress={logOut} />
        </View>
      )}
    </View>
  );
};

export default Details;

// -------------------------------
// Reusable Profile Row
// -------------------------------
const ProfileRow = ({ icon, label, value, editable, inputValue, placeholder, onChangeText, theme }: any) => (
  <View style={styles(theme).rowBox}>
    <View style={styles(theme).iconBox}>{icon}</View>
    <View style={{ flex: 1 }}>
      <Text style={styles(theme).label}>{label}</Text>
      {editable ? (
        <TextInput
          value={inputValue}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textSecondary}
          style={styles(theme).input}
        />
      ) : (
        <Text style={styles(theme).value}>{value || 'Not set'}</Text>
      )}
    </View>
  </View>
);

// -------------------------------
// Styles – Uber/Bolt Inspired
// -------------------------------
const styles = (theme: any) =>
  StyleSheet.create({
    title: { fontSize: 28, fontWeight: '700', color: theme.colors.text },
    subtitle: { fontSize: 13, fontWeight: '400', color: theme.colors.textSecondary, marginTop: 4 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    labelCenter: { color: theme.colors.textSecondary, textAlign: 'center', marginTop: 10 },
    editBtn: { backgroundColor: theme.colors.primary + '20', padding: 10, borderRadius: 100 },
    rowBox: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderRadius: 16,
      backgroundColor: theme.colors.surface,
      elevation: 2,
      gap: 16,
    },
    iconBox: {
      width: 48,
      height: 48,
      borderRadius: 14,
      backgroundColor: theme.colors.primary + '15',
      justifyContent: 'center',
      alignItems: 'center',
    },
    label: { fontSize: 13, fontWeight: '500', color: theme.colors.textSecondary, marginBottom: 4, letterSpacing: 0.3, textTransform: 'uppercase' },
    value: { fontSize: 16, fontWeight: '600', color: theme.colors.text },
    input: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: theme.colors.border, color: theme.colors.text, fontSize: 16 },
    selectBox: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: theme.colors.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    bottomBar: {
      position: 'absolute',
      bottom: 20,
      left: 16,
      right: 16,
      padding: 14,
      backgroundColor: theme.colors.surface,
      borderRadius: 18,
      flexDirection: 'row',
      gap: 12,
      elevation: 10,
    },
    saveBtn: { flex: 1, flexDirection: 'row', backgroundColor: theme.colors.primary, paddingVertical: 12, borderRadius: 12, justifyContent: 'center', alignItems: 'center', gap: 8 },
    saveText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    cancelBtn: { flex: 1, flexDirection: 'row', borderWidth: 1.5, borderColor: theme.colors.border, paddingVertical: 12, borderRadius: 12, justifyContent: 'center', alignItems: 'center', gap: 8 },
    cancelText: { color: theme.colors.textSecondary, fontSize: 16 },
    modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
    sheet: { backgroundColor: theme.colors.surface, padding: 20, borderTopLeftRadius: 22, borderTopRightRadius: 22 },
    sheetTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.text, marginBottom: 12 },
    sheetItem: { paddingVertical: 14 },
    sheetItemText: { fontSize: 16, color: theme.colors.text, fontWeight: '500' },
    sheetCancel: { paddingVertical: 14, marginTop: 12, borderTopWidth: 1, borderColor: theme.colors.border },
    sheetCancelText: { fontSize: 16, textAlign: 'center', fontWeight: '600', color: theme.colors.primary },
  });
