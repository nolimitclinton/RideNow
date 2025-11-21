import { FlatList, StyleSheet, View, Text } from "react-native";
import React, { useState, useEffect } from "react";
import { DeviceEventEmitter } from "react-native";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../../services/firebase";
import HistoryItem from "./HistoryItem";

interface ItemProps {
  time: string;
  date: string;
  car: string;
  name: string;
  category: string;
}

const HistoryRender = () => {
  const [data, setData] = useState<ItemProps[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const fetchCompletedDrives = async () => {
    try {
      const q = query(collection(db, 'completed_drives'), orderBy('completedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const drives: ItemProps[] = [];
      querySnapshot.forEach((doc) => {
        const driveData = doc.data();
        const completedAt = driveData.completedAt.toDate();
        drives.push({
          time: completedAt.toLocaleTimeString(),
          date: completedAt.toLocaleDateString(),
          car: driveData.carName,
          name: driveData.driverName,
          category: "Completed",
        });
      });
      setData(drives);
    } catch (error) {
      console.error("Error fetching completed drives:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  fetchCompletedDrives();

  // Listen for new drives
  const listener = DeviceEventEmitter.addListener('driveCompleted', () => {
    fetchCompletedDrives(); // refetch when a drive completes
  });

  // Cleanup on unmount
  return () => {
    listener.remove();
  };
}, []);


  const renderItem = ({ item }: { item: ItemProps }) => (
    <HistoryItem
      time={item.time}
      date={item.date}
      carName={item.car}
      name={item.name}
    />
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Text>Completed</Text>
      <FlatList
        showsVerticalScrollIndicator={false}
        data={data}
        renderItem={renderItem}
        keyExtractor={(_, index) => index.toString()}
      />
    </View>
  );
};

export default HistoryRender;

const styles = StyleSheet.create({});
