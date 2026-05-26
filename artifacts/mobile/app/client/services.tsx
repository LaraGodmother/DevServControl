import React from "react";
import { Platform, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { ServiceCard } from "@/components/ServiceCard";
import { Card } from "@/components/ui/Card";

export default function ClientServicesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { getClientOrders, loading, loadAll } = useData();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const orders = getClientOrders(String(user?.id ?? "")).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingTop: topInset + 12, paddingBottom: 16, paddingHorizontal: 20, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: "row", alignItems: "center", gap: 12 }}>
        <TouchableOpacity onPress={() => router.back()}><Feather name="arrow-left" size={22} color={colors.primary} /></TouchableOpacity>
        <Text style={{ flex: 1, fontSize: 20, fontFamily: "Inter_700Bold", color: colors.foreground }}>Meus Serviços</Text>
        <TouchableOpacity onPress={() => router.push("/client/new-service" as any)} style={{ backgroundColor: colors.primary, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Feather name="plus" size={16} color="#fff" />
          <Text style={{ color: "#fff", fontSize: 13, fontFamily: "Inter_600SemiBold" }}>Novo</Text>
        </TouchableOpacity>
      </View>
      <ScrollView refreshControl={<RefreshControl refreshing={loading} onRefresh={loadAll} />} contentContainerStyle={{ padding: 16 }}>
        {orders.length === 0 ? (
          <View style={{ alignItems: "center", padding: 40 }}>
            <Feather name="tool" size={48} color={colors.mutedForeground} />
            <Text style={{ fontSize: 16, fontFamily: "Inter_600SemiBold", color: colors.foreground, marginTop: 16 }}>Nenhum serviço ainda</Text>
            <Text style={{ fontSize: 14, color: colors.mutedForeground, textAlign: "center", marginTop: 6 }}>Solicite seu primeiro serviço</Text>
            <TouchableOpacity onPress={() => router.push("/client/new-service" as any)} style={{ backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 24, marginTop: 20 }}>
              <Text style={{ color: "#fff", fontFamily: "Inter_600SemiBold" }}>Solicitar Serviço</Text>
            </TouchableOpacity>
          </View>
        ) : orders.map(o => <ServiceCard key={o.id} order={o} />)}
      </ScrollView>
    </View>
  );
}
