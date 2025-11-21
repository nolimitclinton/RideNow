import { Pressable, StyleSheet, Text, View } from "react-native";
import React from "react";
import { ChevronLeft } from "lucide-react-native";
import { COLORS } from "../../constants/colors";
import { useNavigation } from "@react-navigation/native";

interface HeaderProp {
  title: string;
  isBackPresent?: boolean;
}

const Header = ({ title, isBackPresent = false }: HeaderProp) => {
  const navigate = useNavigation();

  return (
    <View
      style={{
        position: "relative",
        marginBottom: 30,
        marginTop: 10,
      }}
    >
      {isBackPresent && (
        <Pressable
          onPress={() => navigate.goBack()}
          hitSlop={60}
          style={{
            flexDirection: "row",
            padding: 8,
            gap: 8,
            alignItems: "center",
            position: "absolute",
            top: "50%",
            transform: [
              {
                translateY: "-50%",
              },
            ],
          }}
        >
          <ChevronLeft />
          <Text>Back</Text>
        </Pressable>
      )}

      <Text
        style={{
          textAlign: "center",
          fontSize: 16,
          fontWeight: 500,
          color: COLORS.DARK_GRAY,
        }}
      >
        {title}
      </Text>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({});
