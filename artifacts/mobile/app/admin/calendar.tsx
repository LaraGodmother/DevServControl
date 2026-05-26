import React, { useState } from "react";
import { Alert, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useData } from "@/context/DataContext";
import { api } from "@/lib/api";
import { BRAND } from "@/constants/theme";

const MONTH_NAMES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
const DAY_SHORT = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];

export default function AdminCalendarScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const { appointments, calendarNotes, loadAll } = useData();
  const [current, setCurrent] = useState(new Date());
  const [selected, setSelected] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const year = current.getFullYear();
  const month = current.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Array.from({ length: firstDay + daysInMonth }, (_, i) => i < firstDay ? null : i - firstDay + 1);

  const dateStr = (day: number) => `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const apptsByDate = appointments.reduce<Record<string, number>>((acc, a) => { acc[a.date] = (acc[a.date] || 0) + 1; return acc; }, {});
  const notesByDate = calendarNotes.reduce<Record<string, string>>((acc, n) => { acc[n.date] = n.note; return acc; }, {});
  const today = new Date().toISOString().slice(0, 10);

  const openDay = (day: number) => {
    const ds = dateStr(day);
    setSelected(ds);
    setNoteText(notesByDate[ds] ?? "");
    setShowNoteModal(true);
  };

  const handleSaveNote = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      if (noteText.trim()) await api.saveCalendarNote(selected, noteText.trim());
      else await api.deleteCalendarNote(selected).catch(() => {});
      await loadAll();
      setShowNoteModal(false);
    } catch { Alert.alert("Erro", "Não foi possível salvar nota."); }
    finally { setSaving(false); }
  };

  const selectedAppts = selected ? appointments.filter(a => a.date === selected) : [];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingTop: topInset + 12, paddingBottom: 16, paddingHorizontal: 20, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: "row", alignItems: "center", gap: 12 }}>
        <TouchableOpacity onPress={() => router.back()}><Feather name="arrow-left" size={22} color={colors.primary} /></TouchableOpacity>
        <Text style={{ flex: 1, fontSize: 20, fontFamily: "Inter_700Bold", color: colors.foreground }}>Calendário</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={{ backgroundColor: colors.card, borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <TouchableOpacity onPress={() => setCurrent(new Date(year, month - 1, 1))}><Feather name="chevron-left" size={22} color={colors.foreground} /></TouchableOpacity>
            <Text style={{ fontSize: 17, fontFamily: "Inter_700Bold", color: colors.foreground }}>{MONTH_NAMES[month]} {year}</Text>
            <TouchableOpacity onPress={() => setCurrent(new Date(year, month + 1, 1))}><Feather name="chevron-right" size={22} color={colors.foreground} /></TouchableOpacity>
          </View>
          <View style={{ flexDirection: "row", marginBottom: 8 }}>
            {DAY_SHORT.map(d => <Text key={d} style={{ flex: 1, textAlign: "center", fontSize: 11, color: colors.mutedForeground, fontFamily: "Inter_600SemiBold" }}>{d}</Text>)}
          </View>
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            {cells.map((day, idx) => {
              if (!day) return <View key={`empty-${idx}`} style={{ width: "14.28%", aspectRatio: 1 }} />;
              const ds = dateStr(day);
              const hasAppt = !!apptsByDate[ds];
              const hasNote = !!notesByDate[ds];
              const isToday = ds === today;
              return (
                <TouchableOpacity key={ds} onPress={() => openDay(day)} style={{ width: "14.28%", aspectRatio: 1, alignItems: "center", justifyContent: "center", borderRadius: 8, backgroundColor: isToday ? BRAND.colors.primary : "transparent" }}>
                  <Text style={{ fontSize: 13, fontFamily: isToday ? "Inter_700Bold" : "Inter_400Regular", color: isToday ? "#fff" : colors.foreground }}>{day}</Text>
                  <View style={{ flexDirection: "row", gap: 2, marginTop: 2 }}>
                    {hasAppt && <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: "#3b82f6" }} />}
                    {hasNote && <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: "#f59e0b" }} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={{ flexDirection: "row", gap: 16, marginBottom: 4 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#3b82f6" }} />
            <Text style={{ fontSize: 12, color: colors.mutedForeground }}>Agendamento</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#f59e0b" }} />
            <Text style={{ fontSize: 12, color: colors.mutedForeground }}>Nota</Text>
          </View>
        </View>
      </ScrollView>

      <Modal visible={showNoteModal} animationType="slide" transparent onRequestClose={() => setShowNoteModal(false)}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: insets.bottom + 24 }}>
            <Text style={{ fontSize: 17, fontFamily: "Inter_700Bold", color: colors.foreground, marginBottom: 4 }}>{selected}</Text>
            {selectedAppts.length > 0 && (
              <View style={{ marginBottom: 14 }}>
                <Text style={{ fontSize: 13, fontFamily: "Inter_600SemiBold", color: colors.foreground, marginBottom: 6 }}>Agendamentos</Text>
                {selectedAppts.map(a => (
                  <Text key={a.id} style={{ fontSize: 13, color: colors.mutedForeground }}>• {a.time} — {a.serviceName} ({a.clientName})</Text>
                ))}
              </View>
            )}
            <Text style={{ fontSize: 13, fontFamily: "Inter_600SemiBold", color: colors.foreground, marginBottom: 6 }}>Nota do dia</Text>
            <TextInput placeholder="Escreva uma nota..." placeholderTextColor={colors.mutedForeground} value={noteText} onChangeText={setNoteText} multiline numberOfLines={4} style={{ backgroundColor: colors.muted, borderRadius: 10, padding: 12, marginBottom: 16, color: colors.foreground, fontSize: 14, minHeight: 90, textAlignVertical: "top" }} />
            <TouchableOpacity onPress={handleSaveNote} disabled={saving} style={{ backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 14, alignItems: "center" }}>
              <Text style={{ color: "#fff", fontFamily: "Inter_600SemiBold", fontSize: 15 }}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
