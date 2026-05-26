import React, { useMemo, useState } from "react";
import { ActivityIndicator, Platform, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useData } from "@/context/DataContext";
import { Card } from "@/components/ui/Card";
import { openExportUrl } from "@/lib/exportCsv";
import { BRAND } from "@/constants/theme";

function fmt(v: number) { return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); }
function pct(v: number) { return `${v.toFixed(1)}%`; }
function isInPeriod(dateStr: string, period: string): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  if (period === "total") return true;
  if (period === "mes") return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  if (period === "trimestre") return Math.floor(d.getMonth() / 3) === Math.floor(now.getMonth() / 3) && d.getFullYear() === now.getFullYear();
  if (period === "ano") return d.getFullYear() === now.getFullYear();
  return true;
}

const PERIODS = [{ key: "mes", label: "Mês" }, { key: "trimestre", label: "Trim." }, { key: "ano", label: "Ano" }, { key: "total", label: "Total" }];

export default function AdminFinanceiroScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const { orders, budgets, loading, loadAll } = useData();
  const [period, setPeriod] = useState("mes");

  const stats = useMemo(() => {
    const doneOrders = orders.filter(o => o.status === "concluido" && isInPeriod(o.createdAt, period));
    const paidBudgets = budgets.filter(b => b.status === "fechado" && isInPeriod(b.createdAt, period));
    const totalRevenue = doneOrders.reduce((s, o) => s + (o.amountPaid || 0), 0);
    const budgetRevenue = paidBudgets.reduce((s, b) => s + b.finalValue, 0);
    const combined = totalRevenue + budgetRevenue;
    const totalOrders = orders.filter(o => isInPeriod(o.createdAt, period));
    const pendingOrders = totalOrders.filter(o => o.status === "pendente" || o.status === "em_andamento");
    const pendingValue = pendingOrders.reduce((s, o) => s + (o.serviceBasePrice || 0), 0);
    const serviceBreakdown: Record<string, number> = {};
    doneOrders.forEach(o => { serviceBreakdown[o.serviceType] = (serviceBreakdown[o.serviceType] || 0) + (o.amountPaid || 0); });
    return { totalRevenue: combined, totalOrders: totalOrders.length, doneOrders: doneOrders.length, pendingValue, serviceBreakdown };
  }, [orders, budgets, period]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingTop: topInset + 12, paddingBottom: 12, paddingHorizontal: 20, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <TouchableOpacity onPress={() => router.back()}><Feather name="arrow-left" size={22} color={colors.primary} /></TouchableOpacity>
          <Text style={{ flex: 1, fontSize: 20, fontFamily: "Inter_700Bold", color: colors.foreground }}>Financeiro</Text>
          <TouchableOpacity onPress={() => openExportUrl("/export/financeiro.csv")}><Feather name="download" size={20} color={colors.primary} /></TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/admin/financeiro-pessoal" as any)} style={{ marginLeft: 8 }}>
            <Feather name="user" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {PERIODS.map(p => (
              <TouchableOpacity key={p.key} onPress={() => setPeriod(p.key)} style={{ paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, backgroundColor: period === p.key ? BRAND.colors.primary : colors.muted }}>
                <Text style={{ fontSize: 13, fontFamily: "Inter_500Medium", color: period === p.key ? "#fff" : colors.mutedForeground }}>{p.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <ScrollView refreshControl={<RefreshControl refreshing={loading} onRefresh={loadAll} />} contentContainerStyle={{ padding: 16, gap: 14 }}>
        <Card>
          <Text style={{ fontSize: 13, color: colors.mutedForeground, marginBottom: 4 }}>Receita Total</Text>
          <Text style={{ fontSize: 30, fontFamily: "Inter_700Bold", color: BRAND.colors.primary }}>{fmt(stats.totalRevenue)}</Text>
          <Text style={{ fontSize: 12, color: colors.mutedForeground, marginTop: 4 }}>{stats.doneOrders} ordens concluídas</Text>
        </Card>

        <View style={{ flexDirection: "row", gap: 12 }}>
          <Card style={{ flex: 1 }}>
            <Feather name="tool" size={20} color="#22c55e" style={{ marginBottom: 8 }} />
            <Text style={{ fontSize: 13, color: colors.mutedForeground }}>Total Ordens</Text>
            <Text style={{ fontSize: 22, fontFamily: "Inter_700Bold", color: colors.foreground }}>{stats.totalOrders}</Text>
          </Card>
          <Card style={{ flex: 1 }}>
            <Feather name="clock" size={20} color="#f59e0b" style={{ marginBottom: 8 }} />
            <Text style={{ fontSize: 13, color: colors.mutedForeground }}>Em Aberto</Text>
            <Text style={{ fontSize: 22, fontFamily: "Inter_700Bold", color: colors.foreground }}>{fmt(stats.pendingValue)}</Text>
          </Card>
        </View>

        {Object.keys(stats.serviceBreakdown).length > 0 && (
          <Card>
            <Text style={{ fontSize: 15, fontFamily: "Inter_600SemiBold", color: colors.foreground, marginBottom: 12 }}>Receita por Serviço</Text>
            {Object.entries(stats.serviceBreakdown).sort((a, b) => b[1] - a[1]).map(([name, value]) => {
              const pctVal = stats.totalRevenue > 0 ? (value / stats.totalRevenue) * 100 : 0;
              return (
                <View key={name} style={{ marginBottom: 12 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                    <Text style={{ fontSize: 13, color: colors.foreground }} numberOfLines={1}>{name}</Text>
                    <Text style={{ fontSize: 13, fontFamily: "Inter_600SemiBold", color: colors.primary }}>{fmt(value)}</Text>
                  </View>
                  <View style={{ height: 6, borderRadius: 3, backgroundColor: colors.muted }}>
                    <View style={{ height: 6, borderRadius: 3, backgroundColor: BRAND.colors.primary, width: `${pctVal}%` as any }} />
                  </View>
                </View>
              );
            })}
          </Card>
        )}
      </ScrollView>
    </View>
  );
}
