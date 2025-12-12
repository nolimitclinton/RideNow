import React, { useState } from "react";
import { View, Text, Modal, TouchableOpacity, TextInput, StyleSheet } from "react-native";
import { useTheme } from "../store/ThemeProvider";
import { Star } from "lucide-react-native";
type Props = {
  visible: boolean;
  onSubmit: (score: number, comment?: string) => void;
  onClose: () => void;
};

export default function RatingModal({ visible, onSubmit, onClose }: Props) {
  const { theme } = useTheme();
  const [score, setScore] = useState(5);
  const [comment, setComment] = useState("");

  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((i) => (
      <TouchableOpacity key={i} onPress={() => setScore(i)} style={{ marginHorizontal: 4 }}>
        {/* <Text style={{ fontSize: 28 }}>{i <= score ? "★" : "☆"}</Text> */}
        <Star size={32} color={i <= score ? theme.colors.primary : theme.colors.textSecondary} fill={i <= score ? theme.colors.primary : "none"} />
      </TouchableOpacity>
    ));
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={[styles.overlay,{ backgroundColor: theme.colors.overlay }]}>
        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.title,{ color: theme.colors.text}]}>Rate your driver</Text>
          <View style={{ flexDirection: "row", marginTop: 12 }}>{renderStars()}</View>

          <TextInput value={comment} onChangeText={setComment} placeholder="Add a short comment (optional)" placeholderTextColor={theme.colors.textSecondary} style={[styles.input,{color:theme.colors.text}]} />

          <View style={{ flexDirection: "row", marginTop: 12 }}>
            <TouchableOpacity style={[styles.button, { backgroundColor:theme.colors.error}]} onPress={onClose}>
              <Text>Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor:theme.colors.primary, marginLeft: 8 }]}
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
  overlay: { flex: 1,  justifyContent: "center", alignItems: "center" },
  card: { width: "86%", backgroundColor: "white", borderRadius: 12, padding: 20, alignItems: "center" },
  title: { fontSize: 18, fontWeight: "700" },
  input: { width: "100%", marginTop: 12,  borderColor: "#DDD", borderRadius: 8, padding: 8,borderBottomWidth:1 },
  button: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 8, alignItems: "center" },
});
