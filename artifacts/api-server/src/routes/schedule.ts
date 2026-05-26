import { Router } from "express";
import { db } from "@workspace/db";
import { appSettingsTable, appointmentsTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";

const router = Router();

export const ALL_TIME_SLOTS = ["08:00","09:00","10:00","11:00","13:00","14:00","15:00","16:00","17:00"];
export const DEFAULT_WORKING_DAYS = [1,2,3,4,5,6];

async function getSetting(key: string): Promise<string | null> {
  const [row] = await db.select().from(appSettingsTable).where(eq(appSettingsTable.key, `schedule.${key}`)).limit(1);
  return row?.value ?? null;
}

async function setSetting(key: string, value: string) {
  await db.insert(appSettingsTable).values({ key: `schedule.${key}`, value })
    .onConflictDoUpdate({ target: appSettingsTable.key, set: { value, updatedAt: new Date() } });
}

export async function getScheduleConfig() {
  const [wd, ts, bd] = await Promise.all([getSetting("workingDays"), getSetting("timeSlots"), getSetting("blockedDates")]);
  return {
    workingDays: wd ? (JSON.parse(wd) as number[]) : DEFAULT_WORKING_DAYS,
    timeSlots: ts ? (JSON.parse(ts) as string[]) : ALL_TIME_SLOTS,
    blockedDates: bd ? (JSON.parse(bd) as string[]) : [],
  };
}

router.get("/admin/schedule-config", async (_req, res) => {
  try {
    return res.json(await getScheduleConfig());
  } catch {
    return res.status(500).json({ error: "Erro interno." });
  }
});

router.patch("/admin/schedule-config", async (req: any, res) => {
  try {
    if (req.jwtUser?.role !== "admin") return res.status(403).json({ error: "Acesso negado." });
    const { workingDays, timeSlots, blockedDates } = req.body;
    if (workingDays) await setSetting("workingDays", JSON.stringify(workingDays));
    if (timeSlots) await setSetting("timeSlots", JSON.stringify(timeSlots));
    if (blockedDates) await setSetting("blockedDates", JSON.stringify(blockedDates));
    return res.json(await getScheduleConfig());
  } catch {
    return res.status(500).json({ error: "Erro interno." });
  }
});

router.get("/admin/availability", async (req, res) => {
  try {
    const { date } = req.query as { date?: string };
    if (!date) return res.status(400).json({ error: "date é obrigatório." });
    const config = await getScheduleConfig();
    const dateObj = new Date(date + "T00:00:00");
    const dayOfWeek = dateObj.getDay();
    if (!config.workingDays.includes(dayOfWeek)) return res.json({ available: [], booked: config.timeSlots });
    if (config.blockedDates.includes(date)) return res.json({ available: [], booked: config.timeSlots });
    const booked = await db.select({ time: appointmentsTable.time }).from(appointmentsTable)
      .where(and(eq(appointmentsTable.date, date)));
    const bookedTimes = new Set(booked.map(b => b.time));
    const available = config.timeSlots.filter(t => !bookedTimes.has(t));
    return res.json({ available, booked: Array.from(bookedTimes), timeSlots: config.timeSlots });
  } catch {
    return res.status(500).json({ error: "Erro interno." });
  }
});

export default router;
