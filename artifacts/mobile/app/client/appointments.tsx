import React from "react";
import { Platform, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { AppointmentCard } from "@/components/AppointmentCard";

export default function ClientAppointmentsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { getClientAppointments, loading, loadAll } = useData();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const appointments = getClientAppointments(String(user?.id ?? "")).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const upcoming = appointments.filter(a => a.date >= new Date().toISOString().slice(0, 10));
  const past = appointments.filter(a => a.date < new Date().toISOString().slice(0, 10));

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingTop: topInset + 12, paddingBottom: 16, paddingHorizontal: 20, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: "row", alignItems: "center", gap: 12 }}>
        <TouchableOpacity onPress={() => router.back()}><Feather name="arrow-left" size={22} color={colors.primary} /></TouchableOpacity>
        <Text style={{ flex: 1, fontSize: 20, fontFamily: "Inter_700Bold", color: colors.foreground }}>Agendamentos</Text>
      </View>
      <ScrollView refreshControl={<RefreshControl refreshing={loading} onRefresh={loadAll} />} contentContainerStyle={{ padding: 16 }}>
        {appointments.length === 0 ? (
          <View style={{ alignItems: "center", padding: 40 }}>
            <Feather name="calendar" size={48} color={colors.mutedForeground} />
            <Text style={{ fontSize: 16, fontFamily: "Inter_600SemiBold", color: colors.foreground, marginTop: 16 }}>Nenhum agendamento</Text>
            <Text style={{ fontSize: 14, color: colors.mutedForeground, textAlign: "center", marginTop: 6 }}>Seus agendamentos aparecerão aqui</Text>
          </View>
        ) : (
          <>
            {upcoming.length > 0 && (
              <>
                <Text style={{ fontSize: 14, fontFamily: "Inter_600SemiBold", color: colors.foreground, marginBottom: 12 }}>Próximos</Text>
                {upcoming.map(a => <AppointmentCard key={a.id} appointment={a} />)}
              </>
            )}
            {past.length > 0 && (
              <>
                <Text style={{ fontSize: 14, fontFamily: "Inter_600SemiBold", color: colors.mutedForeground, marginTop: 8, marginBottom: 12 }}>Anteriores</Text>
                {past.map(a => <AppointmentCard key={a.id} appointment={a} />)}
              </>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}
