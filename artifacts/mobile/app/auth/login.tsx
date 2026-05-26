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

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!email.trim()) e.email = "E-mail é obrigatório";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "E-mail inválido";
    if (!password) e.password = "Senha é obrigatória";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      Alert.alert("Erro", err.message || "Não foi possível fazer login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={{ paddingTop: insets.top + 16, paddingBottom: 40, paddingHorizontal: 24, flex: 1, justifyContent: "center" }}>
          <TouchableOpacity onPress={() => router.back()} style={{ alignSelf: "flex-start", marginBottom: 32 }}>
            <Feather name="arrow-left" size={24} color={colors.foreground} />
          </TouchableOpacity>

          <View style={{ width: 56, height: 56, borderRadius: 14, backgroundColor: colors.secondary, alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
            <Feather name="log-in" size={26} color={colors.primary} />
          </View>
          <Text style={{ fontSize: 28, fontFamily: "Inter_700Bold", color: colors.foreground, marginBottom: 6 }}>Entrar</Text>
          <Text style={{ fontSize: 14, color: colors.mutedForeground, fontFamily: "Inter_400Regular", marginBottom: 32 }}>
            Acesse sua conta {BRAND.company.shortName}
          </Text>

          <View style={{ gap: 16, marginBottom: 24 }}>
            <Input
              label="E-mail"
              placeholder="seu@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              value={email}
              onChangeText={setEmail}
              error={errors.email}
              icon="mail"
            />
            <Input
              label="Senha"
              placeholder="••••••••"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              error={errors.password}
              icon="lock"
            />
          </View>

          <TouchableOpacity onPress={() => router.push("/auth/forgot-password" as any)} style={{ alignSelf: "flex-end", marginBottom: 24 }}>
            <Text style={{ fontSize: 13, color: colors.primary, fontFamily: "Inter_500Medium" }}>Esqueceu a senha?</Text>
          </TouchableOpacity>

          <Button title="Entrar" onPress={handleLogin} loading={loading} style={{ marginBottom: 16 }} />

          <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6 }}>
            <Text style={{ fontSize: 14, color: colors.mutedForeground }}>Não tem conta?</Text>
            <TouchableOpacity onPress={() => router.push("/auth/register" as any)}>
              <Text style={{ fontSize: 14, color: colors.primary, fontFamily: "Inter_600SemiBold" }}>Criar conta</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
