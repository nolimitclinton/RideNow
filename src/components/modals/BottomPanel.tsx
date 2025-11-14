import React, { useCallback, useMemo, useRef, forwardRef, useImperativeHandle } from 'react';
import { StyleSheet, Keyboard } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';

export type BottomPanelHandle = {
  snapToIndex: (index: number) => void;
};

type BottomPanelProps = {
  children: React.ReactNode;
};

const BottomPanel = forwardRef<BottomPanelHandle, BottomPanelProps>(({ children }, ref) => {
  const bottomSheetRef = useRef<BottomSheet>(null);

  const snapPoints = useMemo(() => ['25%', '50','75%'], []); 

  // Handle sheet changes
  const handleSheetChanges = useCallback((index: number) => {
 
  console.log(`BottomSheet index changed: ${index} → height: ${snapPoints[index]}`);

  if (index < 2) {
    Keyboard.dismiss(); // dismiss keyboard if not fully expanded
  }
}, []);

  // Expose snapToIndex method
  useImperativeHandle(ref, () => ({
    snapToIndex: (index: number) => {
      bottomSheetRef.current?.snapToIndex(index);
    },
  }));

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose={false}
    >
      <BottomSheetView style={styles.contentContainer}>{children}</BottomSheetView>
    </BottomSheet>
  );
});

export default BottomPanel;

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    padding: 16,
  },
});
