import { Image, Pressable, View } from "react-native";
import { Camera } from "lucide-react-native";
import { COLORS } from "../../constants/colors";

export default function Avatar({ user }: { user: any }) {
  const photo = user?.photoURL;

  return (
    <View style={{ alignItems: "center" }}>
      <View style={{ position: "relative" }}>
        <Image
          source={
            photo
              ? { uri: photo }
              : require("../../../assets/icons/profile.png")
          }
          style={{
            width: 200,
            height: 200,
            borderRadius: 100,
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
            borderRadius: 100,
            alignItems: "center",
            justifyContent: "center",
            position: "absolute",
            bottom: 10,
            right: 0,
          }}
        >
          <Camera />
        </Pressable>
      </View>
    </View>
  );
}