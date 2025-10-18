import { FlatList, StyleSheet, Text, View } from "react-native";
import React from "react";
import { dummyhistory, dummyHistoryItem } from "../../constants/dummyHistory";
import HistoryItem from "./HistoryItem";

interface itemProps {
  time: string;
  date: string;
  car: string;
  name: string;
}
const HistoryRender = () => {
  const renderItem = ({ item }: { item: itemProps }) => (
    <HistoryItem
      time={item.time}
      date={item.date}
      carName={item.car}
      name={item.name}
    />
  );

  return (
    <View style={{ paddingVertical: 20 }}>
      <FlatList
        showsVerticalScrollIndicator={false}
        data={dummyhistory}
        renderItem={renderItem}
        keyExtractor={(_, index) => index.toString()}
      />
    </View>
  );
};

export default HistoryRender;

const styles = StyleSheet.create({});
