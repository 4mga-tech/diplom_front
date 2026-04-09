import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
    View,
} from "react-native";
import { theme } from "./theme";

type Props = TextInputProps & {
  error?: string;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
};

export function FormInput({
  error,
  rightIcon,
  onRightIconPress,
  ...props
}: Props) {
  return (
    <View style={{ gap: 8 }}>
      <View style={[styles.inputWrap, !!error && styles.inputWrapError]}>
        <TextInput
          {...props}
          placeholderTextColor={theme.colors.muted}
          style={styles.input}
          autoCorrect={false}
        />

        {rightIcon ? (
          <Pressable
            onPress={onRightIconPress}
            hitSlop={10}
            style={styles.iconBtn}
          >
            <Ionicons name={rightIcon} size={20} color={theme.colors.muted} />
          </Pressable>
        ) : null}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: theme.r.lg,
    paddingHorizontal: theme.s(2),
    paddingVertical: theme.s(1.5),
    backgroundColor: "rgba(30,41,59,0.35)", // slate feel
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  inputWrapError: {
    borderColor: "rgba(239,68,68,0.8)",
  },
  input: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 16,
    paddingVertical: 0,
  },
  iconBtn: {
    paddingLeft: theme.s(1),
  },
  error: {
    color: "rgba(239,68,68,0.95)",
    fontSize: 12,
    fontWeight: "600",
  },
});
