import React from "react";
import { Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Card } from "./ui/Card";
import { StatusBadge } from "./ui/StatusBadge";
import { useColors } from "@/hooks/useColors";
import type { Appointment } from "@/context/DataContext";

interface AppointmentCardProps {
  appointment: Appointment;
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });
  } catch { return dateStr; }
}

export function AppointmentCard({ appointment }: AppointmentCardProps) {
  const colors = useColors();
  return (
    <Card style={{ marginBottom: 12 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
        <View style={{ width: 50, height: 50, borderRadius: 12, backgroundColor: colors.secondary, alignItems: "center", justifyContent: "center" }}>
          <Feather name="calendar" size={22} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <Text style={{ fontSize: 14, fontFamily: "Inter_600SemiBold", color: colors.foreground, flex: 1, marginRight: 8 }} numberOfLines={1}>
              {appointment.serviceName}
            </Text>
            <StatusBadge label={appointment.status} />
          </View>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Feather name="calendar" size={12} color={colors.mutedForeground} />
              <Text style={{ fontSize: 12, color: colors.mutedForeground, fontFamily: "Inter_400Regular" }} numberOfLines={1}>
                {formatDate(appointment.date)}
              </Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Feather name="clock" size={12} color={colors.mutedForeground} />
              <Text style={{ fontSize: 12, color: colors.mutedForeground }}>{appointment.time}</Text>
            </View>
          </View>
        </View>
      </View>
    </Card>
  );
}
