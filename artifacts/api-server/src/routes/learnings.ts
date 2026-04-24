import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, learningsTable } from "@workspace/db";
import {
  CreateLearningBody,
  DeleteLearningParams,
  ListLearningsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/learnings", async (_req, res): Promise<void> => {
  const learnings = await db
    .select()
    .from(learningsTable)
    .orderBy(learningsTable.createdAt);
  res.json(ListLearningsResponse.parse(learnings));
});

router.post("/learnings", async (req, res): Promise<void> => {
  const parsed = CreateLearningBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [learning] = await db
    .insert(learningsTable)
    .values({
      month: parsed.data.month,
      about: parsed.data.about,
      content: parsed.data.content,
    })
    .returning();

  res.status(201).json(learning);
});

router.delete("/learnings/:id", async (req, res): Promise<void> => {
  const params = DeleteLearningParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  await db.delete(learningsTable).where(eq(learningsTable.id, params.data.id));
  res.sendStatus(204);
});

export default router;
