import { Router } from "express";
import { db } from "@workspace/db";
import { budgetsTable, usersTable, servicesTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

const budgetWithDetails = async (clientId?: number) => {
  const rows = await db.select({
    id: budgetsTable.id,
    clientId: budgetsTable.clientId,
    serviceId: budgetsTable.serviceId,
    customServiceName: budgetsTable.customServiceName,
    baseValue: budgetsTable.baseValue,
    profitMargin: budgetsTable.profitMargin,
    finalValue: budgetsTable.finalValue,
    observations: budgetsTable.observations,
    paymentConditions: budgetsTable.paymentConditions,
    counterProposalText: budgetsTable.counterProposalText,
    status: budgetsTable.status,
    createdAt: budgetsTable.createdAt,
    clientName: usersTable.name,
    clientPhone: usersTable.phone,
    serviceName: servicesTable.name,
  })
  .from(budgetsTable)
  .leftJoin(usersTable, eq(budgetsTable.clientId, usersTable.id))
  .leftJoin(servicesTable, eq(budgetsTable.serviceId, servicesTable.id))
  .where(clientId !== undefined ? eq(budgetsTable.clientId, clientId) : undefined as any)
  .orderBy(budgetsTable.createdAt);
  return rows;
};

router.get("/budgets", async (req, res) => {
  try {
    const clientId = req.query.clientId ? Number(req.query.clientId) : undefined;
    const rows = await budgetWithDetails(clientId);
    return res.json(rows);
  } catch {
    return res.status(500).json({ error: "Erro interno." });
  }
});

router.get("/budgets/:id", async (req, res) => {
  try {
    const [budget] = await db.select().from(budgetsTable).where(eq(budgetsTable.id, Number(req.params.id))).limit(1);
    if (!budget) return res.status(404).json({ error: "Orçamento não encontrado." });
    return res.json(budget);
  } catch {
    return res.status(500).json({ error: "Erro interno." });
  }
});

router.post("/budgets", async (req, res) => {
  try {
    const { clientId, serviceId, customServiceName, baseValue, profitMargin = 0, observations, paymentConditions } = req.body;
    if (!clientId || baseValue == null) return res.status(400).json({ error: "clientId e baseValue são obrigatórios." });
    if (!serviceId && !customServiceName) return res.status(400).json({ error: "Informe serviceId ou customServiceName." });
    const base = Number(baseValue);
    const margin = Number(profitMargin);
    const finalValue = base + (base * margin / 100);
    const [budget] = await db.insert(budgetsTable).values({
      clientId: Number(clientId),
      serviceId: serviceId ? Number(serviceId) : null,
      customServiceName: customServiceName ?? null,
      baseValue: String(base),
      profitMargin: String(margin),
      finalValue: String(finalValue.toFixed(2)),
      observations: observations ?? null,
      paymentConditions: paymentConditions ?? null,
      status: "pending",
    }).returning();
    return res.status(201).json(budget);
  } catch {
    return res.status(500).json({ error: "Erro interno." });
  }
});

router.patch("/budgets/:id", async (req, res) => {
  try {
    const { status, baseValue, profitMargin, finalValue, observations, paymentConditions, counterProposalText } = req.body;
    const updates: Record<string, any> = {};
    if (status !== undefined) updates.status = status;
    if (observations !== undefined) updates.observations = observations;
    if (paymentConditions !== undefined) updates.paymentConditions = paymentConditions;
    if (counterProposalText !== undefined) updates.counterProposalText = counterProposalText;
    if (baseValue !== undefined) {
      const base = Number(baseValue);
      const margin = profitMargin !== undefined ? Number(profitMargin) : 0;
      updates.baseValue = String(base);
      updates.profitMargin = String(margin);
      updates.finalValue = finalValue !== undefined ? String(finalValue) : String((base + base * margin / 100).toFixed(2));
    } else if (finalValue !== undefined) {
      updates.finalValue = String(finalValue);
    }
    const [budget] = await db.update(budgetsTable).set(updates).where(eq(budgetsTable.id, Number(req.params.id))).returning();
    if (!budget) return res.status(404).json({ error: "Orçamento não encontrado." });
    return res.json(budget);
  } catch {
    return res.status(500).json({ error: "Erro interno." });
  }
});

export default router;
