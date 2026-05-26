import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { AppState, type AppStateStatus } from "react-native";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export interface AppNotification {
  id: string;
  type: "budget" | "order" | "chat";
  title: string;
  body: string;
  status?: string | null;
  route: string;
  createdAt: string | null;
  read?: boolean;
}

interface NotificationContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  panelVisible: boolean;
  loading: boolean;
  openPanel: () => void;
  closePanel: () => void;
  markAllRead: () => void;
  refresh: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);
const POLL_INTERVAL = 30_000;

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [panelVisible, setPanelVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const appState = useRef(AppState.currentState);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated || user?.role !== "admin") return;
    try {
      const data = await api.getNotifications();
      setNotifications(data.notifications ?? []);
    } catch {
      // Silent — API not available yet
    }
  }, [isAuthenticated, user?.role]);

  const refresh = useCallback(async () => {
    setLoading(true);
    await fetchNotifications();
    setLoading(false);
  }, [fetchNotifications]);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      setNotifications([]);
      return;
    }
    fetchNotifications();
    timerRef.current = setInterval(fetchNotifications, POLL_INTERVAL);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isAuthenticated, user?.role, fetchNotifications]);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (next: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && next === "active") {
        fetchNotifications();
      }
      appState.current = next;
    });
    return () => sub.remove();
  }, [fetchNotifications]);

  const unreadCount = notifications.filter(n => !readIds.has(n.id)).length;

  const openPanel = useCallback(() => {
    setPanelVisible(true);
    refresh();
  }, [refresh]);

  const closePanel = useCallback(() => setPanelVisible(false), []);

  const markAllRead = useCallback(() => {
    setReadIds(new Set(notifications.map(n => n.id)));
    api.markNotificationsRead().catch(() => {});
  }, [notifications]);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, panelVisible, loading, openPanel, closePanel, markAllRead, refresh }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used inside NotificationProvider");
  return ctx;
}
