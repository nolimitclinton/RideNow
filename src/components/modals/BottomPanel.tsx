import React, { useCallback, useMemo, useRef } from 'react';
import { StyleSheet } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';

export default function BottomPanel({ children }:any) {
  const bottomSheetRef = useRef(null);

  // snap points (height levels)
  const snapPoints = useMemo(() => ['25%', '50%','70%'], []);

  // handle sheet change
  const handleSheetChanges = useCallback((index:any) => {
    console.log('BottomSheet index changed:', index);
  }, []);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose={false}
    >
      <BottomSheetView style={styles.contentContainer}>
        {children}
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    padding: 16,
  },
});
