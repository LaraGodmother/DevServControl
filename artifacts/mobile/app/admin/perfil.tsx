import React, { useState, useEffect } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";
import { api, type CompanySettings } from "@/lib/api";
import { openExportUrl } from "@/lib/exportCsv";
import { BRAND } from "@/constants/theme";
import { LANGUAGES, type Language } from "@/lib/i18n";

export default function PerfilScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { whatsappNumber, setWhatsappNumber, language, setLanguage, tr } = useSettings();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const [company, setCompany] = useState<CompanySettings | null>(null);
  const [editingCompany, setEditingCompany] = useState(false);
  const [companyForm, setCompanyForm] = useState<CompanySettings>({ name: "", cnpj: "", phone: "", email: "", city: "", address: "" });
  const [savingCompany, setSavingCompany] = useState(false);
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [changingPwd, setChangingPwd] = useState(false);

  useEffect(() => {
    api.getCompanySettings().then(s => { setCompany(s); setCompanyForm(s); }).catch(() => {});
  }, []);

  const handleSaveCompany = async () => {
    setSavingCompany(true);
    try { const s = await api.updateCompanySettings(companyForm); setCompany(s); setEditingCompany(false); Alert.alert("Sucesso", "Configurações salvas!"); }
    catch { Alert.alert("Erro", "Não foi possível salvar."); }
    finally { setSavingCompany(false); }
  };

  const handleChangePassword = async () => {
    if (!currentPwd || !newPwd) { Alert.alert("Atenção", "Preencha ambos os campos."); return; }
    setChangingPwd(true);
    try { await api.changePassword(currentPwd, newPwd); setCurrentPwd(""); setNewPwd(""); Alert.alert("Sucesso", "Senha alterada com sucesso!"); }
    catch (e: any) { Alert.alert("Erro", e.message || "Não foi possível alterar a senha."); }
    finally { setChangingPwd(false); }
  };

  const handleLogout = () => {
    Alert.alert("Sair", "Deseja sair da conta?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", style: "destructive", onPress: async () => { await logout(); router.replace("/" as any); } },
    ]);
  };

  const EXPORTS = [
    { key: "clientes", label: "Clientes", route: "/export/clientes.csv", icon: "users" as const, color: "#3b82f6" },
    { key: "orcamentos", label: "Orçamentos", route: "/export/orcamentos.csv", icon: "file-text" as const, color: "#8b5cf6" },
    { key: "ordens", label: "Ordens de Serviço", route: "/export/ordens.csv", icon: "tool" as const, color: "#f59e0b" },
    { key: "servicos", label: "Serviços", route: "/export/servicos.csv", icon: "settings" as const, color: "#10b981" },
  ];

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingTop: topInset + 12, paddingBottom: 16, paddingHorizontal: 20, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: "row", alignItems: "center", gap: 12 }}>
        <TouchableOpacity onPress={() => router.back()}><Feather name="arrow-left" size={22} color={colors.primary} /></TouchableOpacity>
        <Text style={{ flex: 1, fontSize: 20, fontFamily: "Inter_700Bold", color: colors.foreground }}>Perfil & Config.</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <View style={{ backgroundColor: colors.card, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: colors.border, alignItems: "center", gap: 8 }}>
          <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: BRAND.colors.primaryLight, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ fontSize: 24, fontFamily: "Inter_700Bold", color: BRAND.colors.primary }}>{user?.name?.[0]?.toUpperCase() ?? "A"}</Text>
          </View>
          <Text style={{ fontSize: 17, fontFamily: "Inter_700Bold", color: colors.foreground }}>{user?.name}</Text>
          <Text style={{ fontSize: 13, color: colors.mutedForeground }}>{user?.email}</Text>
          <View style={{ backgroundColor: BRAND.colors.primaryLight, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 }}>
            <Text style={{ fontSize: 12, fontFamily: "Inter_600SemiBold", color: BRAND.colors.primary }}>Administrador</Text>
          </View>
        </View>

        <View style={{ backgroundColor: colors.card, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: colors.border }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <Text style={{ fontSize: 15, fontFamily: "Inter_700Bold", color: colors.foreground }}>Empresa</Text>
            <TouchableOpacity onPress={() => setEditingCompany(!editingCompany)}><Feather name="edit-2" size={18} color={colors.primary} /></TouchableOpacity>
          </View>
          {editingCompany ? (
            <>
              {["name","cnpj","phone","email","city","address"].map(k => (
                <TextInput key={k} placeholder={{ name:"Nome",cnpj:"CNPJ",phone:"Telefone",email:"E-mail",city:"Cidade",address:"Endereço" }[k]} placeholderTextColor={colors.mutedForeground} value={(companyForm as any)[k]} onChangeText={v => setCompanyForm(f => ({ ...f, [k]: v }))} style={{ backgroundColor: colors.muted, borderRadius: 10, padding: 12, marginBottom: 8, color: colors.foreground, fontSize: 14 }} />
              ))}
              <TouchableOpacity onPress={handleSaveCompany} disabled={savingCompany} style={{ backgroundColor: colors.primary, borderRadius: 10, paddingVertical: 12, alignItems: "center", marginTop: 4 }}>
                <Text style={{ color: "#fff", fontFamily: "Inter_600SemiBold" }}>Salvar empresa</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {company && Object.entries({ "Nome": company.name, "CNPJ": company.cnpj, "Telefone": company.phone, "E-mail": company.email }).map(([k, v]) => (
                <View key={k} style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
                  <Text style={{ fontSize: 13, color: colors.mutedForeground }}>{k}</Text>
                  <Text style={{ fontSize: 13, color: colors.foreground }}>{v}</Text>
                </View>
              ))}
            </>
          )}
        </View>

        <View style={{ backgroundColor: colors.card, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ fontSize: 15, fontFamily: "Inter_700Bold", color: colors.foreground, marginBottom: 12 }}>Alterar Senha</Text>
          <TextInput placeholder="Senha atual" placeholderTextColor={colors.mutedForeground} secureTextEntry value={currentPwd} onChangeText={setCurrentPwd} style={{ backgroundColor: colors.muted, borderRadius: 10, padding: 12, marginBottom: 8, color: colors.foreground, fontSize: 14 }} />
          <TextInput placeholder="Nova senha" placeholderTextColor={colors.mutedForeground} secureTextEntry value={newPwd} onChangeText={setNewPwd} style={{ backgroundColor: colors.muted, borderRadius: 10, padding: 12, marginBottom: 10, color: colors.foreground, fontSize: 14 }} />
          <TouchableOpacity onPress={handleChangePassword} disabled={changingPwd} style={{ backgroundColor: colors.primary, borderRadius: 10, paddingVertical: 12, alignItems: "center" }}>
            <Text style={{ color: "#fff", fontFamily: "Inter_600SemiBold" }}>Alterar senha</Text>
          </TouchableOpacity>
        </View>

        <View style={{ backgroundColor: colors.card, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ fontSize: 15, fontFamily: "Inter_700Bold", color: colors.foreground, marginBottom: 12 }}>Exportar Dados</Text>
          {EXPORTS.map(e => (
            <TouchableOpacity key={e.key} onPress={() => openExportUrl(e.route)} style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border }}>
              <View style={{ width: 36, height: 36, borderRadius: 9, backgroundColor: `${e.color}20`, alignItems: "center", justifyContent: "center" }}>
                <Feather name={e.icon} size={18} color={e.color} />
              </View>
              <Text style={{ flex: 1, fontSize: 14, color: colors.foreground }}>{e.label}</Text>
              <Feather name="download" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity onPress={handleLogout} style={{ backgroundColor: "#fee2e2", borderRadius: 14, padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 }}>
          <Feather name="log-out" size={20} color="#b91c1c" />
          <Text style={{ fontSize: 15, fontFamily: "Inter_600SemiBold", color: "#b91c1c" }}>Sair da conta</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
