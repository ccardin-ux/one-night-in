import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, datePlansTable, reflectionsTable, learningsTable } from "@workspace/db";
import {
  GetDateParams,
  GetDateResponse,
  UpdateDateParams,
  UpdateDateBody,
  UpdateDateResponse,
  ListDatesResponse,
  GetSummaryResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/dates", async (_req, res): Promise<void> => {
  const dates = await db.select().from(datePlansTable).orderBy(datePlansTable.month);
  res.json(ListDatesResponse.parse(dates));
});

router.get("/dates/:month", async (req, res): Promise<void> => {
  const params = GetDateParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [date] = await db
    .select()
    .from(datePlansTable)
    .where(eq(datePlansTable.month, params.data.month));

  if (!date) {
    res.status(404).json({ error: "Date plan not found" });
    return;
  }

  res.json(GetDateResponse.parse(date));
});

router.patch("/dates/:month", async (req, res): Promise<void> => {
  const params = UpdateDateParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateDateBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.scheduledDate !== undefined) updateData.scheduledDate = parsed.data.scheduledDate;
  if (parsed.data.completed !== undefined) updateData.completed = parsed.data.completed;
  if (parsed.data.completedAt !== undefined) updateData.completedAt = parsed.data.completedAt;

  const [date] = await db
    .update(datePlansTable)
    .set(updateData)
    .where(eq(datePlansTable.month, params.data.month))
    .returning();

  if (!date) {
    res.status(404).json({ error: "Date plan not found" });
    return;
  }

  res.json(UpdateDateResponse.parse(date));
});

router.get("/summary", async (_req, res): Promise<void> => {
  const dates = await db.select().from(datePlansTable).orderBy(datePlansTable.month);
  
  const reflections = await db.select().from(reflectionsTable);
  const learnings = await db.select().from(learningsTable);

  const completedDates = dates.filter((d) => d.completed).length;
  const upcomingDate = dates.find((d) => !d.completed);
  const nextScheduled = dates.find((d) => !d.completed && d.scheduledDate);

  res.json(
    GetSummaryResponse.parse({
      totalDates: dates.length,
      completedDates,
      upcomingMonth: upcomingDate?.month ?? null,
      totalReflections: reflections.length,
      totalLearnings: learnings.length,
      nextScheduledDate: nextScheduled?.scheduledDate ?? null,
    })
  );
});

export default router;
