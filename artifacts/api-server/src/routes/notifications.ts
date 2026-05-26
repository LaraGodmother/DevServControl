import { Router } from "express";
import { db } from "@workspace/db";
import { budgetsTable, serviceOrdersTable, usersTable, servicesTable } from "@workspace/db/schema";
import { desc, eq, gte } from "drizzle-orm";

const router = Router();

router.get("/admin/notifications", async (req, res) => {
  try {
    const since = req.query.since
      ? new Date(String(req.query.since))
      : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [budgets, orders, chatUnread] = await Promise.all([
      db.select({
        id: budgetsTable.id,
        clientName: usersTable.name,
        serviceName: servicesTable.name,
        customServiceName: budgetsTable.customServiceName,
        finalValue: budgetsTable.finalValue,
        status: budgetsTable.status,
        createdAt: budgetsTable.createdAt,
      })
        .from(budgetsTable)
        .leftJoin(usersTable, eq(budgetsTable.clientId, usersTable.id))
        .leftJoin(servicesTable, eq(budgetsTable.serviceId, servicesTable.id))
        .where(gte(budgetsTable.createdAt, since))
        .orderBy(desc(budgetsTable.createdAt))
        .limit(20),

      db.select({
        id: serviceOrdersTable.id,
        clientName: usersTable.name,
        serviceName: servicesTable.name,
        status: serviceOrdersTable.status,
        preferredDate: serviceOrdersTable.preferredDate,
        createdAt: serviceOrdersTable.createdAt,
      })
        .from(serviceOrdersTable)
        .leftJoin(usersTable, eq(serviceOrdersTable.clientId, usersTable.id))
        .leftJoin(servicesTable, eq(serviceOrdersTable.serviceId, servicesTable.id))
        .where(gte(serviceOrdersTable.createdAt, since))
        .orderBy(desc(serviceOrdersTable.createdAt))
        .limit(20),

      Promise.resolve(0),
    ]);

    const notifications = [
      ...budgets.map(b => ({
        id: `budget-${b.id}`,
        type: "budget" as const,
        title: "Novo Orçamento",
        body: `${b.clientName ?? "Cliente"} → ${b.serviceName ?? b.customServiceName ?? "Serviço"} · R$${Number(b.finalValue).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
        status: b.status,
        route: "/admin/budgets",
        createdAt: b.createdAt,
      })),
      ...orders.map(o => ({
        id: `order-${o.id}`,
        type: "order" as const,
        title: "Nova Ordem de Serviço",
        body: `${o.clientName ?? "Cliente"} → ${o.serviceName ?? "Serviço"}${o.preferredDate ? ` · ${new Date(o.preferredDate).toLocaleDateString("pt-BR")}` : ""}`,
        status: o.status,
        route: "/admin/orders",
        createdAt: o.createdAt,
      })),
    ].sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());

    const pendingBudgets = budgets.filter(b => b.status === "pending" || b.status === "aguardando").length;
    const pendingOrders = orders.filter(o => o.status === "pending" || o.status === "pendente").length;

    res.json({
      notifications,
      unread: pendingBudgets + pendingOrders + chatUnread,
      pendingBudgets,
      pendingOrders,
    });
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar notificações." });
  }
});

router.post("/admin/notifications/mark-read", async (_req, res) => {
  res.json({ success: true, markedAt: new Date().toISOString() });
});

export default router;
