import { StyleSheet, Text, View, Pressable } from "react-native";
import React from "react";
import { useTheme } from "../../store/ThemeProvider";

export interface HistoryItemProp {
  name: string;
  carName: string;
  date: string;
  time: string;
  originName?: string;
  destinationName?: string;
  onPress?: () => void;
}

const HistoryItem = ({ name, carName, date, time, originName, destinationName, onPress }: HistoryItemProp) => {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles(theme).container,
        { backgroundColor: theme.colors.surface },
        pressed && { opacity: 0.7 }
      ]}
    >
      {/* Left side: Profile + details */}
      <View style={styles(theme).leftBlock}>
        <View style={styles(theme).avatar}>
          <Text style={styles(theme).avatarText}>
            {name.charAt(0).toUpperCase()}
          </Text>
        </View>

        <View style={{ gap: 4 }}>
          <Text style={styles(theme).name}>{name}</Text>
          <Text style={styles(theme).carName}>{carName}</Text>
        </View>
      </View>

      {/* Right side: Time + date */}
      <View style={styles(theme).rightBlock}>
        <Text style={styles(theme).timeText}>{time}</Text>
        <Text style={styles(theme).dateText}>{date}</Text>
      </View>
    </Pressable>
  );
};

export default HistoryItem;

const styles = (theme: any) =>
  StyleSheet.create({
    container: {
      padding: 16,
      marginVertical: 8,
      borderRadius: 12,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 3,
    },

    leftBlock: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },

    avatar: {
      width: 42,
      height: 42,
      borderRadius: 50,
      backgroundColor: theme.colors.primaryLight,
      alignItems: "center",
      justifyContent: "center",
    },

    avatarText: {
      color: theme.colors.text,
      fontWeight: "600",
      fontSize: 16,
    },

    name: {
      fontSize: 15,
      fontWeight: "600",
      color: theme.colors.text,
    },

    carName: {
      fontSize: 13,
      color: theme.colors.textSecondary,
    },

    rightBlock: {
      alignItems: "flex-end",
    },

    timeText: {
      fontSize: 14,
      fontWeight: "500",
      color: theme.colors.text,
    },

    dateText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
  });
