import React, { useState } from "react";
import { ActivityIndicator, Alert, Modal, Platform, Pressable, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useData, type Budget } from "@/context/DataContext";
import { BudgetCard } from "@/components/BudgetCard";
import { Card } from "@/components/ui/Card";
import { openExportUrl } from "@/lib/exportCsv";
import { BRAND } from "@/constants/theme";

const FILTER_OPTIONS = ["Todos", "aguardando", "aprovado", "recusado", "contraproposta", "fechado"];
const FILTER_LABELS: Record<string, string> = { Todos: "Todos", aguardando: "Aguardando", aprovado: "Aprovado", recusado: "Recusado", contraproposta: "Contraproposta", fechado: "Pago" };
const STATUS_OPTIONS = ["aguardando", "aprovado", "contraproposta", "recusado", "fechado"];

const PAYMENT_OPTIONS = [
  { key: "pix", label: "PIX", icon: "zap" as const },
  { key: "debit", label: "Cartão Débito", icon: "credit-card" as const },
  { key: "credit", label: "Parcel. Crédito", icon: "layers" as const },
];

export default function AdminBudgetsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const { budgets, updateBudget, loadAll, loading } = useData();
  const [filter, setFilter] = useState("Todos");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Budget | null>(null);
  const [editStatus, setEditStatus] = useState("aguardando");
  const [counterText, setCounterText] = useState("");
  const [paymentConditions, setPaymentConditions] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [saving, setSaving] = useState(false);

  const filtered = budgets.filter(b => {
    if (filter !== "Todos" && b.status !== filter) return false;
    if (search && !b.serviceType.toLowerCase().includes(search.toLowerCase()) && !b.clientName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const openBudget = (b: Budget) => {
    setSelected(b);
    setEditStatus(b.status);
    setCounterText(b.counterProposalText ?? "");
    setPaymentConditions(b.paymentConditions ?? "");
    setPaymentMethod("");
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await updateBudget(selected.id, { status: editStatus as any, counterProposalText: counterText || undefined, paymentConditions: paymentConditions || undefined } as any);
      setSelected(null);
    } catch (e: any) { Alert.alert("Erro", e.message); }
    finally { setSaving(false); }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingTop: topInset + 12, paddingBottom: 12, paddingHorizontal: 20, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <TouchableOpacity onPress={() => router.back()}><Feather name="arrow-left" size={22} color={colors.primary} /></TouchableOpacity>
          <Text style={{ flex: 1, fontSize: 20, fontFamily: "Inter_700Bold", color: colors.foreground }}>Orçamentos</Text>
          <TouchableOpacity onPress={() => openExportUrl("/export/orcamentos.csv")}><Feather name="download" size={20} color={colors.primary} /></TouchableOpacity>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: colors.muted, borderRadius: 10, paddingHorizontal: 12, marginBottom: 12 }}>
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput placeholder="Buscar..." placeholderTextColor={colors.mutedForeground} value={search} onChangeText={setSearch} style={{ flex: 1, paddingVertical: 10, paddingHorizontal: 8, color: colors.foreground, fontSize: 14 }} />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {FILTER_OPTIONS.map(f => (
              <TouchableOpacity key={f} onPress={() => setFilter(f)} style={{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: filter === f ? colors.primary : colors.muted }}>
                <Text style={{ fontSize: 13, fontFamily: "Inter_500Medium", color: filter === f ? "#fff" : colors.mutedForeground }}>{FILTER_LABELS[f]}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <ScrollView refreshControl={<RefreshControl refreshing={loading} onRefresh={loadAll} />} contentContainerStyle={{ padding: 16 }}>
        {filtered.length === 0 ? (
          <View style={{ alignItems: "center", padding: 40 }}>
            <Feather name="file-text" size={40} color={colors.mutedForeground} />
            <Text style={{ color: colors.mutedForeground, marginTop: 12 }}>Nenhum orçamento encontrado</Text>
          </View>
        ) : filtered.map(b => <BudgetCard key={b.id} budget={b} onPress={() => openBudget(b)} />)}
      </ScrollView>

      <Modal visible={!!selected} animationType="slide" transparent onRequestClose={() => setSelected(null)}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
          <ScrollView style={{ backgroundColor: colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: "85%" }} contentContainerStyle={{ padding: 24, paddingBottom: insets.bottom + 24 }}>
            <Text style={{ fontSize: 18, fontFamily: "Inter_700Bold", color: colors.foreground, marginBottom: 2 }}>{selected?.serviceType}</Text>
            <Text style={{ fontSize: 13, color: colors.mutedForeground, marginBottom: 4 }}>{selected?.clientName} • {selected?.clientPhone}</Text>
            <Text style={{ fontSize: 16, fontFamily: "Inter_700Bold", color: colors.primary, marginBottom: 16 }}>
              R$ {selected?.finalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </Text>
            <Text style={{ fontSize: 13, fontFamily: "Inter_600SemiBold", color: colors.foreground, marginBottom: 8 }}>Status</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
              {STATUS_OPTIONS.map(s => (
                <Pressable key={s} onPress={() => setEditStatus(s)} style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: editStatus === s ? colors.primary : colors.muted }}>
                  <Text style={{ fontSize: 13, color: editStatus === s ? "#fff" : colors.foreground, fontFamily: "Inter_500Medium" }}>{FILTER_LABELS[s] ?? s}</Text>
                </Pressable>
              ))}
            </View>
            {editStatus === "contraproposta" && (
              <TextInput placeholder="Texto da contraproposta..." placeholderTextColor={colors.mutedForeground} value={counterText} onChangeText={setCounterText} multiline numberOfLines={3} style={{ backgroundColor: colors.muted, borderRadius: 10, padding: 12, marginBottom: 14, color: colors.foreground, fontSize: 14, minHeight: 80, textAlignVertical: "top" }} />
            )}
            <TextInput placeholder="Condições de pagamento..." placeholderTextColor={colors.mutedForeground} value={paymentConditions} onChangeText={setPaymentConditions} style={{ backgroundColor: colors.muted, borderRadius: 10, padding: 12, marginBottom: 16, color: colors.foreground, fontSize: 14 }} />
            <TouchableOpacity onPress={handleSave} disabled={saving} style={{ backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 14, alignItems: "center" }}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontFamily: "Inter_600SemiBold", fontSize: 15 }}>Salvar</Text>}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
