import React, { useState, useEffect } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { api } from "@/lib/api";
import { BRAND } from "@/constants/theme";

const TIME_SLOTS = ["08:00","09:00","10:00","11:00","13:00","14:00","15:00","16:00","17:00"];

function toISO(d: string): string | null {
  const m = d.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  return `${m[3]}-${m[2]}-${m[1]}`;
}
function maskDate(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export default function NewServiceScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { services, loadAll } = useData();
  const topInset = Platform.OS === "web" ? 67 : insets.top;

  const [serviceId, setServiceId] = useState<number | null>(null);
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [availableTimes, setAvailableTimes] = useState<string[]>(TIME_SLOTS);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [loadingAvail, setLoadingAvail] = useState(false);
  const [success, setSuccess] = useState(false);

  const activeServices = services.filter(s => s.active);
  const serviceNames = activeServices.map(s => s.name);
  const selectedService = activeServices.find(s => s.id === serviceId);

  const fetchAvailability = async (dateStr: string) => {
    const iso = toISO(dateStr);
    if (!iso) return;
    setLoadingAvail(true);
    try {
      const avail = await api.getAvailability(iso);
      setAvailableTimes(avail.available.length > 0 ? avail.available : TIME_SLOTS);
    } catch { setAvailableTimes(TIME_SLOTS); }
    finally { setLoadingAvail(false); }
  };

  const handleDateChange = (val: string) => {
    const masked = maskDate(val);
    setDate(masked);
    if (masked.length === 10) fetchAvailability(masked);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!serviceId) e.service = "Selecione um serviço";
    if (!date.trim()) e.date = "Informe a data desejada";
    else if (!toISO(date)) e.date = "Data inválida (DD/MM/AAAA)";
    if (!time) e.time = "Selecione um horário";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || !user) return;
    setLoading(true);
    try {
      await api.createOrder({ clientId: user.id, serviceId: serviceId!, description: description || undefined, preferredDate: toISO(date)!, preferredTime: time } as any);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      await loadAll();
      setSuccess(true);
    } catch (e: any) {
      Alert.alert("Erro", e.message || "Não foi possível solicitar o serviço.");
    } finally { setLoading(false); }
  };

  if (success) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center", padding: 32 }}>
        <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: "#dcfce7", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
          <Feather name="check-circle" size={40} color="#15803d" />
        </View>
        <Text style={{ fontSize: 22, fontFamily: "Inter_700Bold", color: colors.foreground, marginBottom: 8, textAlign: "center" }}>Serviço Solicitado!</Text>
        <Text style={{ fontSize: 14, color: colors.mutedForeground, textAlign: "center", lineHeight: 22 }}>
          Nossa equipe entrará em contato para confirmar o agendamento.
        </Text>
        <View style={{ height: 32 }} />
        <Button title="Ver meus serviços" onPress={() => router.replace("/client/services" as any)} />
        <View style={{ height: 12 }} />
        <Button title="Voltar ao início" onPress={() => router.replace("/client/index" as any)} variant="outline" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View style={{ paddingTop: topInset + 16, paddingBottom: 40, paddingHorizontal: 24 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ alignSelf: "flex-start", marginBottom: 24 }}>
            <Feather name="arrow-left" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={{ fontSize: 26, fontFamily: "Inter_700Bold", color: colors.foreground, marginBottom: 6 }}>Solicitar Serviço</Text>
          <Text style={{ fontSize: 14, color: colors.mutedForeground, marginBottom: 28 }}>Escolha o serviço e data desejada</Text>

          <View style={{ gap: 16 }}>
            <Select
              label="Serviço"
              value={selectedService?.name ?? ""}
              options={serviceNames}
              onChange={name => { const svc = activeServices.find(s => s.name === name); setServiceId(svc?.id ?? null); }}
              placeholder="Selecione o serviço..."
              error={errors.service}
            />
            {selectedService && (
              <View style={{ backgroundColor: BRAND.colors.primaryLight, borderRadius: 10, padding: 12 }}>
                <Text style={{ fontSize: 12, color: BRAND.colors.primary }}>{selectedService.description}</Text>
                <Text style={{ fontSize: 13, fontFamily: "Inter_700Bold", color: BRAND.colors.primary, marginTop: 4 }}>
                  A partir de R$ {selectedService.basePrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </Text>
              </View>
            )}
            <Input label="Data preferida" placeholder="DD/MM/AAAA" value={date} onChangeText={handleDateChange} keyboardType="numeric" error={errors.date} icon="calendar" />
            {loadingAvail ? (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={{ fontSize: 13, color: colors.mutedForeground }}>Verificando disponibilidade...</Text>
              </View>
            ) : (
              <View>
                <Text style={{ fontSize: 13, fontFamily: "Inter_500Medium", color: colors.foreground, marginBottom: 8 }}>Horário preferido</Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  {availableTimes.map(t => (
                    <TouchableOpacity key={t} onPress={() => setTime(t)} style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: time === t ? colors.primary : colors.muted }}>
                      <Text style={{ fontSize: 13, fontFamily: "Inter_500Medium", color: time === t ? "#fff" : colors.foreground }}>{t}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {errors.time ? <Text style={{ fontSize: 12, color: colors.destructive, marginTop: 4 }}>{errors.time}</Text> : null}
              </View>
            )}
            <Input label="Descrição (opcional)" placeholder="Descreva o que precisa..." value={description} onChangeText={setDescription} multiline numberOfLines={3} style={{ minHeight: 80, textAlignVertical: "top" }} />
          </View>

          <View style={{ height: 28 }} />
          <Button title="Solicitar Serviço" onPress={handleSubmit} loading={loading} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
