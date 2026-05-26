import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function ForgotPasswordScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) { Alert.alert("Atenção", "Informe seu e-mail."); return; }
    setLoading(true);
    try {
      await api.recoverPassword(email.trim().toLowerCase());
      setSent(true);
    } catch (err: any) {
      Alert.alert("Erro", err.message || "Não foi possível enviar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1, paddingTop: insets.top + 16, paddingHorizontal: 24 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ alignSelf: "flex-start", marginBottom: 32 }}>
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <View style={{ width: 56, height: 56, borderRadius: 14, backgroundColor: colors.secondary, alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
          <Feather name="key" size={26} color={colors.primary} />
        </View>
        <Text style={{ fontSize: 28, fontFamily: "Inter_700Bold", color: colors.foreground, marginBottom: 8 }}>Recuperar senha</Text>

        {!sent ? (
          <>
            <Text style={{ fontSize: 14, color: colors.mutedForeground, marginBottom: 32, lineHeight: 22 }}>
              Informe seu e-mail e enviaremos instruções para recuperar sua senha.
            </Text>
            <Input label="E-mail" placeholder="seu@email.com" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} icon="mail" />
            <View style={{ height: 20 }} />
            <Button title="Enviar instruções" onPress={handleSubmit} loading={loading} />
          </>
        ) : (
          <View style={{ alignItems: "center", marginTop: 32 }}>
            <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: "#dcfce7", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <Feather name="check-circle" size={36} color="#15803d" />
            </View>
            <Text style={{ fontSize: 18, fontFamily: "Inter_600SemiBold", color: colors.foreground, marginBottom: 8 }}>E-mail enviado!</Text>
            <Text style={{ fontSize: 14, color: colors.mutedForeground, textAlign: "center", lineHeight: 22 }}>
              Se o e-mail existir em nossa base, você receberá as instruções em breve.
            </Text>
            <View style={{ height: 32 }} />
            <Button title="Voltar ao login" onPress={() => router.push("/auth/login" as any)} variant="outline" />
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
