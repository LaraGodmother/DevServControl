import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Modal, Platform, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { Card } from "@/components/ui/Card";
import { api, type ApiUser } from "@/lib/api";
import { openExportUrl, fmtDate } from "@/lib/exportCsv";
import { BRAND } from "@/constants/theme";

function initials(name: string) {
  return name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
}

export default function AdminClientsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const [clients, setClients] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", document: "", address: "", password: "" });
  const [saving, setSaving] = useState(false);

  const loadClients = useCallback(async () => {
    setLoading(true);
    try { const data = await api.getClients(); setClients(data); }
    catch { Alert.alert("Erro", "Não foi possível carregar clientes."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadClients(); }, []);

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone ?? "").includes(search)
  );

  const handleCreate = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      Alert.alert("Atenção", "Nome, e-mail e senha são obrigatórios."); return;
    }
    setSaving(true);
    try {
      await api.createClient({ name: form.name, email: form.email, password: form.password, phone: form.phone || undefined, document: form.document || undefined, address: form.address || undefined });
      setShowModal(false);
      setForm({ name: "", email: "", phone: "", document: "", address: "", password: "" });
      await loadClients();
    } catch (e: any) {
      Alert.alert("Erro", e.message || "Não foi possível criar cliente.");
    } finally { setSaving(false); }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingTop: topInset + 12, paddingBottom: 16, paddingHorizontal: 20, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <TouchableOpacity onPress={() => router.back()}><Feather name="arrow-left" size={22} color={colors.primary} /></TouchableOpacity>
          <Text style={{ flex: 1, fontSize: 20, fontFamily: "Inter_700Bold", color: colors.foreground }}>Clientes</Text>
          <TouchableOpacity onPress={() => openExportUrl("/export/clientes.csv")} style={{ marginRight: 8 }}>
            <Feather name="download" size={20} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowModal(true)} style={{ backgroundColor: colors.primary, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Feather name="user-plus" size={16} color="#fff" />
            <Text style={{ color: "#fff", fontSize: 13, fontFamily: "Inter_600SemiBold" }}>Novo</Text>
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: colors.muted, borderRadius: 10, paddingHorizontal: 12, marginTop: 14 }}>
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput placeholder="Buscar clientes..." placeholderTextColor={colors.mutedForeground} value={search} onChangeText={setSearch} style={{ flex: 1, paddingVertical: 10, paddingHorizontal: 8, color: colors.foreground, fontSize: 14 }} />
        </View>
      </View>

      {loading ? <ActivityIndicator style={{ marginTop: 40 }} size="large" color={colors.primary} /> : (
        <ScrollView refreshControl={<RefreshControl refreshing={loading} onRefresh={loadClients} />} contentContainerStyle={{ padding: 16, gap: 12 }}>
          {filtered.length === 0 ? (
            <View style={{ alignItems: "center", padding: 40 }}>
              <Feather name="users" size={40} color={colors.mutedForeground} />
              <Text style={{ color: colors.mutedForeground, marginTop: 12, fontSize: 15 }}>Nenhum cliente encontrado</Text>
            </View>
          ) : filtered.map(c => (
            <Card key={c.id}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: BRAND.colors.primaryLight, alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ fontSize: 15, fontFamily: "Inter_700Bold", color: BRAND.colors.primary }}>{initials(c.name)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontFamily: "Inter_600SemiBold", color: colors.foreground }}>{c.name}</Text>
                  <Text style={{ fontSize: 12, color: colors.mutedForeground }}>{c.email}</Text>
                  {c.phone ? <Text style={{ fontSize: 12, color: colors.mutedForeground }}>{c.phone}</Text> : null}
                </View>
                <Text style={{ fontSize: 11, color: colors.mutedForeground }}>{fmtDate(c.createdAt)}</Text>
              </View>
            </Card>
          ))}
        </ScrollView>
      )}

      <Modal visible={showModal} animationType="slide" transparent onRequestClose={() => setShowModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <TouchableOpacity style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }} activeOpacity={1} onPress={() => setShowModal(false)} />
          <View style={{ backgroundColor: colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: insets.bottom + 20 }}>
            <Text style={{ fontSize: 18, fontFamily: "Inter_700Bold", color: colors.foreground, marginBottom: 16 }}>Novo Cliente</Text>
            {["name", "email", "phone", "document", "address", "password"].map(k => (
              <TextInput key={k} placeholder={{ name: "Nome *", email: "E-mail *", phone: "Telefone", document: "CPF/CNPJ", address: "Endereço", password: "Senha *" }[k]} placeholderTextColor={colors.mutedForeground} value={(form as any)[k]} onChangeText={v => setForm(f => ({ ...f, [k]: v }))} secureTextEntry={k === "password"} autoCapitalize="none" style={{ backgroundColor: colors.muted, borderRadius: 10, padding: 12, marginBottom: 10, color: colors.foreground, fontSize: 14 }} />
            ))}
            <TouchableOpacity onPress={handleCreate} disabled={saving} style={{ backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 14, alignItems: "center" }}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontFamily: "Inter_600SemiBold", fontSize: 15 }}>Criar cliente</Text>}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
