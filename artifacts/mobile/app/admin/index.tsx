import React, { useEffect } from "react";
import { Image, Platform, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { useNotifications } from "@/context/NotificationContext";
import { StatCard } from "@/components/StatCard";
import { BRAND } from "@/constants/theme";

const MENU_ITEMS: { icon: keyof typeof Feather.glyphMap; label: string; route: string; color: string; bg: string }[] = [
  { icon: "users", label: "Clientes", route: "/admin/clients", color: "#3b82f6", bg: "#dbeafe" },
  { icon: "settings", label: "Serviços", route: "/admin/services", color: "#8b5cf6", bg: "#ede9fe" },
  { icon: "file-text", label: "Orçamentos", route: "/admin/budgets", color: "#f59e0b", bg: "#fef3c7" },
  { icon: "tool", label: "Ordens", route: "/admin/orders", color: "#22c55e", bg: "#dcfce7" },
  { icon: "message-circle", label: "Chat", route: "/admin/chat", color: "#06b6d4", bg: "#cffafe" },
  { icon: "trending-up", label: "Financeiro", route: "/admin/financeiro", color: "#10b981", bg: "#d1fae5" },
  { icon: "calendar", label: "Calendário", route: "/admin/calendar", color: "#f97316", bg: "#ffedd5" },
  { icon: "clock", label: "Agenda", route: "/admin/schedule", color: "#6366f1", bg: "#e0e7ff" },
  { icon: "shopping-bag", label: "Loja", route: "/admin/loja", color: "#ec4899", bg: "#fce7f3" },
  { icon: "user", label: "Perfil", route: "/admin/perfil", color: "#64748b", bg: "#f1f5f9" },
];

export default function AdminDashboard() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { orders, budgets, appointments, clients, loading, loadAll } = useData() as any;
  const { unreadCount, openPanel } = useNotifications();

  const pendingOrders = orders?.filter((o: any) => o.status === "pendente" || o.status === "pending")?.length ?? 0;
  const pendingBudgets = budgets?.filter((b: any) => b.status === "aguardando" || b.status === "pending")?.length ?? 0;
  const todayAppts = appointments?.filter((a: any) => a.date === new Date().toISOString().slice(0, 10))?.length ?? 0;
  const totalRevenue = orders?.filter((o: any) => o.status === "concluido" || o.status === "done")?.reduce((s: number, o: any) => s + Number(o.amountPaid || 0), 0) ?? 0;

  const topInset = Platform.OS === "web" ? 67 : insets.top;

  const totalBadge = unreadCount > 0 ? unreadCount : (pendingOrders + pendingBudgets);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{ backgroundColor: BRAND.colors.primary, paddingTop: topInset + 8, paddingBottom: 20, paddingHorizontal: 20 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View>
            <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", fontFamily: "Inter_400Regular" }}>Bem-vindo,</Text>
            <Text style={{ fontSize: 20, fontFamily: "Inter_700Bold", color: "#fff" }}>{user?.name?.split(" ")[0] ?? "Admin"}</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
            {/* Bell icon */}
            <TouchableOpacity onPress={openPanel} activeOpacity={0.75} style={{ position: "relative" }}>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" }}>
                <Feather name="bell" size={20} color="#fff" />
              </View>
              {totalBadge > 0 && (
                <View style={{
                  position: "absolute", top: 0, right: 0,
                  width: 18, height: 18, borderRadius: 9,
                  backgroundColor: BRAND.colors.accent,
                  alignItems: "center", justifyContent: "center",
                  borderWidth: 2, borderColor: BRAND.colors.primary,
                }}>
                  <Text style={{ fontSize: 10, color: "#fff", fontFamily: "Inter_700Bold" }}>
                    {totalBadge > 99 ? "99+" : String(totalBadge)}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            <Image source={BRAND.logo} style={{ width: 40, height: 40, borderRadius: 10 }} />
          </View>
        </View>
      </View>

      <ScrollView refreshControl={<RefreshControl refreshing={loading} onRefresh={loadAll} />} showsVerticalScrollIndicator={false}>
        <View style={{ padding: 20, gap: 16 }}>

          {/* Alert banner when there are pending items */}
          {(pendingOrders + pendingBudgets) > 0 && (
            <TouchableOpacity
              onPress={openPanel}
              activeOpacity={0.8}
              style={{
                backgroundColor: BRAND.colors.accentLight,
                borderRadius: 14,
                padding: 14,
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                borderLeftWidth: 4,
                borderLeftColor: BRAND.colors.accent,
              }}
            >
              <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: BRAND.colors.accent, alignItems: "center", justifyContent: "center" }}>
                <Feather name="alert-circle" size={18} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontFamily: "Inter_700Bold", color: BRAND.colors.accentDark }}>
                  {pendingOrders + pendingBudgets} ite{(pendingOrders + pendingBudgets) > 1 ? "ns" : "m"} aguardando atenção
                </Text>
                <Text style={{ fontSize: 12, color: BRAND.colors.accentDark }}>
                  {pendingOrders > 0 ? `${pendingOrders} ordem(ns) pendente(s)` : ""}
                  {pendingOrders > 0 && pendingBudgets > 0 ? " · " : ""}
                  {pendingBudgets > 0 ? `${pendingBudgets} orçamento(s) aguardando` : ""}
                </Text>
              </View>
              <Feather name="chevron-right" size={16} color={BRAND.colors.accentDark} />
            </TouchableOpacity>
          )}

          <View style={{ flexDirection: "row", gap: 12 }}>
            <StatCard title="Ordens Pendentes" value={pendingOrders} icon="tool" iconColor="#f59e0b" iconBg="#fef3c7" />
            <StatCard title="Orçamentos Aguard." value={pendingBudgets} icon="file-text" iconColor="#3b82f6" iconBg="#dbeafe" />
          </View>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <StatCard title="Agend. Hoje" value={todayAppts} icon="calendar" iconColor="#8b5cf6" iconBg="#ede9fe" />
            <StatCard title="Receita Total" value={`R$${totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`} icon="trending-up" iconColor="#22c55e" iconBg="#dcfce7" />
          </View>

          <Text style={{ fontSize: 16, fontFamily: "Inter_700Bold", color: colors.foreground }}>Menu</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
            {MENU_ITEMS.map(item => (
              <TouchableOpacity
                key={item.route}
                onPress={() => router.push(item.route as any)}
                activeOpacity={0.7}
                style={{
                  width: "30%",
                  aspectRatio: 1,
                  backgroundColor: colors.card,
                  borderRadius: colors.radius,
                  borderWidth: 1,
                  borderColor: colors.border,
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.06,
                  shadowRadius: 3,
                  elevation: 2,
                }}
              >
                <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: item.bg, alignItems: "center", justifyContent: "center" }}>
                  <Feather name={item.icon} size={22} color={item.color} />
                </View>
                <Text style={{ fontSize: 12, fontFamily: "Inter_500Medium", color: colors.foreground, textAlign: "center" }}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
