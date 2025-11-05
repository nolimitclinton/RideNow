import { FlatList, StyleSheet, View } from "react-native";
import React, { useState } from "react";
import { dummyhistory } from "../../constants/dummyHistory";
import HistoryItem from "./HistoryItem";
import FilterTab from "./FiterTab";

interface ItemProps {
  time: string;
  date: string;
  car: string;
  name: string;
  category: string;
}

const HistoryRender = () => {
  const [activeFilter, setActiveFilter] = useState("upcoming");

  const filteredData = dummyhistory.filter(
    (item) => item.category === activeFilter
  );

  const renderItem = ({ item }: { item: ItemProps }) => (
    <HistoryItem
      time={item.time}
      date={item.date}
      carName={item.car}
      name={item.name}
    />
  );

  return (
    <View style={{ flex: 1 }}>
      <FilterTab onFilterChange={(filter) => setActiveFilter(filter)} />
      <FlatList
        showsVerticalScrollIndicator={false}
        data={filteredData}
        renderItem={renderItem}
        keyExtractor={(_, index) => index.toString()}
      />
    </View>
  );
};

export default HistoryRender;

const styles = StyleSheet.create({});
