import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import React from "react";
import { Camera } from "lucide-react-native";
import { COLORS } from "../../constants/colors";

const Avatar = () => {
  return (
    <View style={{ alignItems: "center" }}>
      <View style={{ position: "relative" }}>
        <Image
          source={require("../../../assets/icons/profile.png")}
          style={{
            width: 200,
            height: 200,
          }}
        />
        <Pressable
          hitSlop={20}
          style={{
            backgroundColor: COLORS.EXTRA_LIGHT_GREEN,
            height: 40,
            width: 40,
            borderWidth: 2,
            borderColor: COLORS.LIGHT_GREEN,
            borderRadius: "100%",
            alignItems: "center",
            justifyContent: "center",
            position: "absolute",
            bottom: 10,
            right: 0,
            transform: [{ translateX: "-45%" }],
          }}
        >
          <Camera />
        </Pressable>
      </View>
    </View>
  );
};

export default Avatar;

const styles = StyleSheet.create({});
