import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { BRAND } from "@/constants/theme";

export default function RegisterScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const set = (key: string) => (val: string) => setForm(f => ({ ...f, [key]: val }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Nome é obrigatório";
    if (!form.email.trim()) e.email = "E-mail é obrigatório";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "E-mail inválido";
    if (!form.password) e.password = "Senha é obrigatória";
    else if (form.password.length < 6) e.password = "Mínimo 6 caracteres";
    if (form.password !== form.confirmPassword) e.confirmPassword = "Senhas não conferem";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await register({ name: form.name.trim(), email: form.email.trim().toLowerCase(), password: form.password, phone: form.phone || undefined });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      Alert.alert("Erro", err.message || "Não foi possível criar conta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={{ paddingTop: insets.top + 16, paddingBottom: 40, paddingHorizontal: 24 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ alignSelf: "flex-start", marginBottom: 32 }}>
            <Feather name="arrow-left" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <View style={{ width: 56, height: 56, borderRadius: 14, backgroundColor: colors.secondary, alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
            <Feather name="user-plus" size={26} color={colors.primary} />
          </View>
          <Text style={{ fontSize: 28, fontFamily: "Inter_700Bold", color: colors.foreground, marginBottom: 6 }}>Criar conta</Text>
          <Text style={{ fontSize: 14, color: colors.mutedForeground, marginBottom: 32 }}>
            Junte-se ao {BRAND.company.shortName}
          </Text>
          <View style={{ gap: 16, marginBottom: 24 }}>
            <Input label="Nome completo" placeholder="João Silva" value={form.name} onChangeText={set("name")} error={errors.name} icon="user" />
            <Input label="E-mail" placeholder="seu@email.com" keyboardType="email-address" autoCapitalize="none" value={form.email} onChangeText={set("email")} error={errors.email} icon="mail" />
            <Input label="Telefone" placeholder="(11) 99999-9999" keyboardType="phone-pad" value={form.phone} onChangeText={set("phone")} icon="phone" />
            <Input label="Senha" placeholder="••••••••" secureTextEntry value={form.password} onChangeText={set("password")} error={errors.password} icon="lock" />
            <Input label="Confirmar senha" placeholder="••••••••" secureTextEntry value={form.confirmPassword} onChangeText={set("confirmPassword")} error={errors.confirmPassword} icon="lock" />
          </View>
          <Button title="Criar conta" onPress={handleRegister} loading={loading} style={{ marginBottom: 16 }} />
          <View style={{ flexDirection: "row", justifyContent: "center", gap: 6 }}>
            <Text style={{ fontSize: 14, color: colors.mutedForeground }}>Já tem conta?</Text>
            <TouchableOpacity onPress={() => router.push("/auth/login" as any)}>
              <Text style={{ fontSize: 14, color: colors.primary, fontFamily: "Inter_600SemiBold" }}>Entrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
