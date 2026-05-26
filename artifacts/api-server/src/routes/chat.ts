import { Router } from "express";
import { db } from "@workspace/db";
import { chatMessagesTable, usersTable } from "@workspace/db/schema";
import { and, eq, or, desc, sql } from "drizzle-orm";

const router = Router();

router.get("/chat/messages", async (req: any, res) => {
  try {
    const currentUserId = Number(req.jwtUser?.userId);
    const withUserId = Number(req.query.with);
    if (!withUserId) return res.status(400).json({ error: "Parâmetro 'with' é obrigatório." });
    const messages = await db.select().from(chatMessagesTable).where(
      or(
        and(eq(chatMessagesTable.fromUserId, currentUserId), eq(chatMessagesTable.toUserId, withUserId)),
        and(eq(chatMessagesTable.fromUserId, withUserId), eq(chatMessagesTable.toUserId, currentUserId))
      )
    ).orderBy(chatMessagesTable.createdAt);
    await db.update(chatMessagesTable).set({ isRead: true }).where(
      and(
        eq(chatMessagesTable.fromUserId, withUserId),
        eq(chatMessagesTable.toUserId, currentUserId),
        eq(chatMessagesTable.isRead, false)
      )
    );
    return res.json(messages);
  } catch {
    return res.status(500).json({ error: "Erro interno." });
  }
});

router.post("/chat/messages", async (req: any, res) => {
  try {
    const fromUserId = Number(req.jwtUser?.userId);
    const { toUserId, message } = req.body;
    if (!toUserId || !message?.trim()) return res.status(400).json({ error: "toUserId e message são obrigatórios." });
    const [msg] = await db.insert(chatMessagesTable).values({
      fromUserId, toUserId: Number(toUserId), message: message.trim(), isRead: false,
    }).returning();
    return res.status(201).json(msg);
  } catch {
    return res.status(500).json({ error: "Erro interno." });
  }
});

router.get("/chat/conversations", async (req: any, res) => {
  try {
    const adminId = Number(req.jwtUser?.userId);
    const clients = await db.select({ id: usersTable.id, name: usersTable.name, email: usersTable.email, phone: usersTable.phone })
      .from(usersTable).where(eq(usersTable.role, "client"));

    const conversationsWithCount = await Promise.all(
      clients.map(async (client) => {
        const [latest] = await db.select().from(chatMessagesTable).where(
          or(
            and(eq(chatMessagesTable.fromUserId, adminId), eq(chatMessagesTable.toUserId, client.id)),
            and(eq(chatMessagesTable.fromUserId, client.id), eq(chatMessagesTable.toUserId, adminId))
          )
        ).orderBy(desc(chatMessagesTable.createdAt)).limit(1);

        const unreadResult = await db.select({ count: sql<number>`count(*)` }).from(chatMessagesTable).where(
          and(
            eq(chatMessagesTable.fromUserId, client.id),
            eq(chatMessagesTable.toUserId, adminId),
            eq(chatMessagesTable.isRead, false)
          )
        );
        return { ...client, lastMessage: latest ?? null, unreadCount: Number(unreadResult[0]?.count ?? 0) };
      })
    );
    return res.json(conversationsWithCount);
  } catch {
    return res.status(500).json({ error: "Erro interno." });
  }
});

router.get("/chat/admin-id", async (req: any, res) => {
  try {
    const [admin] = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.role, "admin")).limit(1);
    if (!admin) return res.status(404).json({ error: "Admin não encontrado." });
    return res.json({ adminId: admin.id });
  } catch {
    return res.status(500).json({ error: "Erro interno." });
  }
});

export default router;
