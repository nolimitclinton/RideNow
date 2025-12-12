import React from "react";
import { View, Text, Modal, ActivityIndicator, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "../store/ThemeProvider";
import LongButton from "./buttons/LongButton";
import SmallButton from "./buttons/SmallButton";
type Props = {
  visible: boolean;
  amount: number | null;
  driverName?: string | null;
  driverCar?: string | null;
  processing?: boolean;
  onPay: () => void;
  onCancel: () => void;
};

export default function PaymentModal({ visible, amount, driverName, driverCar, processing, onPay, onCancel }: Props) {
  const { theme } = useTheme();
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={[styles.overlay, { backgroundColor: theme.colors.overlay }]}>
        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.title,{ color: theme.colors.text}]}>Driver has arrived</Text>
          {driverName && <Text style={[styles.sub,{ color: theme.colors.textSecondary}]}>{driverName} — {driverCar}</Text>}
          <Text style={[styles.amount,{ color: theme.colors.text}]}>Amount: ₦{amount ?? "—"}</Text>

          {processing ? (
            <View style={{ alignItems: "center", marginTop: 16 }}>
              <ActivityIndicator size="large" />
              <Text style={{ marginTop: 8, color:theme.colors.primary }}>Processing payment...</Text>
            </View>
          ) : (
            <View style={{ marginTop: 16, }}>
          <SmallButton
            text="Pay"
            icon="CreditCard"
            iconColor={theme.colors.text}
            onPress={onPay}
            style={styles.menuButton}
            textStyle={{ color: theme.colors.text,}}
          />
          
              
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center" },
  card: { width: "86%", backgroundColor: "white", borderRadius: 12, padding: 20, alignItems: "center" },
  title: { fontSize: 18, fontWeight: "700" },
  sub: { marginTop: 6, color: "#666" },
  menuButton: {
    marginBottom: 12,
    justifyContent: 'flex-start',
    paddingLeft: 5,
   alignContent: 'center',
   textAlign:"center" 
  },
  amount: { marginTop: 12, fontSize: 20, fontWeight: "700" },
  button: { paddingVertical: 12, paddingHorizontal: 18, borderRadius: 8, alignItems: "center" },
});
