import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, ViewStyle, StyleProp } from "react-native";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";

interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: "primary" | "secondary" | "danger" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  icon?: React.ReactNode;
}

export function Button({ title, onPress, variant = "primary", size = "md", loading, disabled, style, icon }: ButtonProps) {
  const colors = useColors();

  const bgMap: Record<string, string> = {
    primary: colors.primary, secondary: colors.secondary, danger: colors.destructive,
    ghost: "transparent", outline: "transparent",
  };
  const fgMap: Record<string, string> = {
    primary: colors.primaryForeground, secondary: colors.secondaryForeground, danger: colors.destructiveForeground,
    ghost: colors.foreground, outline: colors.primary,
  };
  const borderMap: Record<string, string> = {
    primary: "transparent", secondary: "transparent", danger: "transparent",
    ghost: "transparent", outline: colors.primary,
  };
  const paddingMap: Record<string, number> = { sm: 10, md: 14, lg: 18 };
  const fontSizeMap: Record<string, number> = { sm: 13, md: 15, lg: 16 };

  const handlePress = () => {
    if (disabled || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onPress?.();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.75}
      disabled={disabled || loading}
      style={[{
        backgroundColor: disabled ? colors.muted : bgMap[variant],
        borderRadius: colors.radius,
        borderWidth: variant === "outline" ? 1.5 : 0,
        borderColor: disabled ? colors.border : borderMap[variant],
        paddingVertical: paddingMap[size],
        paddingHorizontal: paddingMap[size] * 1.5,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        opacity: disabled ? 0.6 : 1,
      }, style]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={disabled ? colors.mutedForeground : fgMap[variant]} />
      ) : (
        <>
          {icon}
          <Text style={{ color: disabled ? colors.mutedForeground : fgMap[variant], fontSize: fontSizeMap[size], fontFamily: "Inter_600SemiBold" }}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}
