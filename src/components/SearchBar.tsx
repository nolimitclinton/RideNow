import React, { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TextInputProps,
  Pressable,
  ViewStyle,
  TextStyle,
  Platform,
} from 'react-native';
import * as LucideIcons from 'lucide-react-native';
import { COLORS } from '../constants/colors';

export type SearchBarProps = {
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  onSubmitEditing?: () => void;
  debounce?: number; // ms
  showClear?: boolean;
  leftIcon?: keyof typeof LucideIcons;
  rightIcon?: keyof typeof LucideIcons;
  iconColor?: string;
  containerStyle?: ViewStyle;
  innerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  placeholderColor?: string;
} & Omit<TextInputProps, 'onChangeText' | 'value'>;

export type SearchBarHandle = {
  focus: () => void;
  blur: () => void;
  clear: () => void;
};

const DEFAULT_LEFT_ICON: keyof typeof LucideIcons = 'Search';
const DEFAULT_CLEAR_ICON: keyof typeof LucideIcons = 'X';

export default React.forwardRef<SearchBarHandle, SearchBarProps>(function SearchBar(
  {
    value: controlledValue,
    onChangeText,
    placeholder = 'Search',
    onSubmitEditing,
    debounce = 300, // default 300ms
    showClear = true,
    leftIcon = DEFAULT_LEFT_ICON,
    rightIcon,
    iconColor = COLORS.GRAY,
    containerStyle,
    innerStyle,
    inputStyle,
    placeholderColor,
    ...rest
  },
  ref
) {
  const inputRef = useRef<TextInput | null>(null);
  const [internal, setInternal] = useState(controlledValue ?? '');
  const value = controlledValue !== undefined ? controlledValue : internal;

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    blur: () => inputRef.current?.blur(),
    clear: () => {
      handleChange('');
      inputRef.current?.clear();
    },
  }));

  const handleChange = useCallback(
    (text: string) => {
      // update internal state immediately for UI
      if (controlledValue === undefined) setInternal(text);

      // clear previous debounce
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      // call onChangeText after debounce
      if (debounce && debounce > 0) {
        timeoutRef.current = setTimeout(() => {
          onChangeText?.(text);
        }, debounce);
      } else {
        onChangeText?.(text);
      }
    },
    [debounce, onChangeText, controlledValue]
  );

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const IconLeft = useMemo(() => {
    return (LucideIcons[leftIcon] ?? LucideIcons[DEFAULT_LEFT_ICON]) as React.ComponentType<any>;
  }, [leftIcon]);

  const IconClear = useMemo(() => {
    return LucideIcons[DEFAULT_CLEAR_ICON] as React.ComponentType<any>;
  }, []);

  const IconRight = useMemo(() => {
    return rightIcon ? ((LucideIcons[rightIcon] as React.ComponentType<any>) ?? null) : null;
  }, [rightIcon]);

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={[styles.inner, innerStyle]}>
        <IconLeft color={iconColor} size={18} style={styles.leftIcon as any} />
        <TextInput
          ref={inputRef}
          style={[styles.input, inputStyle]}
          placeholder={placeholder}
          placeholderTextColor={placeholderColor || COLORS.DARK_GRAY}
          value={value}
          onChangeText={handleChange}
          returnKeyType="search"
          onSubmitEditing={() => onSubmitEditing?.()}
          underlineColorAndroid="transparent"
          {...rest}
        />
        {showClear && value?.length ? (
          <Pressable
            onPress={() => {
              if (controlledValue !== undefined) onChangeText?.('');
              else setInternal('');
              if (timeoutRef.current) clearTimeout(timeoutRef.current);
              onChangeText?.('');
              inputRef.current?.focus();
            }}
            style={styles.iconButton}
            hitSlop={6}
          >
            <IconClear color={iconColor} size={16} />
          </Pressable>
        ) : IconRight ? (
          <Pressable onPress={() => onSubmitEditing?.()} style={styles.iconButton} hitSlop={6}>
            <IconRight color={iconColor} size={18} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: { width: '100%' },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    elevation: 2,
    shadowColor: COLORS.DARK_GRAY,
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  leftIcon: { marginRight: 8 },
  input: { flex: 1, padding: 0, color: COLORS.GRAY, fontSize: 15 },
  iconButton: { paddingHorizontal: 6, paddingVertical: 4, marginLeft: 6 },
});
