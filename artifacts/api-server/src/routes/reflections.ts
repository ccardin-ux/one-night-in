import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, reflectionsTable } from "@workspace/db";
import {
  CreateReflectionBody,
  UpdateReflectionBody,
  UpdateReflectionParams,
  GetReflectionParams,
  GetReflectionResponse,
  UpdateReflectionResponse,
  DeleteReflectionParams,
  ListReflectionsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/reflections", async (_req, res): Promise<void> => {
  const reflections = await db
    .select()
    .from(reflectionsTable)
    .orderBy(reflectionsTable.createdAt);
  res.json(ListReflectionsResponse.parse(reflections));
});

router.post("/reflections", async (req, res): Promise<void> => {
  const parsed = CreateReflectionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [reflection] = await db
    .insert(reflectionsTable)
    .values(parsed.data)
    .returning();

  res.status(201).json(GetReflectionResponse.parse(reflection));
});

router.get("/reflections/:id", async (req, res): Promise<void> => {
  const params = GetReflectionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [reflection] = await db
    .select()
    .from(reflectionsTable)
    .where(eq(reflectionsTable.id, params.data.id));

  if (!reflection) {
    res.status(404).json({ error: "Reflection not found" });
    return;
  }

  res.json(GetReflectionResponse.parse(reflection));
});

router.patch("/reflections/:id", async (req, res): Promise<void> => {
  const params = UpdateReflectionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateReflectionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.highlight !== undefined) updateData.highlight = parsed.data.highlight;
  if (parsed.data.memory !== undefined) updateData.memory = parsed.data.memory;
  if (parsed.data.learnedAboutEachOther !== undefined) updateData.learnedAboutEachOther = parsed.data.learnedAboutEachOther;
  if (parsed.data.rating !== undefined) updateData.rating = parsed.data.rating;

  const [reflection] = await db
    .update(reflectionsTable)
    .set(updateData)
    .where(eq(reflectionsTable.id, params.data.id))
    .returning();

  if (!reflection) {
    res.status(404).json({ error: "Reflection not found" });
    return;
  }

  res.json(UpdateReflectionResponse.parse(reflection));
});

router.delete("/reflections/:id", async (req, res): Promise<void> => {
  const params = DeleteReflectionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  await db.delete(reflectionsTable).where(eq(reflectionsTable.id, params.data.id));
  res.sendStatus(204);
});

export default router;
