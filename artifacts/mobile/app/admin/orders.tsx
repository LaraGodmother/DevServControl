import React, { useState } from "react";
import { ActivityIndicator, Alert, Modal, Platform, Pressable, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useData, type ServiceOrder, type ServiceStatus } from "@/context/DataContext";
import { ServiceCard } from "@/components/ServiceCard";
import { Card } from "@/components/ui/Card";

const STATUS_OPTIONS: { label: string; value: ServiceStatus }[] = [
  { label: "Pendente", value: "pendente" },
  { label: "Em Andamento", value: "em_andamento" },
  { label: "Concluído", value: "concluido" },
  { label: "Cancelado", value: "cancelado" },
];

const FILTER_OPTIONS = ["Todos", "pendente", "em_andamento", "concluido", "cancelado"];
const FILTER_LABELS: Record<string, string> = { Todos: "Todos", pendente: "Pendente", em_andamento: "Em Andamento", concluido: "Concluído", cancelado: "Cancelado" };

const DOT_COLORS: Record<string, string> = { pendente: "#f59e0b", em_andamento: "#3b82f6", concluido: "#22c55e", cancelado: "#ef4444" };

export default function AdminOrdersScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const { orders, updateOrder, loadAll, loading } = useData();
  const [filter, setFilter] = useState("Todos");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<ServiceOrder | null>(null);
  const [editStatus, setEditStatus] = useState<ServiceStatus>("pendente");
  const [editAmount, setEditAmount] = useState("");
  const [editPayment, setEditPayment] = useState("");
  const [saving, setSaving] = useState(false);

  const filtered = orders.filter(o => {
    if (filter !== "Todos" && o.status !== filter) return false;
    if (search && !o.serviceType.toLowerCase().includes(search.toLowerCase()) && !o.clientName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const openOrder = (o: ServiceOrder) => { setSelected(o); setEditStatus(o.status); setEditAmount(String(o.amountPaid)); setEditPayment(o.paymentMethod ?? ""); };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await updateOrder(selected.id, { status: editStatus as any, amountPaid: editAmount as any, paymentMethod: editPayment });
      setSelected(null);
    } catch (e: any) { Alert.alert("Erro", e.message); }
    finally { setSaving(false); }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingTop: topInset + 12, paddingBottom: 12, paddingHorizontal: 20, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <TouchableOpacity onPress={() => router.back()}><Feather name="arrow-left" size={22} color={colors.primary} /></TouchableOpacity>
          <Text style={{ flex: 1, fontSize: 20, fontFamily: "Inter_700Bold", color: colors.foreground }}>Ordens de Serviço</Text>
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
            <Feather name="tool" size={40} color={colors.mutedForeground} />
            <Text style={{ color: colors.mutedForeground, marginTop: 12 }}>Nenhuma ordem encontrada</Text>
          </View>
        ) : filtered.map(o => <ServiceCard key={o.id} order={o} onPress={() => openOrder(o)} />)}
      </ScrollView>

      <Modal visible={!!selected} animationType="slide" transparent onRequestClose={() => setSelected(null)}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: insets.bottom + 24 }}>
            <Text style={{ fontSize: 18, fontFamily: "Inter_700Bold", color: colors.foreground, marginBottom: 4 }}>{selected?.serviceType}</Text>
            <Text style={{ fontSize: 13, color: colors.mutedForeground, marginBottom: 16 }}>{selected?.clientName}</Text>
            <Text style={{ fontSize: 13, fontFamily: "Inter_600SemiBold", color: colors.foreground, marginBottom: 8 }}>Status</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
              {STATUS_OPTIONS.map(opt => (
                <Pressable key={opt.value} onPress={() => setEditStatus(opt.value)} style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: editStatus === opt.value ? colors.primary : colors.muted }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: DOT_COLORS[opt.value] }} />
                  <Text style={{ fontSize: 13, color: editStatus === opt.value ? "#fff" : colors.foreground }}>{opt.label}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={{ fontSize: 13, fontFamily: "Inter_600SemiBold", color: colors.foreground, marginBottom: 8 }}>Pagamento</Text>
            <TextInput placeholder="Método (pix, cartão...)" placeholderTextColor={colors.mutedForeground} value={editPayment} onChangeText={setEditPayment} style={{ backgroundColor: colors.muted, borderRadius: 10, padding: 12, marginBottom: 10, color: colors.foreground, fontSize: 14 }} />
            <TextInput placeholder="Valor pago (R$)" placeholderTextColor={colors.mutedForeground} value={editAmount} onChangeText={setEditAmount} keyboardType="numeric" style={{ backgroundColor: colors.muted, borderRadius: 10, padding: 12, marginBottom: 16, color: colors.foreground, fontSize: 14 }} />
            <TouchableOpacity onPress={handleSave} disabled={saving} style={{ backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 14, alignItems: "center" }}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontFamily: "Inter_600SemiBold", fontSize: 15 }}>Salvar alterações</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
