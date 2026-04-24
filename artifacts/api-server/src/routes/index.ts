import { Router, type IRouter } from "express";
import healthRouter from "./health";
import datesRouter from "./dates";
import reflectionsRouter from "./reflections";
import checklistRouter from "./checklist";
import favoritesRouter from "./favorites";
import learningsRouter from "./learnings";

const router: IRouter = Router();

router.use(healthRouter);
router.use(datesRouter);
router.use(reflectionsRouter);
router.use(checklistRouter);
router.use(favoritesRouter);
router.use(learningsRouter);

export default router;
