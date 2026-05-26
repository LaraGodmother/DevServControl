import React, { useEffect } from "react";
import { ActivityIndicator, Image, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useAuth } from "@/context/AuthContext";
import { BRAND } from "@/constants/theme";

export default function LandingScreen() {
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      if (user?.role === "admin") router.replace("/admin/index" as any);
      else router.replace("/client/index" as any);
    }
  }, [isAuthenticated, isLoading, user]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: BRAND.colors.primary }}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  const press = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});

  return (
    <LinearGradient colors={[BRAND.colors.primaryDark, BRAND.colors.primary, "#2196F3"]} style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image source={BRAND.logo} style={styles.logo} resizeMode="contain" />
        </View>

        <Text style={styles.title}>ServControl</Text>
        <Text style={styles.subtitle}>{BRAND.company.tagline}</Text>

        <View style={styles.divider} />

        <View style={styles.buttons}>
          <Pressable
            style={({ pressed }) => [styles.btnPrimary, { opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] }]}
            onPress={() => { press(); router.push("/auth/login" as any); }}
          >
            <Feather name="log-in" size={18} color="#fff" />
            <Text style={styles.btnPrimaryText}>Entrar</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.btnSecondary, { opacity: pressed ? 0.85 : 1 }]}
            onPress={() => { press(); router.push("/auth/register" as any); }}
          >
            <Feather name="user-plus" size={18} color={BRAND.colors.primary} />
            <Text style={styles.btnSecondaryText}>Criar conta</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.btnGhost, { opacity: pressed ? 0.7 : 1 }]}
            onPress={() => { press(); router.push("/auth/request-budget" as any); }}
          >
            <Text style={styles.btnGhostText}>Solicitar orçamento sem conta</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>{BRAND.company.cnpj}</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 },
  logoContainer: { width: 130, height: 130, borderRadius: 30, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center", marginBottom: 20 },
  logo: { width: 110, height: 110 },
  title: { fontSize: 38, fontFamily: "Inter_700Bold", color: "#fff", letterSpacing: -1, marginBottom: 8 },
  subtitle: { fontSize: 14, color: "rgba(255,255,255,0.75)", fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22, marginBottom: 32 },
  divider: { width: 40, height: 2, backgroundColor: "rgba(255,255,255,0.3)", marginBottom: 32 },
  buttons: { width: "100%", gap: 14 },
  btnPrimary: { backgroundColor: "#F57C00", borderRadius: 14, paddingVertical: 16, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 10 },
  btnPrimaryText: { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },
  btnSecondary: { backgroundColor: "#fff", borderRadius: 14, paddingVertical: 16, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 10 },
  btnSecondaryText: { color: "#1976D2", fontSize: 16, fontFamily: "Inter_600SemiBold" },
  btnGhost: { alignItems: "center", paddingVertical: 10 },
  btnGhostText: { color: "rgba(255,255,255,0.7)", fontSize: 13, fontFamily: "Inter_400Regular", textDecorationLine: "underline" },
  footer: { paddingBottom: Platform.OS === "web" ? 24 : 40, alignItems: "center" },
  footerText: { color: "rgba(255,255,255,0.4)", fontSize: 11 },
});
