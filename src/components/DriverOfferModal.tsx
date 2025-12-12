import React from "react";
import { Modal, View, Text, Pressable, StyleSheet } from "react-native";
import { useTheme } from "../store/ThemeProvider";

type Props = {
  visible: boolean;
  onAccept: () => void;
  onReject: () => void;
  onClose?: () => void; 
  driverName: string | null;
  carName: string | null;
  carYear: number | null;
  plateNumber: string | null;
  price: number;
  loadingAnother?: boolean;
};

export default function DriverOfferModal({
  visible,
  onAccept,
  onReject,
  driverName,
  carName,
  carYear,
  plateNumber,
  price,
  loadingAnother,
}: Props) {
  const { theme } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={[styles.overlay, { backgroundColor: theme.colors.overlay }]}>
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            {loadingAnother ? "Finding another driver…" : "Driver found"}
          </Text>

          {!loadingAnother && (
            <>
              <View style={styles.row}>
                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Driver</Text>
                <Text style={[styles.value, { color: theme.colors.text }]}>{driverName ?? "-"}</Text>
              </View>

              <View style={styles.row}>
                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Car</Text>
                <Text style={[styles.value, { color: theme.colors.text }]}>
                  {carName ? `${carName}${carYear ? ` • ${carYear}` : ""}` : "-"}
                </Text>
              </View>

              <View style={styles.row}>
                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Plate</Text>
                <Text style={[styles.value, { color: theme.colors.text }]}>{plateNumber ?? "-"}</Text>
              </View>

              <View style={[styles.row, { marginTop: 10 }]}>
                <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Fare</Text>
                <Text style={[styles.value, { color: theme.colors.text }]}>
                  ₦{price.toLocaleString()}
                </Text>
              </View>

              <View style={styles.btnRow}>
                <Pressable
                  onPress={onReject}
                  style={({ pressed }) => [
                    styles.btn,
                    { backgroundColor: theme.colors.error },
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  <Text style={styles.btnText}>Reject</Text>
                </Pressable>

                <Pressable
                  onPress={onAccept}
                  style={({ pressed }) => [
                    styles.btn,
                    { backgroundColor: theme.colors.primary },
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  <Text style={styles.btnText}>Accept</Text>
                </Pressable>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: { width: "88%", borderRadius: 16, padding: 18 },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  row: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  label: { fontSize: 13, fontWeight: "600" },
  value: { fontSize: 14, fontWeight: "700" },
  btnRow: { flexDirection: "row", gap: 10, marginTop: 16 },
  btn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "800" },
});