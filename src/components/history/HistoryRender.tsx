import { FlatList, StyleSheet, View, Text, Modal, Pressable, Alert } from "react-native";
import React, { useState, useEffect } from "react";
import { DeviceEventEmitter } from "react-native";
import { collection, getDocs, query, orderBy, deleteDoc, doc, where } from "firebase/firestore";
import { db } from "../../services/firebase";
import HistoryItem from "./HistoryItem";
import { useTheme } from "../../store/ThemeProvider";
import { useAuth } from "../../store/AuthProvider";
import { X, MapPin, Clock, User, Zap, Trash2 as Trash } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ItemProps {
  id?: string;
  time: string;
  date: string;
  car: string;
  name: string;
  category: string;
  originName?: string;
  destinationName?: string;
  price?: number;
  distanceKm?: number;
  ratingScore?: number | null;
  ratingComment?: string | null;
}

const HistoryRender = () => {
  const [data, setData] = useState<ItemProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState<ItemProps | null>(null);
  const { theme } = useTheme();
  const { user } = useAuth();

  // fetch drives (extracted so it can be reused after deletion)
  const fetchCompletedDrives = async () => {
    if (!user) {
      setData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const q = query(
        collection(db, "completed_drives"),
        where("userId", "==", user.uid),         
        orderBy("completedAt", "desc")
      );

      const querySnapshot = await getDocs(q);
      const drives: ItemProps[] = [];

      querySnapshot.forEach((d) => {
        const driveData = d.data();
        const completedAt = driveData.completedAt.toDate();

        drives.push({
          id: d.id,
          time: completedAt.toLocaleTimeString(),
          date: completedAt.toLocaleDateString(),
          car: driveData.carName,
          name: driveData.driverName,
          category: "Completed",
          originName: driveData.originName,
          destinationName: driveData.destinationName,
          price: driveData.price,           
          distanceKm: driveData.distanceKm,
          ratingScore: driveData.ratingScore ?? null,
          ratingComment: driveData.ratingComment ?? null, 
        });
      });

      setData(drives);
    } catch (error) {
      console.error("Error fetching completed drives:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompletedDrives();

    const listener = DeviceEventEmitter.addListener("driveCompleted", () => {
      fetchCompletedDrives();
    });

    return () => {
      listener.remove();
    };
  }, [user?.uid]); 
  // Delete a trip with confirmation
  const deleteTrip = (id?: string) => {
    if (!id) return;
    Alert.alert(
      "Delete trip",
      "Are you sure you want to delete this trip? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "completed_drives", id));
              setSelectedTrip(null);
              fetchCompletedDrives();
            } catch (err) {
              console.error("Error deleting trip:", err);
              Alert.alert("Error", "Could not delete trip.");
            }
          },
        },
      ]
    );
  };
  const renderItem = ({ item }: { item: ItemProps }) => (
    <HistoryItem 
      //time={item.time} 
      date={item.date} 
      carName={item.car} 
      name={item.name}
      originName={item.originName}
      destinationName={item.destinationName}
      onPress={() => setSelectedTrip(item)}
      price={item.price} 
    />
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={{ color: theme.colors.textSecondary }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, paddingHorizontal: 16, }}>
      <Text style={{ marginVertical: 12, fontSize: 18, fontWeight: "600", color: theme.colors.text }}>
        Completed Trips
      </Text>

      <FlatList
        showsVerticalScrollIndicator={false}
        data={data}
        renderItem={renderItem}
        keyExtractor={(_, index) => index.toString()}
      />

      {/* Trip Details Modal */}
      <Modal
        visible={!!selectedTrip}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedTrip(null)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
          {/* Header */}
          <View style={{
            backgroundColor: theme.colors.surface,
            paddingHorizontal: 16,
            paddingVertical: 16,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
          }}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: theme.colors.text }}>
              Trip Details
            </Text>
            <Pressable
              onPress={() => setSelectedTrip(null)}
              hitSlop={20}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: theme.colors.primary + '20',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <X size={24} color={theme.colors.primary} strokeWidth={2.5} />
            </Pressable>
          </View>

          {/* Content */}
          {selectedTrip && (
            <View style={{ flex: 1, padding: 16, gap: 16 }}>
              {/* Driver Card */}
              <View style={{
                backgroundColor: theme.colors.surface,
                borderRadius: 16,
                padding: 16,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
              }}>
                <View style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: theme.colors.primary + '15',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                  <User size={28} color={theme.colors.primary} strokeWidth={1.5} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: theme.colors.text }}>
                    {selectedTrip.name}
                  </Text>
                  <Text style={{ fontSize: 14, color: theme.colors.textSecondary, marginTop: 4 }}>
                    {selectedTrip.car}
                  </Text>
                </View>
              </View>

              {/* Route Card */}
              <View style={{
                backgroundColor: theme.colors.surface,
                borderRadius: 16,
                padding: 16,
                gap: 12,
              }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: theme.colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Route
                </Text>
                
                {/* Origin */}
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                  <View style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: theme.colors.primary + '15',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                    <MapPin size={18} color={theme.colors.primary} strokeWidth={2} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 12, color: theme.colors.textSecondary, fontWeight: '500' }}>From</Text>
                    <Text style={{ fontSize: 15, fontWeight: '600', color: theme.colors.text, marginTop: 4 }}>
                      {selectedTrip.originName || 'Unknown Location'}
                    </Text>
                  </View>
                </View>

                {/* Divider */}
                <View style={{ height: 24, justifyContent: 'center' }}>
                  <View style={{ height: 1, backgroundColor: theme.colors.border }} />
                </View>

                {/* Destination */}
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                  <View style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: theme.colors.primary + '15',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                    <Zap size={18} color={theme.colors.primary} strokeWidth={2} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 12, color: theme.colors.textSecondary, fontWeight: '500' }}>To</Text>
                    <Text style={{ fontSize: 15, fontWeight: '600', color: theme.colors.text, marginTop: 4 }}>
                      {selectedTrip.destinationName || 'Unknown Location'}
                    </Text>
                  </View>
                </View>
              </View>

             {/* Trip Info Card */}
              <View
                style={{
                  backgroundColor: theme.colors.surface,
                  borderRadius: 16,
                  padding: 16,
                  gap: 12,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: theme.colors.textSecondary,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  Trip Info
                </Text>

                {/* Date & Time */}
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <Clock size={20} color={theme.colors.primary} strokeWidth={2} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, color: theme.colors.textSecondary }}>
                      Date & Time
                    </Text>
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: "600",
                        color: theme.colors.text,
                        marginTop: 4,
                      }}
                    >
                      {selectedTrip.date} at {selectedTrip.time}
                    </Text>
                  </View>
                </View>

                {/* Fare */}
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <Zap size={20} color={theme.colors.primary} strokeWidth={2} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, color: theme.colors.textSecondary }}>
                      Fare
                    </Text>
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: "600",
                        color: theme.colors.text,
                        marginTop: 4,
                      }}
                    >
                      {selectedTrip.price != null
                        ? `₦${selectedTrip.price.toLocaleString()}`
                        : "Not available"}
                    </Text>
                  </View>
                </View>
              </View>
               {/* Rating card */}
               <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <User size={20} color={theme.colors.primary} strokeWidth={2} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, color: theme.colors.textSecondary }}>Rating</Text>
                    <Text style={{ fontSize: 15, fontWeight: "600", color: theme.colors.text, marginTop: 4 }}>
                      {selectedTrip.ratingScore != null ? `${selectedTrip.ratingScore}/5` : "Not rated"}
                    </Text>

                    {!!selectedTrip.ratingComment && (
                      <Text style={{ marginTop: 6, fontSize: 13, color: theme.colors.textSecondary }}>
                        {selectedTrip.ratingComment}
                      </Text>
                    )}
                  </View>
                </View>
              {/* Delete button */}
              <View style={{ paddingHorizontal: 0, paddingTop: 8 }}>
                <Pressable
                  onPress={() => deleteTrip(selectedTrip?.id)}
                  style={{
                    marginTop: 8,
                    backgroundColor: '#ff4d4f',
                    paddingVertical: 12,
                    borderRadius: 12,
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  <Trash size={18} color="#fff" />
                  <Text style={{ color: '#fff', fontWeight: '700' }}>Delete Trip</Text>
                </Pressable>
              </View>
            </View>
          )}
        </SafeAreaView>
      </Modal>
    </View>
  );
};

export default HistoryRender;

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
