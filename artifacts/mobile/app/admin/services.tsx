import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, Modal, Platform, RefreshControl, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useData, type Service } from "@/context/DataContext";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { openExportUrl } from "@/lib/exportCsv";
import { BRAND } from "@/constants/theme";

function getServiceIcon(name: string): { icon: keyof typeof Feather.glyphMap; color: string } {
  const n = name.toLowerCase();
  if (n.includes("elétr") || n.includes("eletr")) return { icon: "zap", color: "#f59e0b" };
  if (n.includes("cftv") || n.includes("câmera") || n.includes("segurança")) return { icon: "video", color: "#3b82f6" };
  if (n.includes("refrig") || n.includes("ar cond")) return { icon: "wind", color: "#06b6d4" };
  if (n.includes("autom") || n.includes("smart")) return { icon: "cpu", color: "#8b5cf6" };
  if (n.includes("manut") || n.includes("reparo")) return { icon: "tool", color: "#22c55e" };
  if (n.includes("rede") || n.includes("wifi")) return { icon: "wifi", color: "#6366f1" };
  return { icon: "settings", color: "#64748b" };
}

export default function AdminServicesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const { services, loadAll, deleteService } = useData();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState({ name: "", description: "", basePrice: "", profitMargin: "0", rules: "", active: true });

  const openCreate = () => { setEditing(null); setForm({ name: "", description: "", basePrice: "", profitMargin: "0", rules: "", active: true }); setShowModal(true); };
  const openEdit = (s: Service) => { setEditing(s); setForm({ name: s.name, description: s.description, basePrice: String(s.basePrice), profitMargin: String(s.profitMargin), rules: s.rules ?? "", active: s.active }); setShowModal(true); };

  const handleSave = async () => {
    if (!form.name.trim() || !form.basePrice) { Alert.alert("Atenção", "Nome e preço são obrigatórios."); return; }
    setLoading(true);
    try {
      const data = { name: form.name.trim(), description: form.description.trim(), basePrice: form.basePrice, profitMargin: form.profitMargin, rules: form.rules || null, active: form.active };
      if (editing) await api.updateService(editing.id, data as any);
      else await api.createService(data as any);
      setShowModal(false);
      await loadAll();
    } catch (e: any) {
      Alert.alert("Erro", e.message || "Não foi possível salvar.");
    } finally { setLoading(false); }
  };

  const handleDelete = (s: Service) => {
    Alert.alert("Excluir", `Excluir "${s.name}"?`, [
      { text: "Cancelar", style: "cancel" },
      { text: "Excluir", style: "destructive", onPress: async () => { try { await deleteService(s.id); } catch { Alert.alert("Erro", "Não foi possível excluir."); } } }
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingTop: topInset + 12, paddingBottom: 16, paddingHorizontal: 20, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <TouchableOpacity onPress={() => router.back()}><Feather name="arrow-left" size={22} color={colors.primary} /></TouchableOpacity>
          <Text style={{ flex: 1, fontSize: 20, fontFamily: "Inter_700Bold", color: colors.foreground }}>Serviços</Text>
          <TouchableOpacity onPress={() => openExportUrl("/export/servicos.csv")} style={{ marginRight: 8 }}><Feather name="download" size={20} color={colors.primary} /></TouchableOpacity>
          <TouchableOpacity onPress={openCreate} style={{ backgroundColor: colors.primary, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Feather name="plus" size={16} color="#fff" />
            <Text style={{ color: "#fff", fontSize: 13, fontFamily: "Inter_600SemiBold" }}>Novo</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView refreshControl={<RefreshControl refreshing={loading} onRefresh={loadAll} />} contentContainerStyle={{ padding: 16, gap: 12 }}>
        {services.length === 0 ? (
          <View style={{ alignItems: "center", padding: 40 }}>
            <Feather name="settings" size={40} color={colors.mutedForeground} />
            <Text style={{ color: colors.mutedForeground, marginTop: 12 }}>Nenhum serviço cadastrado</Text>
          </View>
        ) : services.map(s => {
          const { icon, color } = getServiceIcon(s.name);
          return (
            <Card key={s.id}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
                <View style={{ width: 46, height: 46, borderRadius: 12, backgroundColor: `${color}20`, alignItems: "center", justifyContent: "center" }}>
                  <Feather name={icon} size={22} color={color} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Text style={{ fontSize: 15, fontFamily: "Inter_600SemiBold", color: colors.foreground }}>{s.name}</Text>
                    {!s.active && <View style={{ backgroundColor: colors.muted, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 }}><Text style={{ fontSize: 10, color: colors.mutedForeground }}>Inativo</Text></View>}
                  </View>
                  <Text style={{ fontSize: 12, color: colors.mutedForeground }} numberOfLines={1}>{s.description}</Text>
                  <Text style={{ fontSize: 13, fontFamily: "Inter_600SemiBold", color: colors.primary, marginTop: 2 }}>
                    R$ {s.basePrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", gap: 12 }}>
                  <TouchableOpacity onPress={() => openEdit(s)}><Feather name="edit-2" size={18} color={colors.primary} /></TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(s)}><Feather name="trash-2" size={18} color={colors.destructive} /></TouchableOpacity>
                </View>
              </View>
            </Card>
          );
        })}
      </ScrollView>

      <Modal visible={showModal} animationType="slide" transparent onRequestClose={() => setShowModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <TouchableOpacity style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }} activeOpacity={1} onPress={() => setShowModal(false)} />
          <ScrollView style={{ backgroundColor: colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20 }} contentContainerStyle={{ padding: 24, paddingBottom: insets.bottom + 24 }}>
            <Text style={{ fontSize: 18, fontFamily: "Inter_700Bold", color: colors.foreground, marginBottom: 16 }}>{editing ? "Editar Serviço" : "Novo Serviço"}</Text>
            {[
              { key: "name", placeholder: "Nome do serviço *", keyboard: "default" as const },
              { key: "description", placeholder: "Descrição *", keyboard: "default" as const },
              { key: "basePrice", placeholder: "Preço base (R$) *", keyboard: "numeric" as const },
              { key: "profitMargin", placeholder: "Margem de lucro (%)", keyboard: "numeric" as const },
              { key: "rules", placeholder: "Regras / observações", keyboard: "default" as const },
            ].map(f => (
              <TextInput key={f.key} placeholder={f.placeholder} placeholderTextColor={colors.mutedForeground} value={(form as any)[f.key]} onChangeText={v => setForm(p => ({ ...p, [f.key]: v }))} keyboardType={f.keyboard} style={{ backgroundColor: colors.muted, borderRadius: 10, padding: 12, marginBottom: 10, color: colors.foreground, fontSize: 14 }} />
            ))}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <Text style={{ fontSize: 15, color: colors.foreground }}>Ativo</Text>
              <Switch value={form.active} onValueChange={v => setForm(p => ({ ...p, active: v }))} trackColor={{ false: colors.border, true: BRAND.colors.primary }} />
            </View>
            <TouchableOpacity onPress={handleSave} disabled={loading} style={{ backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 14, alignItems: "center" }}>
              <Text style={{ color: "#fff", fontFamily: "Inter_600SemiBold", fontSize: 15 }}>{editing ? "Salvar" : "Criar serviço"}</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
