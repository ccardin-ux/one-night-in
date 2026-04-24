import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, checklistItemsTable } from "@workspace/db";
import {
  GetChecklistParams,
  ToggleChecklistItemParams,
  ToggleChecklistItemBody,
  ToggleChecklistItemResponse,
  GetChecklistResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/checklist/:month", async (req, res): Promise<void> => {
  const params = GetChecklistParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const items = await db
    .select()
    .from(checklistItemsTable)
    .where(eq(checklistItemsTable.month, params.data.month))
    .orderBy(checklistItemsTable.id);

  res.json(GetChecklistResponse.parse(items));
});

router.patch("/checklist/:month/:itemId", async (req, res): Promise<void> => {
  const rawMonth = Array.isArray(req.params.month) ? req.params.month[0] : req.params.month;
  const rawItemId = Array.isArray(req.params.itemId) ? req.params.itemId[0] : req.params.itemId;
  const month = parseInt(rawMonth, 10);
  const itemId = parseInt(rawItemId, 10);

  if (isNaN(month) || isNaN(itemId)) {
    res.status(400).json({ error: "Invalid month or itemId" });
    return;
  }

  const parsed = ToggleChecklistItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [item] = await db
    .update(checklistItemsTable)
    .set({ completed: parsed.data.completed })
    .where(
      and(
        eq(checklistItemsTable.id, itemId),
        eq(checklistItemsTable.month, month)
      )
    )
    .returning();

  if (!item) {
    res.status(404).json({ error: "Checklist item not found" });
    return;
  }

  res.json(ToggleChecklistItemResponse.parse(item));
});

export default router;
