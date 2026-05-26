import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Card } from "./ui/Card";
import { StatusBadge } from "./ui/StatusBadge";
import { useColors } from "@/hooks/useColors";
import type { Budget } from "@/context/DataContext";

interface BudgetCardProps {
  budget: Budget;
  onPress?: () => void;
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function formatDate(dateStr: string) {
  try { return new Date(dateStr).toLocaleDateString("pt-BR"); } catch { return dateStr; }
}

export function BudgetCard({ budget, onPress }: BudgetCardProps) {
  const colors = useColors();
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Card style={{ marginBottom: 12 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={{ fontSize: 15, fontFamily: "Inter_600SemiBold", color: colors.foreground, marginBottom: 2 }} numberOfLines={1}>
              {budget.serviceType}
            </Text>
            {budget.clientName ? (
              <Text style={{ fontSize: 12, color: colors.mutedForeground }}>{budget.clientName}</Text>
            ) : null}
          </View>
          <StatusBadge label={budget.status} />
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ fontSize: 16, fontFamily: "Inter_700Bold", color: colors.primary }}>
            {formatCurrency(budget.finalValue)}
          </Text>
          <Text style={{ fontSize: 12, color: colors.mutedForeground }}>{formatDate(budget.createdAt)}</Text>
        </View>
      </Card>
    </TouchableOpacity>
  );
}
