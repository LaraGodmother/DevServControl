import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Card } from "./ui/Card";
import { StatusBadge } from "./ui/StatusBadge";
import { useColors } from "@/hooks/useColors";
import type { ServiceOrder } from "@/context/DataContext";

interface ServiceCardProps {
  order: ServiceOrder;
  onPress?: () => void;
}

function formatDate(dateStr: string) {
  try { return new Date(dateStr + "T00:00:00").toLocaleDateString("pt-BR"); } catch { return dateStr; }
}

export function ServiceCard({ order, onPress }: ServiceCardProps) {
  const colors = useColors();
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Card style={{ marginBottom: 12 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={{ fontSize: 15, fontFamily: "Inter_600SemiBold", color: colors.foreground, marginBottom: 2 }} numberOfLines={1}>
              {order.serviceType}
            </Text>
            {order.clientName ? (
              <Text style={{ fontSize: 12, color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>{order.clientName}</Text>
            ) : null}
          </View>
          <StatusBadge label={order.status} />
        </View>
        <View style={{ flexDirection: "row", gap: 16 }}>
          {order.preferredDate ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
              <Feather name="calendar" size={13} color={colors.mutedForeground} />
              <Text style={{ fontSize: 12, color: colors.mutedForeground }}>{formatDate(order.preferredDate)}</Text>
            </View>
          ) : null}
          {order.preferredTime ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
              <Feather name="clock" size={13} color={colors.mutedForeground} />
              <Text style={{ fontSize: 12, color: colors.mutedForeground }}>{order.preferredTime}</Text>
            </View>
          ) : null}
          {order.amountPaid > 0 ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
              <Feather name="dollar-sign" size={13} color={colors.mutedForeground} />
              <Text style={{ fontSize: 12, color: colors.mutedForeground }}>{order.amountPaid.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</Text>
            </View>
          ) : null}
        </View>
      </Card>
    </TouchableOpacity>
  );
}
