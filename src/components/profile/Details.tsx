import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { COLORS } from "../../constants/colors";
import Button from "../ui/Button";
import { Globe, Mail, Phone } from "lucide-react-native";

const profileOptions = [
  {
    email: "nate@email.com",
    number: "081123232323",
  },
];

const Details = () => {
  return (
    <View>
      <Text style={styles.name}>Nate Samson</Text>
      <View style={{ gap: 20, marginTop: 20 }}>
        <View style={styles.optionContainer}>
          <Mail color={COLORS.GRAY} />
          <Text style={styles.text}>natesamex12@gmail.com</Text>
        </View>
        <View style={styles.optionContainer}>
          <Phone color={COLORS.GRAY} />
          <Text style={styles.text}>08107022222</Text>
        </View>
        <View style={styles.optionContainer}>
          <Globe color={COLORS.GRAY} />
          <View>
            <Text style={styles.text}>Language</Text>
            <Text style={styles.subtext}>English.Us</Text>
          </View>
        </View>

        <View>
          <Button variant="outline-green" title="Logout" />
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
    fontWeight: 500,
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
  text: { color: COLORS.DARK_GRAY, fontWeight: 400, fontSize: 16 },
  subtext: { color: COLORS.GRAY, fontWeight: 400, fontSize: 12 },
});
