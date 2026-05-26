import React, { useState, useEffect } from "react";
import { Alert, Platform, ScrollView, Switch, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { api, type ScheduleConfig } from "@/lib/api";
import { BRAND } from "@/constants/theme";

const DAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const ALL_TIMES = ["07:00","08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00"];

export default function AdminScheduleScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const [config, setConfig] = useState<ScheduleConfig>({ workingDays: [1,2,3,4,5,6], timeSlots: ["08:00","09:00","10:00","11:00","13:00","14:00","15:00","16:00","17:00"], blockedDates: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getScheduleConfig().then(c => { setConfig(c); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const toggleDay = (d: number) => setConfig(c => ({ ...c, workingDays: c.workingDays.includes(d) ? c.workingDays.filter(x => x !== d) : [...c.workingDays, d].sort() }));
  const toggleTime = (t: string) => setConfig(c => ({ ...c, timeSlots: c.timeSlots.includes(t) ? c.timeSlots.filter(x => x !== t) : [...c.timeSlots, t].sort() }));

  const handleSave = async () => {
    setSaving(true);
    try { await api.updateScheduleConfig(config); Alert.alert("Sucesso", "Configurações salvas!"); }
    catch { Alert.alert("Erro", "Não foi possível salvar."); }
    finally { setSaving(false); }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingTop: topInset + 12, paddingBottom: 16, paddingHorizontal: 20, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: "row", alignItems: "center", gap: 12 }}>
        <TouchableOpacity onPress={() => router.back()}><Feather name="arrow-left" size={22} color={colors.primary} /></TouchableOpacity>
        <Text style={{ flex: 1, fontSize: 20, fontFamily: "Inter_700Bold", color: colors.foreground }}>Configurar Agenda</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving} style={{ backgroundColor: BRAND.colors.primary, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 16 }}>
          <Text style={{ color: "#fff", fontSize: 13, fontFamily: "Inter_600SemiBold" }}>{saving ? "..." : "Salvar"}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 20 }}>
        <View style={{ backgroundColor: colors.card, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ fontSize: 15, fontFamily: "Inter_700Bold", color: colors.foreground, marginBottom: 14 }}>Dias de Trabalho</Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {DAY_NAMES.map((name, idx) => {
              const active = config.workingDays.includes(idx);
              return (
                <TouchableOpacity key={name} onPress={() => toggleDay(idx)} style={{ flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center", backgroundColor: active ? BRAND.colors.primary : colors.muted }}>
                  <Text style={{ fontSize: 12, fontFamily: "Inter_600SemiBold", color: active ? "#fff" : colors.mutedForeground }}>{name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={{ backgroundColor: colors.card, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ fontSize: 15, fontFamily: "Inter_700Bold", color: colors.foreground, marginBottom: 14 }}>Horários Disponíveis</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {ALL_TIMES.map(t => {
              const active = config.timeSlots.includes(t);
              return (
                <TouchableOpacity key={t} onPress={() => toggleTime(t)} style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: active ? BRAND.colors.primary : colors.muted }}>
                  <Text style={{ fontSize: 13, fontFamily: "Inter_500Medium", color: active ? "#fff" : colors.mutedForeground }}>{t}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <Text style={{ fontSize: 13, color: colors.mutedForeground, textAlign: "center" }}>
          {config.workingDays.length} dias • {config.timeSlots.length} horários por dia
        </Text>
      </ScrollView>
    </View>
  );
}
