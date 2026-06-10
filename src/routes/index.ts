import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes";
import schoolRoutes from "../modules/schools/schools.routes"
const router = Router();

router.use("/auth", authRoutes);
router.use("/schools", schoolRoutes);
// later you will add:
// router.use("/students", studentRoutes);
// router.use("/finance", financeRoutes);

export default router;


