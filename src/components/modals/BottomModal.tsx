import React, { ReactNode } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  ViewStyle,
} from 'react-native';
import { COLORS } from '../../constants/colors';

interface CustomBottomModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children?: ReactNode;
  height?: number | `${number}%`; 
  backgroundColor?: string;
  showCloseButton?: boolean;
  closeButtonText?: string;
  closeButtonColor?: string;
  closeTextColor?: string;
  modalStyle?: ViewStyle;
  disableBackgroundClose?: boolean; // ✅ new prop
}

export default function CustomBottomModal({
  visible,
  onClose,
  title = 'Modal Title',
  children,
  height = '60%',
  backgroundColor = COLORS.WHITE,
  showCloseButton = true,
  closeButtonText = 'Close',
  closeButtonColor = COLORS.GREEN,
  closeTextColor = COLORS.WHITE,
  modalStyle,
  disableBackgroundClose = true, // ✅ default: can’t close by tapping outside
}: CustomBottomModalProps) {
  const handleBackgroundPress = () => {
    if (!disableBackgroundClose) onClose();
  };

  return (
    <Modal
      transparent
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={handleBackgroundPress}
        />
        <View
          style={[
            styles.modalBox,
            { height, backgroundColor } as ViewStyle,
            modalStyle,
          ]}
        >
          {title ? <Text style={styles.modalTitle}>{title}</Text> : null}

          <View style={styles.content}>{children}</View>

          {showCloseButton && (
            <Pressable
              style={[
                styles.closeButton,
                { backgroundColor: closeButtonColor },
              ]}
              onPress={onClose}
            >
              <Text style={[styles.closeText, { color: closeTextColor }]}>
                {closeButtonText}
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    width: '100%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    alignItems: 'center',
    elevation: 8,
    shadowColor: COLORS.DARK_GRAY,
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 6,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: COLORS.DARK_GRAY,
  },
  content: {
    flex: 1,
    width: '100%',
  },
  closeButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 15,
  },
  closeText: {
    fontWeight: '600',
    textAlign: 'center',
  },
});
