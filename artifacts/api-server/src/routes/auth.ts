import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { generateToken } from "../middleware/auth";

const router = Router();
const SALT_ROUNDS = 12;

async function verifyPassword(plain: string, stored: string): Promise<boolean> {
  if (stored.startsWith("$2b$") || stored.startsWith("$2a$")) {
    return bcrypt.compare(plain, stored);
  }
  const { createHash } = await import("crypto");
  const sha = createHash("sha256").update(plain).digest("hex");
  return sha === stored;
}

router.post("/auth/register", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "name, email e password são obrigatórios." });
    }
    const existing = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase())).limit(1);
    if (existing.length > 0) return res.status(409).json({ error: "E-mail já cadastrado." });

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const [user] = await db.insert(usersTable).values({
      name, email: email.toLowerCase(), passwordHash, role: "client", phone: phone ?? null,
    }).returning({
      id: usersTable.id, name: usersTable.name, email: usersTable.email,
      role: usersTable.role, phone: usersTable.phone, createdAt: usersTable.createdAt,
    });
    const token = generateToken({ userId: user.id, role: user.role });
    return res.status(201).json({ user, token });
  } catch (err) {
    return res.status(500).json({ error: "Erro interno." });
  }
});

router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "email e password são obrigatórios." });

    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase())).limit(1);
    if (!user) return res.status(401).json({ error: "E-mail ou senha incorretos." });

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: "E-mail ou senha incorretos." });

    if (!user.passwordHash.startsWith("$2b$") && !user.passwordHash.startsWith("$2a$")) {
      const newHash = await bcrypt.hash(password, SALT_ROUNDS);
      await db.update(usersTable).set({ passwordHash: newHash }).where(eq(usersTable.id, user.id));
    }

    const token = generateToken({ userId: user.id, role: user.role });
    return res.json({
      user: {
        id: user.id, name: user.name, email: user.email,
        role: user.role, phone: user.phone, createdAt: user.createdAt,
      },
      token,
    });
  } catch {
    return res.status(500).json({ error: "Erro interno." });
  }
});

router.post("/auth/recover", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "email é obrigatório." });
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase())).limit(1);
    if (!user) return res.status(404).json({ error: "E-mail não encontrado." });
    return res.json({ success: true, message: "Se o e-mail existir, você receberá instruções de recuperação." });
  } catch {
    return res.status(500).json({ error: "Erro interno." });
  }
});

router.patch("/auth/change-password", async (req: any, res) => {
  try {
    const userId = req.jwtUser?.userId;
    if (!userId) return res.status(401).json({ error: "Não autorizado." });
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ error: "Campos obrigatórios ausentes." });
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user) return res.status(404).json({ error: "Usuário não encontrado." });
    const valid = await verifyPassword(currentPassword, user.passwordHash);
    if (!valid) return res.status(401).json({ error: "Senha atual incorreta." });
    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await db.update(usersTable).set({ passwordHash }).where(eq(usersTable.id, userId));
    return res.json({ success: true });
  } catch {
    return res.status(500).json({ error: "Erro interno." });
  }
});

router.post("/admin/clients", async (req: any, res) => {
  try {
    if (req.jwtUser?.role !== "admin") return res.status(403).json({ error: "Acesso negado." });
    const { name, email, password, phone, document, address } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: "name, email e password são obrigatórios." });
    const existing = await db.select().from(usersTable).where(eq(usersTable.email, email.toLowerCase())).limit(1);
    if (existing.length > 0) return res.status(409).json({ error: "E-mail já cadastrado." });
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const [user] = await db.insert(usersTable).values({
      name, email: email.toLowerCase(), passwordHash, role: "client",
      phone: phone ?? null, document: document ?? null, address: address ?? null,
    }).returning({
      id: usersTable.id, name: usersTable.name, email: usersTable.email,
      role: usersTable.role, phone: usersTable.phone, document: usersTable.document,
      address: usersTable.address, createdAt: usersTable.createdAt,
    });
    return res.status(201).json(user);
  } catch {
    return res.status(500).json({ error: "Erro interno." });
  }
});

export default router;
