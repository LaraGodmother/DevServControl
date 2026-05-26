import React from "react";
import { Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: keyof typeof Feather.glyphMap;
  iconColor?: string;
  iconBg?: string;
  trend?: { value: number; label: string };
}

export function StatCard({ title, value, subtitle, icon, iconColor, iconBg, trend }: StatCardProps) {
  const colors = useColors();
  return (
    <View style={{
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
      flex: 1,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 2,
    }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: iconBg ?? colors.secondary, alignItems: "center", justifyContent: "center" }}>
          <Feather name={icon} size={20} color={iconColor ?? colors.primary} />
        </View>
        {trend && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Feather name={trend.value >= 0 ? "trending-up" : "trending-down"} size={14} color={trend.value >= 0 ? "#22c55e" : "#ef4444"} />
            <Text style={{ fontSize: 11, color: trend.value >= 0 ? "#22c55e" : "#ef4444", fontFamily: "Inter_600SemiBold" }}>
              {trend.value >= 0 ? "+" : ""}{trend.value}%
            </Text>
          </View>
        )}
      </View>
      <Text style={{ fontSize: 22, fontFamily: "Inter_700Bold", color: colors.foreground, marginBottom: 2 }}>{value}</Text>
      <Text style={{ fontSize: 12, fontFamily: "Inter_500Medium", color: colors.mutedForeground }}>{title}</Text>
      {subtitle ? <Text style={{ fontSize: 11, color: colors.mutedForeground, marginTop: 2 }}>{subtitle}</Text> : null}
    </View>
  );
}
