import React, { useState } from "react";
import { FlatList, Modal, Platform, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

interface SelectProps {
  label?: string;
  value: string;
  options: string[];
  onChange: (val: string) => void;
  placeholder?: string;
  error?: string;
}

export function Select({ label, value, options, onChange, placeholder = "Selecione...", error }: SelectProps) {
  const colors = useColors();
  const [open, setOpen] = useState(false);

  return (
    <View style={{ marginBottom: 4 }}>
      {label && (
        <Text style={{ fontSize: 13, fontFamily: "Inter_500Medium", color: colors.foreground, marginBottom: 6 }}>
          {label}
        </Text>
      )}
      <TouchableOpacity
        onPress={() => setOpen(true)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: colors.card,
          borderRadius: colors.radius,
          borderWidth: 1,
          borderColor: error ? colors.destructive : colors.border,
          paddingHorizontal: 14,
          paddingVertical: 13,
          minHeight: 48,
        }}
      >
        <Text style={{ fontSize: 15, fontFamily: "Inter_400Regular", color: value ? colors.foreground : colors.mutedForeground, flex: 1 }} numberOfLines={1}>
          {value || placeholder}
        </Text>
        <Feather name="chevron-down" size={18} color={colors.mutedForeground} />
      </TouchableOpacity>
      {error && <Text style={{ fontSize: 12, color: colors.destructive, marginTop: 4 }}>{error}</Text>}
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", padding: 24 }} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={{ backgroundColor: colors.card, borderRadius: colors.radius, overflow: "hidden", maxHeight: 400 }}>
            <FlatList
              data={options}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => { onChange(item); setOpen(false); }}
                  style={{ paddingHorizontal: 18, paddingVertical: 15, backgroundColor: item === value ? colors.secondary : "transparent", borderBottomWidth: 1, borderBottomColor: colors.border }}
                >
                  <Text style={{ fontSize: 15, fontFamily: item === value ? "Inter_600SemiBold" : "Inter_400Regular", color: item === value ? colors.primary : colors.foreground }}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
