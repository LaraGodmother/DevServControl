import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE =
  process.env.EXPO_PUBLIC_API_URL ||
  (typeof window !== "undefined"
    ? window.location.origin + "/api"
    : "http://localhost:80/api");

export interface ApiUser {
  id: number;
  name: string;
  email: string;
  role: "admin" | "client";
  phone?: string | null;
  document?: string | null;
  address?: string | null;
  createdAt: string;
}

export interface ApiService {
  id: number;
  name: string;
  description: string;
  basePrice: string;
  profitMargin: string;
  rules?: string | null;
  active: boolean;
  createdAt: string;
}

export interface ApiBudget {
  id: number;
  clientId: number;
  clientName?: string | null;
  clientPhone?: string | null;
  serviceId?: number | null;
  serviceName?: string | null;
  customServiceName?: string | null;
  baseValue: string;
  profitMargin: string;
  finalValue: string;
  observations?: string | null;
  paymentConditions?: string | null;
  counterProposalText?: string | null;
  status: string;
  createdAt: string;
}

export interface ApiOrder {
  id: number;
  budgetId?: number | null;
  clientId: number;
  clientName?: string | null;
  serviceId: number;
  serviceName?: string | null;
  serviceBasePrice?: string | null;
  serviceProfitMargin?: string | null;
  description?: string | null;
  status: "pending" | "in_progress" | "done" | "cancelled" | "counter_proposal";
  counterProposalText?: string | null;
  preferredDate?: string | null;
  preferredTime?: string | null;
  paymentMethod?: string | null;
  amountPaid: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiAppointment {
  id: number;
  clientId: number;
  clientName?: string | null;
  serviceId: number;
  serviceName?: string | null;
  date: string;
  time: string;
  status: "scheduled" | "confirmed" | "cancelled" | "done";
  notes?: string | null;
  createdAt: string;
}

export interface ApiCalendarNote {
  id: number;
  date: string;
  note: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiChatMessage {
  id: number;
  fromUserId: number;
  toUserId: number;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface ApiChatConversation {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  lastMessage?: ApiChatMessage | null;
  unreadCount: number;
}

export interface CompanySettings {
  name: string;
  cnpj: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  pdfColorPrimary?: string;
  pdfColorAccent?: string;
}

export interface ScheduleConfig {
  workingDays: number[];
  timeSlots: string[];
  blockedDates: string[];
}

export interface ApiAvailability {
  available: string[];
  booked: string[];
  timeSlots: string[];
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  skipAuth = false
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (!skipAuth) {
    const token = await AsyncStorage.getItem("@servcontrol/token");
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  getBaseUrl: () => API_BASE.replace("/api", ""),

  login: (email: string, password: string) =>
    request<{ user: ApiUser; token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }, true),

  register: (data: { name: string; email: string; password: string; phone?: string }) =>
    request<{ user: ApiUser; token: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }, true),

  recoverPassword: (email: string) =>
    request<{ success: boolean }>("/auth/recover", {
      method: "POST",
      body: JSON.stringify({ email }),
    }, true),

  changePassword: (currentPassword: string, newPassword: string) =>
    request<{ success: boolean }>("/auth/change-password", {
      method: "PATCH",
      body: JSON.stringify({ currentPassword, newPassword }),
    }),

  getServices: () => request<ApiService[]>("/services"),
  createService: (data: Partial<ApiService>) =>
    request<ApiService>("/services", { method: "POST", body: JSON.stringify(data) }),
  updateService: (id: number, data: Partial<ApiService>) =>
    request<ApiService>(`/services/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteService: (id: number) =>
    request<{ success: boolean }>(`/services/${id}`, { method: "DELETE" }),

  getBudgets: (clientId?: number) =>
    request<ApiBudget[]>(`/budgets${clientId ? `?clientId=${clientId}` : ""}`),
  createBudget: (data: Partial<ApiBudget>) =>
    request<ApiBudget>("/budgets", { method: "POST", body: JSON.stringify(data) }),
  updateBudget: (id: number, data: Partial<ApiBudget>) =>
    request<ApiBudget>(`/budgets/${id}`, { method: "PATCH", body: JSON.stringify(data) }),

  getOrders: (clientId?: number) =>
    request<ApiOrder[]>(`/orders${clientId ? `?clientId=${clientId}` : ""}`),
  createOrder: (data: Partial<ApiOrder>) =>
    request<ApiOrder>("/orders", { method: "POST", body: JSON.stringify(data) }),
  updateOrder: (id: number, data: Partial<ApiOrder>) =>
    request<ApiOrder>(`/orders/${id}`, { method: "PATCH", body: JSON.stringify(data) }),

  getClients: () => request<ApiUser[]>("/clients"),
  getClient: (id: number) => request<ApiUser>(`/clients/${id}`),
  updateClient: (id: number, data: Partial<ApiUser>) =>
    request<ApiUser>(`/clients/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  createClient: (data: { name: string; email: string; password: string; phone?: string; document?: string; address?: string }) =>
    request<ApiUser>("/admin/clients", { method: "POST", body: JSON.stringify(data) }),

  getAppointments: (clientId?: number) =>
    request<ApiAppointment[]>(`/appointments${clientId ? `?clientId=${clientId}` : ""}`),
  createAppointment: (data: Partial<ApiAppointment>) =>
    request<ApiAppointment>("/appointments", { method: "POST", body: JSON.stringify(data) }),
  updateAppointment: (id: number, data: Partial<ApiAppointment>) =>
    request<ApiAppointment>(`/appointments/${id}`, { method: "PATCH", body: JSON.stringify(data) }),

  getCalendarNotes: () => request<ApiCalendarNote[]>("/calendar-notes"),
  saveCalendarNote: (date: string, note: string) =>
    request<ApiCalendarNote>("/calendar-notes", { method: "POST", body: JSON.stringify({ date, note }) }),
  deleteCalendarNote: (date: string) =>
    request<{ success: boolean }>(`/calendar-notes/${encodeURIComponent(date)}`, { method: "DELETE" }),

  getChatMessages: (withUserId: number) =>
    request<ApiChatMessage[]>(`/chat/messages?with=${withUserId}`),
  sendChatMessage: (toUserId: number, message: string) =>
    request<ApiChatMessage>("/chat/messages", { method: "POST", body: JSON.stringify({ toUserId, message }) }),
  getChatConversations: () => request<ApiChatConversation[]>("/chat/conversations"),
  getAdminId: () => request<{ adminId: number }>("/chat/admin-id"),

  getCompanySettings: () => request<CompanySettings>("/admin/company-settings"),
  updateCompanySettings: (data: Partial<CompanySettings>) =>
    request<CompanySettings>("/admin/company-settings", { method: "PATCH", body: JSON.stringify(data) }),

  getScheduleConfig: () => request<ScheduleConfig>("/admin/schedule-config"),
  updateScheduleConfig: (data: Partial<ScheduleConfig>) =>
    request<ScheduleConfig>("/admin/schedule-config", { method: "PATCH", body: JSON.stringify(data) }),
  getAvailability: (date: string) =>
    request<ApiAvailability>(`/admin/availability?date=${date}`),
};
