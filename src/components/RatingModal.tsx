import React, { useState } from "react";
import { View, Text, Modal, TouchableOpacity, TextInput, StyleSheet } from "react-native";

type Props = {
  visible: boolean;
  onSubmit: (score: number, comment?: string) => void;
  onClose: () => void;
};

export default function RatingModal({ visible, onSubmit, onClose }: Props) {
  const [score, setScore] = useState(5);
  const [comment, setComment] = useState("");

  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((i) => (
      <TouchableOpacity key={i} onPress={() => setScore(i)} style={{ marginHorizontal: 4 }}>
        <Text style={{ fontSize: 28 }}>{i <= score ? "★" : "☆"}</Text>
      </TouchableOpacity>
    ));
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Rate your driver</Text>
          <View style={{ flexDirection: "row", marginTop: 12 }}>{renderStars()}</View>

          <TextInput value={comment} onChangeText={setComment} placeholder="Add a short comment (optional)" style={styles.input} />

          <View style={{ flexDirection: "row", marginTop: 12 }}>
            <TouchableOpacity style={[styles.button, { backgroundColor: "#E0E0E0" }]} onPress={onClose}>
              <Text>Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#0A84FF", marginLeft: 8 }]}
              onPress={() => onSubmit(score, comment)}
            >
              <Text style={{ color: "white" }}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center" },
  card: { width: "86%", backgroundColor: "white", borderRadius: 12, padding: 20, alignItems: "center" },
  title: { fontSize: 18, fontWeight: "700" },
  input: { width: "100%", marginTop: 12, borderWidth: 1, borderColor: "#DDD", borderRadius: 8, padding: 8 },
  button: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 8, alignItems: "center" },
});
