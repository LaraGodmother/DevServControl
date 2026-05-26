import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";

export default function RequestBudgetScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isAuthenticated, user } = useAuth();
  const { createBudgetRequest, services } = useData();

  const activeServices = services.filter(s => s.active);
  const serviceNames = activeServices.map(s => s.name);

  const [serviceName, setServiceName] = useState("");
  const [description, setDescription] = useState("");
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState((user as any)?.phone ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Nome é obrigatório";
    if (!email.trim()) e.email = "E-mail é obrigatório";
    if (!serviceName) e.serviceName = "Selecione um serviço";
    if (!description.trim()) e.description = "Descrição é obrigatória";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      if (isAuthenticated && user) {
        await createBudgetRequest({ serviceType: serviceName, description, clientId: String(user.id), name, email, phone });
      } else {
        Alert.alert("Atenção", "Para solicitar um orçamento, faça login ou crie uma conta gratuita.");
        router.push("/auth/login" as any);
        return;
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      setSuccess(true);
    } catch (err: any) {
      Alert.alert("Erro", err.message || "Não foi possível enviar o orçamento.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center", padding: 32 }}>
        <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: "#dcfce7", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
          <Feather name="check-circle" size={40} color="#15803d" />
        </View>
        <Text style={{ fontSize: 22, fontFamily: "Inter_700Bold", color: colors.foreground, marginBottom: 8, textAlign: "center" }}>Orçamento solicitado!</Text>
        <Text style={{ fontSize: 14, color: colors.mutedForeground, textAlign: "center", lineHeight: 22 }}>
          Nossa equipe entrará em contato em breve com a proposta.
        </Text>
        <View style={{ height: 32 }} />
        <Button title="Voltar ao início" onPress={() => router.replace("/" as any)} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View style={{ paddingTop: insets.top + 16, paddingBottom: 40, paddingHorizontal: 24 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ alignSelf: "flex-start", marginBottom: 32 }}>
            <Feather name="arrow-left" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={{ fontSize: 26, fontFamily: "Inter_700Bold", color: colors.foreground, marginBottom: 6 }}>Solicitar Orçamento</Text>
          <Text style={{ fontSize: 14, color: colors.mutedForeground, marginBottom: 28 }}>Preencha os dados abaixo e retornaremos em breve.</Text>
          <View style={{ gap: 16 }}>
            <Input label="Nome completo" placeholder="João Silva" value={name} onChangeText={setName} error={errors.name} icon="user" />
            <Input label="E-mail" placeholder="seu@email.com" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} error={errors.email} icon="mail" />
            <Input label="Telefone" placeholder="(11) 99999-9999" keyboardType="phone-pad" value={phone} onChangeText={setPhone} icon="phone" />
            <Select label="Serviço desejado" value={serviceName} options={serviceNames.length ? serviceNames : ["Elétrica", "CFTV", "Refrigeração", "Automação", "Manutenção Geral"]} onChange={setServiceName} placeholder="Selecione o serviço..." error={errors.serviceName} />
            <Input label="Descrição do serviço" placeholder="Descreva o que precisa..." value={description} onChangeText={setDescription} error={errors.description} multiline numberOfLines={4} style={{ minHeight: 100, textAlignVertical: "top" }} />
          </View>
          <View style={{ height: 28 }} />
          <Button title="Solicitar Orçamento" onPress={handleSubmit} loading={loading} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
