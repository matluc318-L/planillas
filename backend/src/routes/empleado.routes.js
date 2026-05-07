import { Router } from "express";
import {
  listEmpleados,
  createEmpleado,
  updateEmpleado,
  deleteEmpleado,
} from "../controllers/empleado.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(requireAuth);

router.get("/", listEmpleados);
router.post("/", createEmpleado);
router.put("/:id", updateEmpleado);
router.delete("/:id", deleteEmpleado);

export default router;
