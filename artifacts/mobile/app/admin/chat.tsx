import React, { useState, useEffect, useRef, useCallback } from "react";
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { api, type ApiChatMessage, type ApiChatConversation } from "@/lib/api";
import { BRAND } from "@/constants/theme";

function timeLabel(d: string) {
  const date = new Date(d);
  const diff = Math.floor((Date.now() - date.getTime()) / 86400000);
  if (diff === 0) return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  if (diff === 1) return "Ontem";
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

export default function AdminChatScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ApiChatConversation[]>([]);
  const [messages, setMessages] = useState<ApiChatMessage[]>([]);
  const [activeConv, setActiveConv] = useState<ApiChatConversation | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatRef = useRef<FlatList>(null);
  const pollRef = useRef<ReturnType<typeof setInterval>>();

  const loadConvs = useCallback(async () => {
    try { const data = await api.getChatConversations(); setConversations(data); }
    catch { } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadConvs(); pollRef.current = setInterval(loadConvs, 10000); return () => clearInterval(pollRef.current); }, [loadConvs]);

  const openConv = async (conv: ApiChatConversation) => {
    setActiveConv(conv);
    try { const msgs = await api.getChatMessages(conv.id); setMessages(msgs); setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100); }
    catch { }
  };

  useEffect(() => {
    if (!activeConv) return;
    const iv = setInterval(async () => {
      try { const msgs = await api.getChatMessages(activeConv.id); setMessages(msgs); }
      catch { }
    }, 4000);
    return () => clearInterval(iv);
  }, [activeConv]);

  const handleSend = async () => {
    if (!text.trim() || !activeConv) return;
    setSending(true);
    const msg = text.trim(); setText("");
    try { const m = await api.sendChatMessage(activeConv.id, msg); setMessages(p => [...p, m]); setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100); }
    catch { setText(msg); }
    finally { setSending(false); }
  };

  if (activeConv) {
    const myId = user?.id;
    return (
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ paddingTop: topInset + 12, paddingBottom: 14, paddingHorizontal: 20, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: "row", alignItems: "center", gap: 12 }}>
          <TouchableOpacity onPress={() => setActiveConv(null)}><Feather name="arrow-left" size={22} color={colors.primary} /></TouchableOpacity>
          <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.secondary, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ fontFamily: "Inter_700Bold", color: colors.primary, fontSize: 14 }}>{activeConv.name[0].toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontFamily: "Inter_600SemiBold", color: colors.foreground }}>{activeConv.name}</Text>
            <Text style={{ fontSize: 12, color: colors.mutedForeground }}>{activeConv.email}</Text>
          </View>
        </View>
        <FlatList ref={flatRef} data={messages} keyExtractor={i => String(i.id)} contentContainerStyle={{ padding: 16, gap: 10 }} onLayout={() => flatRef.current?.scrollToEnd({ animated: false })}
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

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingTop: topInset + 12, paddingBottom: 16, paddingHorizontal: 20, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: "row", alignItems: "center", gap: 12 }}>
        <TouchableOpacity onPress={() => router.back()}><Feather name="arrow-left" size={22} color={colors.primary} /></TouchableOpacity>
        <Text style={{ flex: 1, fontSize: 20, fontFamily: "Inter_700Bold", color: colors.foreground }}>Chat</Text>
      </View>
      {loading ? <ActivityIndicator style={{ marginTop: 40 }} size="large" color={colors.primary} /> : (
        <FlatList data={conversations} keyExtractor={i => String(i.id)} contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={<View style={{ alignItems: "center", padding: 40 }}><Feather name="message-circle" size={48} color={colors.mutedForeground} /><Text style={{ color: colors.mutedForeground, marginTop: 12 }}>Nenhuma conversa ainda</Text></View>}
          renderItem={({ item }) => (
            <Pressable onPress={() => openConv(item)} style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1, flexDirection: "row", alignItems: "center", backgroundColor: colors.card, borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: colors.border, gap: 14 })}>
              <View style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: colors.secondary, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ fontFamily: "Inter_700Bold", color: colors.primary, fontSize: 16 }}>{item.name[0].toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ fontSize: 15, fontFamily: "Inter_600SemiBold", color: colors.foreground }}>{item.name}</Text>
                  {item.lastMessage && <Text style={{ fontSize: 11, color: colors.mutedForeground }}>{timeLabel(item.lastMessage.createdAt)}</Text>}
                </View>
                <Text style={{ fontSize: 13, color: colors.mutedForeground }} numberOfLines={1}>{item.lastMessage?.message ?? "Iniciar conversa"}</Text>
              </View>
              {item.unreadCount > 0 && (
                <View style={{ backgroundColor: BRAND.colors.accent, width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ color: "#fff", fontSize: 11, fontFamily: "Inter_700Bold" }}>{item.unreadCount}</Text>
                </View>
              )}
            </Pressable>
          )}
        />
      )}
    </View>
  );
}
