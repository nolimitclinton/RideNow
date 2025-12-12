import React from "react";
import { View, Text, Modal, ActivityIndicator, TouchableOpacity, StyleSheet } from "react-native";

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
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Driver has arrived</Text>
          {driverName && <Text style={styles.sub}>{driverName} — {driverCar}</Text>}
          <Text style={styles.amount}>Amount: ₦{amount ?? "—"}</Text>

          {processing ? (
            <View style={{ alignItems: "center", marginTop: 16 }}>
              <ActivityIndicator size="large" />
              <Text style={{ marginTop: 8 }}>Processing payment...</Text>
            </View>
          ) : (
            <View style={{ marginTop: 16 }}>
              <TouchableOpacity style={[styles.button, { backgroundColor: "#0A84FF" }]} onPress={onPay}>
                <Text style={{ color: "white", fontWeight: "600" }}>Pay now</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, { backgroundColor: "#E0E0E0", marginTop: 8 }]} onPress={onCancel}>
                <Text style={{ fontWeight: "600" }}>Later</Text>
              </TouchableOpacity>
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
  amount: { marginTop: 12, fontSize: 20, fontWeight: "700" },
  button: { paddingVertical: 12, paddingHorizontal: 18, borderRadius: 8, alignItems: "center" },
});
