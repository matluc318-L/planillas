import { Router } from "express";
import { listPlanillas, createPlanilla } from "../controllers/planilla.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(requireAuth);

router.get("/", listPlanillas);
router.post("/", createPlanilla);

export default router;
