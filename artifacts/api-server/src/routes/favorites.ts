import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, favoritesTable } from "@workspace/db";
import {
  CreateFavoriteBody,
  DeleteFavoriteParams,
  ListFavoritesResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/favorites", async (_req, res): Promise<void> => {
  const favorites = await db
    .select()
    .from(favoritesTable)
    .orderBy(favoritesTable.createdAt);
  res.json(ListFavoritesResponse.parse(favorites));
});

router.post("/favorites", async (req, res): Promise<void> => {
  const parsed = CreateFavoriteBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [favorite] = await db
    .insert(favoritesTable)
    .values({
      type: parsed.data.type,
      content: parsed.data.content,
      sourceMonth: parsed.data.sourceMonth,
    })
    .returning();

  res.status(201).json(favorite);
});

router.delete("/favorites/:id", async (req, res): Promise<void> => {
  const params = DeleteFavoriteParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  await db.delete(favoritesTable).where(eq(favoritesTable.id, params.data.id));
  res.sendStatus(204);
});

export default router;
