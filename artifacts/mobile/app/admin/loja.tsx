import React, { useState } from "react";
import { Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useStore, type Product } from "@/context/StoreContext";
import { Card } from "@/components/ui/Card";
import { BRAND } from "@/constants/theme";

function fmt(v: number) { return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); }

export default function AdminLojaScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const { products } = useStore();
  const [selected, setSelected] = useState<string | null>(null);

  const categories = [...new Set(products.map(p => p.category))];
  const [cat, setCat] = useState("Todos");

  const filtered = cat === "Todos" ? products : products.filter(p => p.category === cat);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingTop: topInset + 12, paddingBottom: 12, paddingHorizontal: 20, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <TouchableOpacity onPress={() => router.back()}><Feather name="arrow-left" size={22} color={colors.primary} /></TouchableOpacity>
          <Text style={{ flex: 1, fontSize: 20, fontFamily: "Inter_700Bold", color: colors.foreground }}>Loja</Text>
          <View style={{ backgroundColor: BRAND.colors.primaryLight, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 }}>
            <Text style={{ fontSize: 12, fontFamily: "Inter_600SemiBold", color: BRAND.colors.primary }}>{products.length} produtos</Text>
          </View>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {["Todos", ...categories].map(c => (
              <TouchableOpacity key={c} onPress={() => setCat(c)} style={{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: cat === c ? BRAND.colors.primary : colors.muted }}>
                <Text style={{ fontSize: 13, fontFamily: "Inter_500Medium", color: cat === c ? "#fff" : colors.mutedForeground }}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        {filtered.map(p => (
          <Card key={p.id}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
              <View style={{ width: 50, height: 50, borderRadius: 12, backgroundColor: BRAND.colors.primaryLight, alignItems: "center", justifyContent: "center" }}>
                <Feather name="package" size={24} color={BRAND.colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontFamily: "Inter_600SemiBold", color: colors.foreground }}>{p.name}</Text>
                <Text style={{ fontSize: 12, color: colors.mutedForeground }} numberOfLines={2}>{p.description}</Text>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 6 }}>
                  <Text style={{ fontSize: 16, fontFamily: "Inter_700Bold", color: BRAND.colors.primary }}>{fmt(p.price)}</Text>
                  <View style={{ backgroundColor: colors.muted, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                    <Text style={{ fontSize: 11, color: colors.mutedForeground }}>{p.category}</Text>
                  </View>
                </View>
              </View>
            </View>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}
