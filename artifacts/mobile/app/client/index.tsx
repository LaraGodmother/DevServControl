import React from "react";
import { Image, Platform, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { BRAND } from "@/constants/theme";

const MENU_ITEMS: { icon: keyof typeof Feather.glyphMap; label: string; route: string; color: string; bg: string }[] = [
  { icon: "tool", label: "Meus Serviços", route: "/client/services", color: "#3b82f6", bg: "#dbeafe" },
  { icon: "calendar", label: "Agendamentos", route: "/client/appointments", color: "#8b5cf6", bg: "#ede9fe" },
  { icon: "file-text", label: "Orçamentos", route: "/client/budgets", color: "#f59e0b", bg: "#fef3c7" },
  { icon: "plus-circle", label: "Solicitar Serviço", route: "/client/new-service", color: "#22c55e", bg: "#dcfce7" },
  { icon: "message-circle", label: "Chat", route: "/client/chat", color: "#06b6d4", bg: "#cffafe" },
  { icon: "shopping-bag", label: "Loja", route: "/client/loja", color: "#ec4899", bg: "#fce7f3" },
];

export default function ClientDashboard() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { orders, budgets, appointments, loading, loadAll } = useData();
  const topInset = Platform.OS === "web" ? 67 : insets.top;

  const myOrders = orders.filter(o => o.clientId === String(user?.id));
  const myBudgets = budgets.filter(b => b.clientId === String(user?.id));
  const myAppts = appointments.filter(a => a.clientId === String(user?.id));

  const pendingOrders = myOrders.filter(o => o.status === "pendente").length;
  const pendingBudgets = myBudgets.filter(b => b.status === "aguardando").length;
  const upcomingAppts = myAppts.filter(a => a.date >= new Date().toISOString().slice(0, 10)).length;

  const handleLogout = async () => {
    await logout();
    router.replace("/" as any);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ backgroundColor: BRAND.colors.primary, paddingTop: topInset + 8, paddingBottom: 20, paddingHorizontal: 20 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View>
            <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", fontFamily: "Inter_400Regular" }}>Olá,</Text>
            <Text style={{ fontSize: 20, fontFamily: "Inter_700Bold", color: "#fff" }}>{user?.name?.split(" ")[0] ?? "Cliente"}</Text>
          </View>
          <View style={{ flexDirection: "row", gap: 14, alignItems: "center" }}>
            <Image source={BRAND.logo} style={{ width: 36, height: 36, borderRadius: 9 }} />
            <TouchableOpacity onPress={handleLogout}>
              <Feather name="log-out" size={20} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView refreshControl={<RefreshControl refreshing={loading} onRefresh={loadAll} />} showsVerticalScrollIndicator={false}>
        <View style={{ padding: 20, gap: 16 }}>
          {(pendingOrders + pendingBudgets + upcomingAppts) > 0 && (
            <View style={{ backgroundColor: BRAND.colors.primaryLight, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: "#c7d2fe" }}>
              <Text style={{ fontSize: 14, fontFamily: "Inter_600SemiBold", color: BRAND.colors.primary, marginBottom: 8 }}>Resumo</Text>
              <View style={{ flexDirection: "row", gap: 16 }}>
                {pendingOrders > 0 && <View style={{ alignItems: "center" }}><Text style={{ fontSize: 20, fontFamily: "Inter_700Bold", color: BRAND.colors.primary }}>{pendingOrders}</Text><Text style={{ fontSize: 11, color: BRAND.colors.primary }}>Em aberto</Text></View>}
                {pendingBudgets > 0 && <View style={{ alignItems: "center" }}><Text style={{ fontSize: 20, fontFamily: "Inter_700Bold", color: BRAND.colors.primary }}>{pendingBudgets}</Text><Text style={{ fontSize: 11, color: BRAND.colors.primary }}>Orçamentos</Text></View>}
                {upcomingAppts > 0 && <View style={{ alignItems: "center" }}><Text style={{ fontSize: 20, fontFamily: "Inter_700Bold", color: BRAND.colors.primary }}>{upcomingAppts}</Text><Text style={{ fontSize: 11, color: BRAND.colors.primary }}>Agendamentos</Text></View>}
              </View>
            </View>
          )}

          <Text style={{ fontSize: 16, fontFamily: "Inter_700Bold", color: colors.foreground }}>O que você precisa?</Text>
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
                <Text style={{ fontSize: 11, fontFamily: "Inter_500Medium", color: colors.foreground, textAlign: "center" }}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ backgroundColor: colors.card, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ fontSize: 14, fontFamily: "Inter_600SemiBold", color: colors.foreground, marginBottom: 2 }}>{BRAND.company.name}</Text>
            <Text style={{ fontSize: 13, color: colors.mutedForeground, marginBottom: 8 }}>{BRAND.company.phone}</Text>
            <TouchableOpacity onPress={() => router.push("/client/new-service" as any)} style={{ backgroundColor: BRAND.colors.primary, borderRadius: 10, paddingVertical: 12, alignItems: "center" }}>
              <Text style={{ color: "#fff", fontFamily: "Inter_600SemiBold", fontSize: 14 }}>Solicitar Serviço</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
