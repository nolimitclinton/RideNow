import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Mail, Phone, Globe } from "lucide-react-native";
import { COLORS } from "../../constants/colors";
import Button from "../ui/Button";
import { logOut } from "../../services/auth";
import type { User } from "firebase/auth";

type Props = {
  user?: User | null;
};

const Details: React.FC<Props> = ({ user }) => {
  const name = user?.displayName ?? "No name";
  const email = user?.email ?? "No email";
  const phone = user?.phoneNumber ?? "No phone";

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
            <Text style={styles.text}>Language</Text>
            <Text style={styles.subtext}>English (US)</Text>
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
    fontWeight: "600",
    textAlign: "center",
    marginTop: 20,
  },
  optionContainer: {
    borderWidth: 2,
    borderColor: COLORS.LIGHT_GRAY,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  text: { color: COLORS.DARK_GRAY, fontSize: 16 },
  subtext: { color: COLORS.GRAY, fontSize: 12 },
});