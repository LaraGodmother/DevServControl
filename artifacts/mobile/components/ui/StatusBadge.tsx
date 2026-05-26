import React from "react";
import { Text, View } from "react-native";

interface StatusBadgeProps {
  label: string;
  color?: string;
  bg?: string;
}

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  pendente: { label: "Pendente", color: "#b45309", bg: "#fef3c7" },
  pending: { label: "Pendente", color: "#b45309", bg: "#fef3c7" },
  em_andamento: { label: "Em Andamento", color: "#1d4ed8", bg: "#dbeafe" },
  in_progress: { label: "Em Andamento", color: "#1d4ed8", bg: "#dbeafe" },
  concluido: { label: "Concluído", color: "#15803d", bg: "#dcfce7" },
  done: { label: "Concluído", color: "#15803d", bg: "#dcfce7" },
  cancelado: { label: "Cancelado", color: "#b91c1c", bg: "#fee2e2" },
  cancelled: { label: "Cancelado", color: "#b91c1c", bg: "#fee2e2" },
  aguardando: { label: "Aguardando", color: "#b45309", bg: "#fef3c7" },
  aprovado: { label: "Aprovado", color: "#1d4ed8", bg: "#dbeafe" },
  aceito_admin: { label: "Admin Aceitou", color: "#1d4ed8", bg: "#dbeafe" },
  aceito_cliente: { label: "Você Aceitou", color: "#7c3aed", bg: "#ede9fe" },
  aceito: { label: "Aceito", color: "#15803d", bg: "#dcfce7" },
  contraproposta: { label: "Contraproposta", color: "#c2410c", bg: "#ffedd5" },
  counter_proposal: { label: "Contraproposta", color: "#c2410c", bg: "#ffedd5" },
  recusado: { label: "Recusado", color: "#b91c1c", bg: "#fee2e2" },
  rejected: { label: "Recusado", color: "#b91c1c", bg: "#fee2e2" },
  fechado: { label: "Pago", color: "#15803d", bg: "#dcfce7" },
  closed: { label: "Pago", color: "#15803d", bg: "#dcfce7" },
  agendado: { label: "Agendado", color: "#1d4ed8", bg: "#dbeafe" },
  scheduled: { label: "Agendado", color: "#1d4ed8", bg: "#dbeafe" },
  confirmado: { label: "Confirmado", color: "#15803d", bg: "#dcfce7" },
  confirmed: { label: "Confirmado", color: "#15803d", bg: "#dcfce7" },
};

export function StatusBadge({ label, color, bg }: StatusBadgeProps) {
  const mapped = STATUS_MAP[label];
  const finalColor = color ?? mapped?.color ?? "#64748b";
  const finalBg = bg ?? mapped?.bg ?? "#f1f5f9";
  const finalLabel = mapped?.label ?? label;

  return (
    <View style={{ backgroundColor: finalBg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}>
      <Text style={{ fontSize: 11, fontFamily: "Inter_600SemiBold", color: finalColor }}>{finalLabel}</Text>
    </View>
  );
}
