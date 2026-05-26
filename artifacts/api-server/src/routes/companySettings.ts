import { Router } from "express";
import { db } from "@workspace/db";
import { appSettingsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { COMPANY } from "../config/company";

const router = Router();
const COMPANY_KEYS = ["name", "cnpj", "phone", "email", "city", "address", "pdfColorPrimary", "pdfColorAccent"] as const;

export async function getCompanySetting(key: string): Promise<string | undefined> {
  const [row] = await db.select().from(appSettingsTable).where(eq(appSettingsTable.key, `company.${key}`)).limit(1);
  return row?.value;
}

export async function getFullCompanySettings() {
  const rows = await db.select().from(appSettingsTable);
  const map: Record<string, string> = {};
  for (const row of rows) {
    if (row.key.startsWith("company.")) map[row.key.replace("company.", "")] = row.value;
  }
  return {
    name: map.name ?? COMPANY.name,
    cnpj: map.cnpj ?? COMPANY.cnpj,
    phone: map.phone ?? COMPANY.phone,
    email: map.email ?? COMPANY.email,
    city: map.city ?? COMPANY.city,
    address: map.address ?? COMPANY.address,
    pdfColorPrimary: map.pdfColorPrimary ?? COMPANY.pdfColorPrimary,
    pdfColorAccent: map.pdfColorAccent ?? COMPANY.pdfColorAccent,
  };
}

router.get("/admin/company-settings", async (_req, res) => {
  try {
    const settings = await getFullCompanySettings();
    return res.json(settings);
  } catch {
    return res.status(500).json({ error: "Erro interno." });
  }
});

router.patch("/admin/company-settings", async (req, res) => {
  try {
    const updates = req.body as Partial<Record<typeof COMPANY_KEYS[number], string>>;
    for (const key of COMPANY_KEYS) {
      if (updates[key] !== undefined) {
        await db.insert(appSettingsTable).values({ key: `company.${key}`, value: updates[key]! })
          .onConflictDoUpdate({ target: appSettingsTable.key, set: { value: updates[key]!, updatedAt: new Date() } });
      }
    }
    const settings = await getFullCompanySettings();
    return res.json(settings);
  } catch {
    return res.status(500).json({ error: "Erro interno." });
  }
});

export default router;
