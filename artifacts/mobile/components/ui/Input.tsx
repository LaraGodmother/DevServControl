import React, { useState } from "react";
import { Text, TextInput, TextInputProps, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: keyof typeof Feather.glyphMap;
  rightIcon?: keyof typeof Feather.glyphMap;
  onRightIconPress?: () => void;
}

export function Input({ label, error, icon, rightIcon, onRightIconPress, secureTextEntry, style, ...props }: InputProps) {
  const colors = useColors();
  const [isSecure, setIsSecure] = useState(secureTextEntry ?? false);

  const isPassword = secureTextEntry;

  return (
    <View style={{ marginBottom: 4 }}>
      {label && (
        <Text style={{ fontSize: 13, fontFamily: "Inter_500Medium", color: colors.foreground, marginBottom: 6 }}>
          {label}
        </Text>
      )}
      <View style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.card,
        borderRadius: colors.radius,
        borderWidth: 1,
        borderColor: error ? colors.destructive : colors.border,
        paddingHorizontal: 14,
        minHeight: 48,
      }}>
        {icon && (
          <Feather name={icon} size={18} color={colors.mutedForeground} style={{ marginRight: 10 }} />
        )}
        <TextInput
          style={[{
            flex: 1,
            color: colors.foreground,
            fontSize: 15,
            fontFamily: "Inter_400Regular",
            paddingVertical: 10,
          }, style]}
          placeholderTextColor={colors.mutedForeground}
          secureTextEntry={isSecure}
          {...props}
        />
        {isPassword ? (
          <TouchableOpacity onPress={() => setIsSecure(!isSecure)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Feather name={isSecure ? "eye" : "eye-off"} size={18} color={colors.mutedForeground} />
          </TouchableOpacity>
        ) : rightIcon ? (
          <TouchableOpacity onPress={onRightIconPress} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Feather name={rightIcon} size={18} color={colors.mutedForeground} />
          </TouchableOpacity>
        ) : null}
      </View>
      {error && (
        <Text style={{ fontSize: 12, color: colors.destructive, marginTop: 4 }}>{error}</Text>
      )}
    </View>
  );
}
