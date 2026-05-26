import React, { useState, useEffect, useRef, useCallback } from "react";
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { api, type ApiChatMessage } from "@/lib/api";
import { BRAND } from "@/constants/theme";

function timeLabel(d: string) {
  const date = new Date(d);
  const diff = Math.floor((Date.now() - date.getTime()) / 86400000);
  if (diff === 0) return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  if (diff === 1) return "Ontem";
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

export default function ClientChatScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const [messages, setMessages] = useState<ApiChatMessage[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [adminId, setAdminId] = useState<number | null>(null);
  const flatRef = useRef<FlatList>(null);

  const loadMessages = useCallback(async (adId: number) => {
    try { const msgs = await api.getChatMessages(adId); setMessages(msgs); setTimeout(() => flatRef.current?.scrollToEnd({ animated: false }), 100); }
    catch { }
  }, []);

  useEffect(() => {
    api.getAdminId().then(({ adminId: id }) => {
      setAdminId(id);
      setLoading(false);
      loadMessages(id);
    }).catch(() => setLoading(false));
  }, [loadMessages]);

  useEffect(() => {
    if (!adminId) return;
    const iv = setInterval(() => loadMessages(adminId), 4000);
    return () => clearInterval(iv);
  }, [adminId, loadMessages]);

  const handleSend = async () => {
    if (!text.trim() || !adminId) return;
    setSending(true);
    const msg = text.trim(); setText("");
    try { const m = await api.sendChatMessage(adminId, msg); setMessages(p => [...p, m]); setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100); }
    catch { setText(msg); }
    finally { setSending(false); }
  };

  if (loading) {
    return <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background }}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  const myId = user?.id;
  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingTop: topInset + 12, paddingBottom: 14, paddingHorizontal: 20, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: "row", alignItems: "center", gap: 12 }}>
        <TouchableOpacity onPress={() => router.back()}><Feather name="arrow-left" size={22} color={colors.primary} /></TouchableOpacity>
        <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: BRAND.colors.primaryLight, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontFamily: "Inter_700Bold", color: BRAND.colors.primary, fontSize: 14 }}>A</Text>
        </View>
        <View>
          <Text style={{ fontSize: 15, fontFamily: "Inter_600SemiBold", color: colors.foreground }}>ServControl Suporte</Text>
          <Text style={{ fontSize: 12, color: "#22c55e" }}>Online</Text>
        </View>
      </View>

      <FlatList ref={flatRef} data={messages} keyExtractor={i => String(i.id)} contentContainerStyle={{ padding: 16, gap: 10 }}
        ListEmptyComponent={<View style={{ alignItems: "center", padding: 40 }}><Feather name="message-circle" size={40} color={colors.mutedForeground} /><Text style={{ color: colors.mutedForeground, marginTop: 12 }}>Inicie a conversa</Text></View>}
        onLayout={() => flatRef.current?.scrollToEnd({ animated: false })}
        renderItem={({ item }) => {
          const mine = item.fromUserId === myId;
          return (
            <View style={{ alignItems: mine ? "flex-end" : "flex-start" }}>
              <View style={{ maxWidth: "78%", backgroundColor: mine ? BRAND.colors.primary : colors.card, borderRadius: 16, borderBottomRightRadius: mine ? 4 : 16, borderBottomLeftRadius: mine ? 16 : 4, padding: 12, borderWidth: mine ? 0 : 1, borderColor: colors.border }}>
                <Text style={{ color: mine ? "#fff" : colors.foreground, fontSize: 14, lineHeight: 20 }}>{item.message}</Text>
              </View>
              <Text style={{ fontSize: 10, color: colors.mutedForeground, marginTop: 3 }}>{timeLabel(item.createdAt)}</Text>
            </View>
          );
        }}
      />
      <View style={{ flexDirection: "row", alignItems: "center", padding: 12, paddingBottom: insets.bottom + 12, backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.border, gap: 10 }}>
        <TextInput style={{ flex: 1, backgroundColor: colors.muted, borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, color: colors.foreground, fontSize: 15, maxHeight: 120 }} placeholder="Mensagem..." placeholderTextColor={colors.mutedForeground} value={text} onChangeText={setText} multiline />
        <TouchableOpacity onPress={handleSend} disabled={!text.trim() || sending} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: text.trim() ? BRAND.colors.primary : colors.muted, alignItems: "center", justifyContent: "center" }}>
          {sending ? <ActivityIndicator size="small" color="#fff" /> : <Feather name="send" size={18} color={text.trim() ? "#fff" : colors.mutedForeground} />}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
