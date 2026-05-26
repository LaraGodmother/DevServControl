import AsyncStorage from "@react-native-async-storage/async-storage";
import { Linking, Platform } from "react-native";

function getApiBase(): string {
  const base = process.env.EXPO_PUBLIC_API_URL;
  if (base) return base.replace(/\/api$/, "");
  if (typeof window !== "undefined") return window.location.origin;
  return "http://localhost:80";
}

export function fmtDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  try { return new Date(dateStr).toLocaleDateString("pt-BR"); } catch { return dateStr; }
}

export async function openExportUrl(path: string): Promise<void> {
  const token = await AsyncStorage.getItem("@servcontrol/token");
  const base = getApiBase();
  const url = `${base}/api${path}?token=${token ?? ""}`;
  if (Platform.OS === "web") {
    if (typeof window !== "undefined") window.open(url, "_blank");
  } else {
    await Linking.openURL(url);
  }
}
