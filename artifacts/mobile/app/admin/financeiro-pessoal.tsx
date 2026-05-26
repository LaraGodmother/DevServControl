import React, { useState } from "react";
import { Alert, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { Card } from "@/components/ui/Card";
import { BRAND } from "@/constants/theme";

interface PersonalEntry { id: string; description: string; amount: number; type: "income" | "expense"; date: string; }
const STORAGE_KEY = "@servcontrol/personal_finance";

function fmt(v: number) { return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); }

export default function FinanceiroPessoalScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const [entries, setEntries] = useState<PersonalEntry[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ description: "", amount: "", type: "income" as "income" | "expense" });

  React.useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(data => { if (data) setEntries(JSON.parse(data)); }).catch(() => {});
  }, []);

  const save = async (updated: PersonalEntry[]) => {
    setEntries(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const handleAdd = async () => {
    if (!form.description.trim() || !form.amount) { Alert.alert("Atenção", "Preencha todos os campos."); return; }
    const entry: PersonalEntry = { id: Date.now().toString(), description: form.description, amount: parseFloat(form.amount.replace(",", ".")), type: form.type, date: new Date().toISOString() };
    await save([entry, ...entries]);
    setShowModal(false);
    setForm({ description: "", amount: "", type: "income" });
  };

  const handleDelete = (id: string) => {
    Alert.alert("Excluir", "Excluir este lançamento?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Excluir", style: "destructive", onPress: () => save(entries.filter(e => e.id !== id)) }
    ]);
  };

  const totalIncome = entries.filter(e => e.type === "income").reduce((s, e) => s + e.amount, 0);
  const totalExpense = entries.filter(e => e.type === "expense").reduce((s, e) => s + e.amount, 0);
  const balance = totalIncome - totalExpense;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingTop: topInset + 12, paddingBottom: 16, paddingHorizontal: 20, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: "row", alignItems: "center", gap: 12 }}>
        <TouchableOpacity onPress={() => router.back()}><Feather name="arrow-left" size={22} color={colors.primary} /></TouchableOpacity>
        <Text style={{ flex: 1, fontSize: 20, fontFamily: "Inter_700Bold", color: colors.foreground }}>Finanças Pessoais</Text>
        <TouchableOpacity onPress={() => setShowModal(true)} style={{ backgroundColor: colors.primary, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Feather name="plus" size={16} color="#fff" />
          <Text style={{ color: "#fff", fontSize: 13, fontFamily: "Inter_600SemiBold" }}>Lançar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
        <View style={{ flexDirection: "row", gap: 12 }}>
          <Card style={{ flex: 1 }}>
            <Feather name="trending-up" size={20} color="#22c55e" style={{ marginBottom: 8 }} />
            <Text style={{ fontSize: 12, color: colors.mutedForeground }}>Entradas</Text>
            <Text style={{ fontSize: 18, fontFamily: "Inter_700Bold", color: "#22c55e" }}>{fmt(totalIncome)}</Text>
          </Card>
          <Card style={{ flex: 1 }}>
            <Feather name="trending-down" size={20} color="#ef4444" style={{ marginBottom: 8 }} />
            <Text style={{ fontSize: 12, color: colors.mutedForeground }}>Saídas</Text>
            <Text style={{ fontSize: 18, fontFamily: "Inter_700Bold", color: "#ef4444" }}>{fmt(totalExpense)}</Text>
          </Card>
        </View>

        <Card style={{ backgroundColor: balance >= 0 ? "#f0fdf4" : "#fef2f2", borderColor: balance >= 0 ? "#bbf7d0" : "#fecaca" }}>
          <Text style={{ fontSize: 13, color: colors.mutedForeground }}>Saldo</Text>
          <Text style={{ fontSize: 26, fontFamily: "Inter_700Bold", color: balance >= 0 ? "#15803d" : "#b91c1c" }}>{fmt(balance)}</Text>
        </Card>

        {entries.length === 0 ? (
          <View style={{ alignItems: "center", padding: 40 }}>
            <Feather name="dollar-sign" size={40} color={colors.mutedForeground} />
            <Text style={{ color: colors.mutedForeground, marginTop: 12 }}>Nenhum lançamento ainda</Text>
          </View>
        ) : entries.map(e => (
          <Card key={e.id}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: e.type === "income" ? "#dcfce7" : "#fee2e2", alignItems: "center", justifyContent: "center" }}>
                <Feather name={e.type === "income" ? "arrow-up" : "arrow-down"} size={20} color={e.type === "income" ? "#15803d" : "#b91c1c"} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontFamily: "Inter_600SemiBold", color: colors.foreground }}>{e.description}</Text>
                <Text style={{ fontSize: 12, color: colors.mutedForeground }}>{new Date(e.date).toLocaleDateString("pt-BR")}</Text>
              </View>
              <Text style={{ fontSize: 15, fontFamily: "Inter_700Bold", color: e.type === "income" ? "#15803d" : "#b91c1c" }}>
                {e.type === "income" ? "+" : "-"}{fmt(e.amount)}
              </Text>
              <TouchableOpacity onPress={() => handleDelete(e.id)}><Feather name="trash-2" size={16} color={colors.mutedForeground} /></TouchableOpacity>
            </View>
          </Card>
        ))}
      </ScrollView>

      <Modal visible={showModal} animationType="slide" transparent onRequestClose={() => setShowModal(false)}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: insets.bottom + 24 }}>
            <Text style={{ fontSize: 18, fontFamily: "Inter_700Bold", color: colors.foreground, marginBottom: 16 }}>Novo Lançamento</Text>
            <View style={{ flexDirection: "row", gap: 10, marginBottom: 14 }}>
              {(["income", "expense"] as const).map(t => (
                <TouchableOpacity key={t} onPress={() => setForm(f => ({ ...f, type: t }))} style={{ flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center", backgroundColor: form.type === t ? (t === "income" ? "#dcfce7" : "#fee2e2") : colors.muted }}>
                  <Text style={{ fontFamily: "Inter_600SemiBold", color: t === "income" ? "#15803d" : "#b91c1c" }}>{t === "income" ? "Entrada" : "Saída"}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput placeholder="Descrição *" placeholderTextColor={colors.mutedForeground} value={form.description} onChangeText={v => setForm(f => ({ ...f, description: v }))} style={{ backgroundColor: colors.muted, borderRadius: 10, padding: 12, marginBottom: 10, color: colors.foreground, fontSize: 14 }} />
            <TextInput placeholder="Valor (R$) *" placeholderTextColor={colors.mutedForeground} value={form.amount} onChangeText={v => setForm(f => ({ ...f, amount: v }))} keyboardType="numeric" style={{ backgroundColor: colors.muted, borderRadius: 10, padding: 12, marginBottom: 16, color: colors.foreground, fontSize: 14 }} />
            <TouchableOpacity onPress={handleAdd} style={{ backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 14, alignItems: "center" }}>
              <Text style={{ color: "#fff", fontFamily: "Inter_600SemiBold", fontSize: 15 }}>Adicionar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
