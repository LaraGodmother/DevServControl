import React, { useState } from "react";
import { Alert, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { useStore } from "@/context/StoreContext";
import { Card } from "@/components/ui/Card";
import { BRAND } from "@/constants/theme";

function fmt(v: number) { return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); }

export default function ClientLojaScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const { products, cart, addToCart, removeFromCart, clearCart, cartTotal, cartCount } = useStore();
  const [cat, setCat] = useState("Todos");
  const [showCart, setShowCart] = useState(false);
  const categories = [...new Set(products.map(p => p.category))];
  const filtered = cat === "Todos" ? products : products.filter(p => p.category === cat);

  const handleAdd = (product: any) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    addToCart(product);
  };

  const handleCheckout = () => {
    Alert.alert("Pedido", `Total: ${fmt(cartTotal)}\n\nDeseja confirmar o pedido via WhatsApp?`, [
      { text: "Cancelar", style: "cancel" },
      { text: "Confirmar", onPress: () => { clearCart(); setShowCart(false); Alert.alert("Pedido enviado!", "Nossa equipe entrará em contato para confirmar."); } },
    ]);
  };

  if (showCart) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ paddingTop: topInset + 12, paddingBottom: 16, paddingHorizontal: 20, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: "row", alignItems: "center", gap: 12 }}>
          <TouchableOpacity onPress={() => setShowCart(false)}><Feather name="arrow-left" size={22} color={colors.primary} /></TouchableOpacity>
          <Text style={{ flex: 1, fontSize: 20, fontFamily: "Inter_700Bold", color: colors.foreground }}>Carrinho</Text>
        </View>
        <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
          {cart.length === 0 ? (
            <View style={{ alignItems: "center", padding: 40 }}>
              <Feather name="shopping-cart" size={40} color={colors.mutedForeground} />
              <Text style={{ color: colors.mutedForeground, marginTop: 12 }}>Carrinho vazio</Text>
            </View>
          ) : (
            <>
              {cart.map(item => (
                <Card key={item.product.id}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontFamily: "Inter_600SemiBold", color: colors.foreground }}>{item.product.name}</Text>
                      <Text style={{ fontSize: 13, color: colors.primary, marginTop: 2 }}>{fmt(item.product.price)} x {item.quantity}</Text>
                    </View>
                    <Text style={{ fontSize: 14, fontFamily: "Inter_700Bold", color: BRAND.colors.primary }}>{fmt(item.product.price * item.quantity)}</Text>
                    <TouchableOpacity onPress={() => removeFromCart(item.product.id)}><Feather name="trash-2" size={18} color={colors.destructive} /></TouchableOpacity>
                  </View>
                </Card>
              ))}
              <View style={{ backgroundColor: BRAND.colors.primaryLight, borderRadius: 14, padding: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ fontSize: 16, fontFamily: "Inter_700Bold", color: BRAND.colors.primary }}>Total</Text>
                <Text style={{ fontSize: 20, fontFamily: "Inter_700Bold", color: BRAND.colors.primary }}>{fmt(cartTotal)}</Text>
              </View>
              <TouchableOpacity onPress={handleCheckout} style={{ backgroundColor: BRAND.colors.primary, borderRadius: 14, paddingVertical: 16, alignItems: "center" }}>
                <Text style={{ color: "#fff", fontFamily: "Inter_700Bold", fontSize: 16 }}>Confirmar Pedido</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingTop: topInset + 12, paddingBottom: 12, paddingHorizontal: 20, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <TouchableOpacity onPress={() => router.back()}><Feather name="arrow-left" size={22} color={colors.primary} /></TouchableOpacity>
          <Text style={{ flex: 1, fontSize: 20, fontFamily: "Inter_700Bold", color: colors.foreground }}>Loja</Text>
          <TouchableOpacity onPress={() => setShowCart(true)} style={{ position: "relative" }}>
            <Feather name="shopping-cart" size={22} color={colors.primary} />
            {cartCount > 0 && (
              <View style={{ position: "absolute", top: -6, right: -8, backgroundColor: BRAND.colors.accent, width: 18, height: 18, borderRadius: 9, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: "#fff", fontSize: 10, fontFamily: "Inter_700Bold" }}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
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
        {filtered.map(p => {
          const inCart = cart.find(i => i.product.id === p.id);
          return (
            <Card key={p.id}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
                <View style={{ width: 54, height: 54, borderRadius: 12, backgroundColor: BRAND.colors.primaryLight, alignItems: "center", justifyContent: "center" }}>
                  <Feather name="package" size={26} color={BRAND.colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontFamily: "Inter_600SemiBold", color: colors.foreground }}>{p.name}</Text>
                  <Text style={{ fontSize: 12, color: colors.mutedForeground }} numberOfLines={2}>{p.description}</Text>
                  <Text style={{ fontSize: 16, fontFamily: "Inter_700Bold", color: BRAND.colors.primary, marginTop: 4 }}>{fmt(p.price)}</Text>
                </View>
                <TouchableOpacity onPress={() => handleAdd(p)} style={{ backgroundColor: inCart ? colors.secondary : BRAND.colors.primary, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <Feather name={inCart ? "check" : "plus"} size={16} color={inCart ? BRAND.colors.primary : "#fff"} />
                  <Text style={{ color: inCart ? BRAND.colors.primary : "#fff", fontSize: 13, fontFamily: "Inter_600SemiBold" }}>{inCart ? `${inCart.quantity}` : "Add"}</Text>
                </TouchableOpacity>
              </View>
            </Card>
          );
        })}
      </ScrollView>
    </View>
  );
}
