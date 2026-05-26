import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api, type ApiOrder, type ApiBudget, type ApiAppointment, type ApiService, type ApiCalendarNote } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export type ServiceStatus = "pendente" | "em_andamento" | "concluido" | "cancelado";
export type BudgetStatus = "aguardando" | "aprovado" | "aceito_admin" | "aceito_cliente" | "aceito" | "contraproposta" | "recusado" | "fechado";
export type AppointmentStatus = "agendado" | "confirmado" | "cancelado" | "concluido";

export interface ServiceOrder {
  id: string;
  clientId: string;
  clientName: string;
  serviceType: string;
  serviceId: number;
  description: string;
  status: ServiceStatus;
  counterProposalText?: string;
  preferredDate?: string;
  preferredTime?: string;
  paymentMethod?: string;
  amountPaid: number;
  serviceBasePrice?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone?: string;
  serviceType: string;
  serviceId?: number;
  baseValue: number;
  profitMargin: number;
  finalValue: number;
  observations?: string;
  paymentConditions?: string;
  counterProposalText?: string;
  status: BudgetStatus;
  createdAt: string;
}

export interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  serviceName: string;
  serviceId: number;
  date: string;
  time: string;
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
}

export interface Service {
  id: number;
  name: string;
  description: string;
  basePrice: number;
  profitMargin: number;
  rules?: string | null;
  active: boolean;
  createdAt: string;
}

function mapOrderStatus(s: string): ServiceStatus {
  const m: Record<string, ServiceStatus> = { pending: "pendente", in_progress: "em_andamento", done: "concluido", cancelled: "cancelado" };
  return m[s] ?? (s as ServiceStatus);
}
function mapBudgetStatus(s: string): BudgetStatus {
  const m: Record<string, BudgetStatus> = { pending: "aguardando", approved: "aprovado", rejected: "recusado", counter_proposal: "contraproposta", admin_accepted: "aceito_admin", client_accepted: "aceito_cliente", both_accepted: "aceito", closed: "fechado" };
  return m[s] ?? (s as BudgetStatus);
}
function mapApptStatus(s: string): AppointmentStatus {
  const m: Record<string, AppointmentStatus> = { scheduled: "agendado", confirmed: "confirmado", cancelled: "cancelado", done: "concluido" };
  return m[s] ?? (s as AppointmentStatus);
}

function toOrder(o: ApiOrder): ServiceOrder {
  return {
    id: String(o.id), clientId: String(o.clientId), clientName: o.clientName ?? "",
    serviceType: o.serviceName ?? "", serviceId: o.serviceId,
    description: o.description ?? "", status: mapOrderStatus(o.status),
    counterProposalText: o.counterProposalText ?? undefined,
    preferredDate: o.preferredDate ?? undefined, preferredTime: o.preferredTime ?? undefined,
    paymentMethod: o.paymentMethod ?? undefined, amountPaid: Number(o.amountPaid),
    serviceBasePrice: o.serviceBasePrice ? Number(o.serviceBasePrice) : undefined,
    createdAt: o.createdAt, updatedAt: o.updatedAt,
  };
}
function toBudget(b: ApiBudget): Budget {
  return {
    id: String(b.id), clientId: String(b.clientId), clientName: b.clientName ?? "",
    clientPhone: b.clientPhone ?? undefined,
    serviceType: b.serviceName ?? b.customServiceName ?? "", serviceId: b.serviceId ?? undefined,
    baseValue: Number(b.baseValue), profitMargin: Number(b.profitMargin), finalValue: Number(b.finalValue),
    observations: b.observations ?? undefined, paymentConditions: b.paymentConditions ?? undefined,
    counterProposalText: b.counterProposalText ?? undefined, status: mapBudgetStatus(b.status), createdAt: b.createdAt,
  };
}
function toAppt(a: ApiAppointment): Appointment {
  return {
    id: String(a.id), clientId: String(a.clientId), clientName: a.clientName ?? "",
    serviceName: a.serviceName ?? "", serviceId: a.serviceId,
    date: a.date, time: a.time, status: mapApptStatus(a.status),
    notes: a.notes ?? undefined, createdAt: a.createdAt,
  };
}
function toService(s: ApiService): Service {
  return { id: s.id, name: s.name, description: s.description, basePrice: Number(s.basePrice), profitMargin: Number(s.profitMargin), rules: s.rules, active: s.active, createdAt: s.createdAt };
}

interface DataContextValue {
  orders: ServiceOrder[];
  budgets: Budget[];
  appointments: Appointment[];
  services: Service[];
  calendarNotes: ApiCalendarNote[];
  loading: boolean;
  loadAll: () => Promise<void>;
  getClientOrders: (clientId: string) => ServiceOrder[];
  getClientBudgets: (clientId: string) => Budget[];
  getClientAppointments: (clientId: string) => Appointment[];
  createBudgetRequest: (data: { serviceType: string; description: string; clientId: string; name: string; email: string; phone: string }) => Promise<void>;
  updateOrder: (id: string, data: Partial<ApiOrder>) => Promise<void>;
  updateBudget: (id: string, data: Partial<ApiBudget>) => Promise<void>;
  deleteService: (id: number) => Promise<void>;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [calendarNotes, setCalendarNotes] = useState<ApiCalendarNote[]>([]);
  const [loading, setLoading] = useState(false);

  const loadAll = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const clientId = user?.role === "client" ? user.id : undefined;
      const [svc, ord, bgt, appt, notes] = await Promise.all([
        api.getServices(),
        api.getOrders(clientId),
        api.getBudgets(clientId),
        api.getAppointments(clientId),
        user?.role === "admin" ? api.getCalendarNotes() : Promise.resolve([]),
      ]);
      setServices(svc.map(toService));
      setOrders(ord.map(toOrder));
      setBudgets(bgt.map(toBudget));
      setAppointments(appt.map(toAppt));
      setCalendarNotes(notes);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [isAuthenticated, user]);

  useEffect(() => { if (isAuthenticated) loadAll(); }, [isAuthenticated]);

  const getClientOrders = (clientId: string) => orders.filter(o => o.clientId === clientId);
  const getClientBudgets = (clientId: string) => budgets.filter(b => b.clientId === clientId);
  const getClientAppointments = (clientId: string) => appointments.filter(a => a.clientId === clientId);

  const createBudgetRequest = async (data: { serviceType: string; description: string; clientId: string; name: string; email: string; phone: string }) => {
    const svc = services.find(s => s.name === data.serviceType);
    await api.createBudget({
      clientId: Number(data.clientId),
      serviceId: svc?.id ?? undefined,
      customServiceName: svc ? undefined : data.serviceType,
      baseValue: String(svc?.basePrice ?? 0),
      finalValue: String(svc?.basePrice ?? 0),
      observations: data.description,
      status: "pending" as any,
    });
    await loadAll();
  };

  const updateOrder = async (id: string, data: Partial<ApiOrder>) => {
    await api.updateOrder(Number(id), data);
    await loadAll();
  };

  const updateBudget = async (id: string, data: Partial<ApiBudget>) => {
    await api.updateBudget(Number(id), data);
    await loadAll();
  };

  const deleteService = async (id: number) => {
    await api.deleteService(id);
    setServices(prev => prev.filter(s => s.id !== id));
  };

  return (
    <DataContext.Provider value={{ orders, budgets, appointments, services, calendarNotes, loading, loadAll, getClientOrders, getClientBudgets, getClientAppointments, createBudgetRequest, updateOrder, updateBudget, deleteService }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used inside DataProvider");
  return ctx;
}
