import React, { useState } from "react";
import { Alert, Modal, Platform, Pressable, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { useData, type Budget } from "@/context/DataContext";
import { BudgetCard } from "@/components/BudgetCard";
import { Card } from "@/components/ui/Card";
import { BRAND } from "@/constants/theme";

const FILTER_OPTIONS = ["Todos", "aguardando", "aprovado", "aceito", "contraproposta", "recusado", "fechado"];
const FILTER_LABELS: Record<string, string> = { Todos: "Todos", aguardando: "Aguardando", aprovado: "Aprovado", aceito: "Aceito", contraproposta: "Contraproposta", recusado: "Recusado", fechado: "Pago" };

export default function ClientBudgetsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { getClientBudgets, updateBudget, loading, loadAll } = useData();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const budgets = getClientBudgets(String(user?.id ?? "")).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const [filter, setFilter] = useState("Todos");
  const [selected, setSelected] = useState<Budget | null>(null);
  const [counterText, setCounterText] = useState("");
  const [saving, setSaving] = useState(false);

  const filtered = budgets.filter(b => filter === "Todos" || b.status === filter);

  const openBudget = (b: Budget) => { setSelected(b); setCounterText(""); };

  const handleAccept = async () => {
    if (!selected) return;
    setSaving(true);
    try { await updateBudget(selected.id, { status: "aceito" as any }); setSelected(null); }
    catch (e: any) { Alert.alert("Erro", e.message); }
    finally { setSaving(false); }
  };

  const handleReject = async () => {
    if (!selected) return;
    setSaving(true);
    try { await updateBudget(selected.id, { status: "recusado" as any }); setSelected(null); }
    catch (e: any) { Alert.alert("Erro", e.message); }
    finally { setSaving(false); }
  };

  const handleCounter = async () => {
    if (!selected || !counterText.trim()) { Alert.alert("Atenção", "Escreva sua contraproposta."); return; }
    setSaving(true);
    try { await updateBudget(selected.id, { status: "contraproposta" as any, counterProposalText: counterText } as any); setSelected(null); }
    catch (e: any) { Alert.alert("Erro", e.message); }
    finally { setSaving(false); }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingTop: topInset + 12, paddingBottom: 12, paddingHorizontal: 20, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <TouchableOpacity onPress={() => router.back()}><Feather name="arrow-left" size={22} color={colors.primary} /></TouchableOpacity>
          <Text style={{ flex: 1, fontSize: 20, fontFamily: "Inter_700Bold", color: colors.foreground }}>Meus Orçamentos</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {FILTER_OPTIONS.map(f => (
              <TouchableOpacity key={f} onPress={() => setFilter(f)} style={{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: filter === f ? colors.primary : colors.muted }}>
                <Text style={{ fontSize: 12, fontFamily: "Inter_500Medium", color: filter === f ? "#fff" : colors.mutedForeground }}>{FILTER_LABELS[f]}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <ScrollView refreshControl={<RefreshControl refreshing={loading} onRefresh={loadAll} />} contentContainerStyle={{ padding: 16 }}>
        {filtered.length === 0 ? (
          <View style={{ alignItems: "center", padding: 40 }}>
            <Feather name="file-text" size={48} color={colors.mutedForeground} />
            <Text style={{ fontSize: 16, fontFamily: "Inter_600SemiBold", color: colors.foreground, marginTop: 16 }}>Nenhum orçamento</Text>
          </View>
        ) : filtered.map(b => <BudgetCard key={b.id} budget={b} onPress={() => openBudget(b)} />)}
      </ScrollView>

      <Modal visible={!!selected} animationType="slide" transparent onRequestClose={() => setSelected(null)}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: insets.bottom + 24 }}>
            <Text style={{ fontSize: 18, fontFamily: "Inter_700Bold", color: colors.foreground, marginBottom: 4 }}>{selected?.serviceType}</Text>
            <Text style={{ fontSize: 22, fontFamily: "Inter_700Bold", color: BRAND.colors.primary, marginBottom: 6 }}>
              R$ {selected?.finalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </Text>
            {selected?.paymentConditions ? (
              <Text style={{ fontSize: 13, color: colors.mutedForeground, marginBottom: 12 }}>Condições: {selected.paymentConditions}</Text>
            ) : null}
            {selected?.counterProposalText ? (
              <View style={{ backgroundColor: colors.muted, borderRadius: 10, padding: 12, marginBottom: 12 }}>
                <Text style={{ fontSize: 13, color: colors.foreground }}>{selected.counterProposalText}</Text>
              </View>
            ) : null}

            {(selected?.status === "aguardando" || selected?.status === "aprovado" || selected?.status === "aceito_admin") ? (
              <>
                <View style={{ flexDirection: "row", gap: 10, marginBottom: 12 }}>
                  <Pressable onPress={handleAccept} style={{ flex: 1, backgroundColor: "#dcfce7", borderRadius: 12, paddingVertical: 13, alignItems: "center" }}>
                    <Text style={{ color: "#15803d", fontFamily: "Inter_600SemiBold" }}>Aceitar</Text>
                  </Pressable>
                  <Pressable onPress={handleReject} style={{ flex: 1, backgroundColor: "#fee2e2", borderRadius: 12, paddingVertical: 13, alignItems: "center" }}>
                    <Text style={{ color: "#b91c1c", fontFamily: "Inter_600SemiBold" }}>Recusar</Text>
                  </Pressable>
                </View>
                <TextInput placeholder="Fazer contraproposta..." placeholderTextColor={colors.mutedForeground} value={counterText} onChangeText={setCounterText} style={{ backgroundColor: colors.muted, borderRadius: 10, padding: 12, marginBottom: 10, color: colors.foreground, fontSize: 14 }} />
                {counterText.trim() ? (
                  <TouchableOpacity onPress={handleCounter} style={{ backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 13, alignItems: "center" }}>
                    <Text style={{ color: "#fff", fontFamily: "Inter_600SemiBold" }}>Enviar contraproposta</Text>
                  </TouchableOpacity>
                ) : null}
              </>
            ) : (
              <TouchableOpacity onPress={() => setSelected(null)} style={{ backgroundColor: colors.muted, borderRadius: 12, paddingVertical: 13, alignItems: "center" }}>
                <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold" }}>Fechar</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
