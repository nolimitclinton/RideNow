// components/SearchBar.tsx
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
  debounce?: number; // ms, 0 = no debounce
  showClear?: boolean;
  leftIcon?: keyof typeof LucideIcons; // e.g. "Search"
  rightIcon?: keyof typeof LucideIcons; // optional custom right icon (when not showing clear)
  iconColor?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
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
    debounce = 0,
    showClear = true,
    leftIcon = DEFAULT_LEFT_ICON,
    rightIcon,
    iconColor = COLORS.GRAY,
    containerStyle,
    inputStyle,
    ...rest
  },
  ref
) {
  const inputRef = useRef<TextInput | null>(null);
  const [internal, setInternal] = useState(controlledValue ?? '');
  const value = controlledValue !== undefined ? controlledValue : internal;

  // expose imperative methods
  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    blur: () => inputRef.current?.blur(),
    clear: () => {
      handleChange('');
      inputRef.current?.clear();
    },
  }));

  // debounce handler
  const debouncedOnChange = useRef<number | null>(null);
  useEffect(() => {
    return () => {
      if (debouncedOnChange.current) {
        clearTimeout(debouncedOnChange.current);
      }
    };
  }, []);

  const handleChange = useCallback(
    (text: string) => {
      if (debounce && debounce > 0) {
        if (debouncedOnChange.current) clearTimeout(debouncedOnChange.current);
        debouncedOnChange.current = setTimeout(() => {
          onChangeText?.(text);
          debouncedOnChange.current = null;
        }, debounce) as unknown as number;
      } else {
        onChangeText?.(text);
      }

      // update internal state only when uncontrolled
      if (controlledValue === undefined) {
        setInternal(text);
      }
    },
    [debounce, onChangeText, controlledValue]
  );

  const IconLeft = useMemo(() => {
    return (LucideIcons[leftIcon] ?? LucideIcons[DEFAULT_LEFT_ICON]) as React.ComponentType<any>;
  }, [leftIcon]);

  const IconClear = useMemo(() => {
    return (LucideIcons[DEFAULT_CLEAR_ICON] as React.ComponentType<any>);
  }, []);

  const IconRight = useMemo(() => {
    return rightIcon ? ((LucideIcons[rightIcon] as React.ComponentType<any>) ?? null) : null;
  }, [rightIcon]);

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.inner}>
        <IconLeft color={iconColor} size={18} style={styles.leftIcon as any} />
        <TextInput
          ref={inputRef}
          style={[styles.input, inputStyle]}
          placeholder={placeholder}
          placeholderTextColor={COLORS.DARK_GRAY}
          value={value}
          onChangeText={handleChange}
          returnKeyType="search"
          onSubmitEditing={() => onSubmitEditing?.()}
          underlineColorAndroid="transparent"
          {...rest}
        />

        {/* right side: clear button or custom icon */}
        {showClear && value?.length ? (
          <Pressable
            onPress={() => {
              // clear immediately
              if (controlledValue !== undefined) {
                onChangeText?.('');
              } else {
                setInternal('');
              }
              // also clear any pending debounced calls
              if (debouncedOnChange.current) {
                clearTimeout(debouncedOnChange.current);
                debouncedOnChange.current = null;
              }
              // trigger change callback with empty string
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
  container: {
    width: '100%',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    elevation: 2,
    shadowColor: COLORS.DARK_GRAY,
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  leftIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    padding: 0,
    color: COLORS.GRAY,
    fontSize: 15,
  },
  iconButton: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    marginLeft: 6,
  },
});
