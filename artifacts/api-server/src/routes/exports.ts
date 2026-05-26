import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, budgetsTable, serviceOrdersTable, servicesTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

function esc(v: string | number | boolean | null | undefined): string {
  if (v == null) return "";
  const s = String(v);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) return `"${s.replace(/"/g, '""')}"`;
  return s;
}
function row(...cells: (string | number | boolean | null | undefined)[]) { return cells.map(esc).join(","); }
function fmtDate(d: string | Date | null | undefined) { if (!d) return ""; return new Date(d).toLocaleDateString("pt-BR"); }
function fmtBrl(v: number | string | null | undefined) {
  const n = Number(v);
  if (isNaN(n)) return "R$ 0,00";
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function sendCsv(res: any, filename: string, lines: string[]) {
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.setHeader("Cache-Control", "no-store");
  res.end("\uFEFF" + lines.join("\r\n"));
}

router.get("/export/clientes.csv", async (_req, res) => {
  try {
    const clients = await db.select({ id: usersTable.id, name: usersTable.name, email: usersTable.email, phone: usersTable.phone, createdAt: usersTable.createdAt })
      .from(usersTable).where(eq(usersTable.role, "client")).orderBy(usersTable.name);
    const lines = [row("ID","Nome","E-mail","Telefone","Cadastrado em"), ...clients.map(c => row(c.id,c.name,c.email,c.phone??"",fmtDate(c.createdAt)))];
    sendCsv(res, `clientes_angelmarc_${new Date().toISOString().slice(0,10)}.csv`, lines);
  } catch { res.status(500).json({ error: "Erro ao gerar exportação." }); }
});

router.get("/export/orcamentos.csv", async (_req, res) => {
  try {
    const rows = await db.select({
      id: budgetsTable.id, clientName: usersTable.name, serviceName: servicesTable.name,
      baseValue: budgetsTable.baseValue, profitMargin: budgetsTable.profitMargin,
      finalValue: budgetsTable.finalValue, status: budgetsTable.status,
      observations: budgetsTable.observations, createdAt: budgetsTable.createdAt,
    }).from(budgetsTable).leftJoin(usersTable, eq(budgetsTable.clientId, usersTable.id)).leftJoin(servicesTable, eq(budgetsTable.serviceId, servicesTable.id)).orderBy(budgetsTable.createdAt);
    const STATUS: Record<string,string> = { pending:"Aguardando", approved:"Aprovado", rejected:"Recusado", counter_proposal:"Contraproposta", closed:"Fechado" };
    const lines = [row("ID","Cliente","Serviço","Valor base (R$)","Margem (%)","Valor final (R$)","Status","Observações","Data"),
      ...rows.map(b => row(b.id,b.clientName??"",b.serviceName??"",fmtBrl(b.baseValue),`${b.profitMargin??0}%`,fmtBrl(b.finalValue),STATUS[b.status??""??b.status??""]??b.status??"",b.observations??"",fmtDate(b.createdAt)))];
    sendCsv(res, `orcamentos_angelmarc_${new Date().toISOString().slice(0,10)}.csv`, lines);
  } catch { res.status(500).json({ error: "Erro ao gerar exportação." }); }
});

router.get("/export/ordens.csv", async (_req, res) => {
  try {
    const rows = await db.select({
      id: serviceOrdersTable.id, clientName: usersTable.name, serviceName: servicesTable.name,
      basePrice: servicesTable.basePrice, description: serviceOrdersTable.description,
      status: serviceOrdersTable.status, paymentMethod: serviceOrdersTable.paymentMethod,
      amountPaid: serviceOrdersTable.amountPaid, preferredDate: serviceOrdersTable.preferredDate,
      createdAt: serviceOrdersTable.createdAt,
    }).from(serviceOrdersTable).leftJoin(usersTable, eq(serviceOrdersTable.clientId, usersTable.id)).leftJoin(servicesTable, eq(serviceOrdersTable.serviceId, servicesTable.id)).orderBy(serviceOrdersTable.createdAt);
    const STATUS: Record<string,string> = { pending:"Pendente", in_progress:"Em Andamento", done:"Concluído", cancelled:"Cancelado" };
    const lines = [row("ID","Cliente","Serviço","Valor","Descrição","Status","Pagamento","Valor pago","Data preferida","Criado em"),
      ...rows.map(r => row(r.id,r.clientName??"",r.serviceName??"",fmtBrl(r.basePrice),r.description??"",STATUS[r.status??""??r.status??""]??r.status??"",r.paymentMethod??"",fmtBrl(r.amountPaid),r.preferredDate??"",fmtDate(r.createdAt)))];
    sendCsv(res, `ordens_angelmarc_${new Date().toISOString().slice(0,10)}.csv`, lines);
  } catch { res.status(500).json({ error: "Erro ao gerar exportação." }); }
});

router.get("/export/servicos.csv", async (_req, res) => {
  try {
    const services = await db.select().from(servicesTable).orderBy(servicesTable.name);
    const lines = [row("ID","Nome","Descrição","Preço base","Margem","Ativo","Regras","Criado em"),
      ...services.map(s => row(s.id,s.name,s.description,fmtBrl(s.basePrice),`${s.profitMargin}%`,s.active?"Sim":"Não",s.rules??"",fmtDate(s.createdAt)))];
    sendCsv(res, `servicos_angelmarc_${new Date().toISOString().slice(0,10)}.csv`, lines);
  } catch { res.status(500).json({ error: "Erro ao gerar exportação." }); }
});

export default router;
