import React, { useEffect, useRef } from "react";
import {
  Animated,
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { BRAND } from "@/constants/theme";
import { useNotifications, type AppNotification } from "@/context/NotificationContext";

const TYPE_META: Record<string, { icon: keyof typeof Feather.glyphMap; color: string; bg: string }> = {
  budget: { icon: "file-text", color: "#f59e0b", bg: "#fef3c7" },
  order:  { icon: "tool",      color: "#1976D2", bg: "#E3F2FD" },
  chat:   { icon: "message-circle", color: "#06b6d4", bg: "#cffafe" },
};

function timeAgo(iso: string | null) {
  if (!iso) return "";
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return "agora";
  if (diff < 3600) return `${Math.floor(diff / 60)}min atrás`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
  return `${Math.floor(diff / 86400)}d atrás`;
}

function NotifItem({ item, onPress }: { item: AppNotification; onPress: () => void }) {
  const colors = useColors();
  const meta = TYPE_META[item.type] ?? TYPE_META.order;
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.75}
      style={{ flexDirection: "row", alignItems: "flex-start", gap: 12, paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: colors.border }}>
      <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: meta.bg, alignItems: "center", justifyContent: "center", marginTop: 2 }}>
        <Feather name={meta.icon} size={18} color={meta.color} />
      </View>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
          <Text style={{ fontSize: 13, fontFamily: "Inter_600SemiBold", color: colors.foreground }}>{item.title}</Text>
          <Text style={{ fontSize: 11, color: colors.mutedForeground }}>{timeAgo(item.createdAt)}</Text>
        </View>
        <Text style={{ fontSize: 13, color: colors.mutedForeground, lineHeight: 18 }} numberOfLines={2}>{item.body}</Text>
        {item.status && (
          <View style={{ marginTop: 4, alignSelf: "flex-start", backgroundColor: meta.bg, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 }}>
            <Text style={{ fontSize: 11, fontFamily: "Inter_500Medium", color: meta.color }}>{item.status}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

export function NotificationPanel() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { notifications, panelVisible, loading, closePanel, markAllRead, unreadCount } = useNotifications();
  const slideY = useRef(new Animated.Value(-40)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (panelVisible) {
      Animated.parallel([
        Animated.spring(slideY, { toValue: 0, useNativeDriver: true, damping: 18, stiffness: 200 }),
        Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      ]).start();
    } else {
      slideY.setValue(-40);
      opacity.setValue(0);
    }
  }, [panelVisible]);

  const handleNotifPress = (n: AppNotification) => {
    closePanel();
    router.push(n.route as any);
  };

  if (!panelVisible) return null;

  return (
    <Modal visible={panelVisible} transparent animationType="none" onRequestClose={closePanel} statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={closePanel} />
      <Animated.View
        style={[
          styles.panel,
          {
            paddingTop: (Platform.OS === "web" ? 67 : insets.top) + 8,
            backgroundColor: colors.card,
            transform: [{ translateY: slideY }],
            opacity,
          },
        ]}
      >
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View>
            <Text style={{ fontSize: 18, fontFamily: "Inter_700Bold", color: colors.foreground }}>Notificações</Text>
            {unreadCount > 0 && (
              <Text style={{ fontSize: 12, color: BRAND.colors.accent, fontFamily: "Inter_500Medium" }}>{unreadCount} não lidas</Text>
            )}
          </View>
          <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
            {unreadCount > 0 && (
              <TouchableOpacity onPress={markAllRead}>
                <Text style={{ fontSize: 12, color: BRAND.colors.primary, fontFamily: "Inter_600SemiBold" }}>Marcar lidas</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={closePanel} style={styles.closeBtn}>
              <Feather name="x" size={20} color={colors.foreground} />
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={BRAND.colors.primary} size="small" />
            <Text style={{ marginTop: 8, color: colors.mutedForeground, fontSize: 13 }}>Carregando...</Text>
          </View>
        ) : notifications.length === 0 ? (
          <View style={styles.center}>
            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: colors.muted, alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
              <Feather name="bell-off" size={28} color={colors.mutedForeground} />
            </View>
            <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_500Medium", fontSize: 14 }}>Nenhuma notificação</Text>
            <Text style={{ color: colors.mutedForeground, fontSize: 12, marginTop: 4 }}>Novos orçamentos e ordens aparecerão aqui</Text>
          </View>
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={n => n.id}
            renderItem={({ item }) => <NotifItem item={item} onPress={() => handleNotifPress(item)} />}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
          />
        )}
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.45)" },
  panel: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    maxHeight: "75%",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 16,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  closeBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: "rgba(0,0,0,0.07)", alignItems: "center", justifyContent: "center" },
  center: { alignItems: "center", justifyContent: "center", paddingVertical: 48, paddingHorizontal: 24 },
});
