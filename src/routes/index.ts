import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes";
import schoolRoutes from "../modules/schools/schools.routes"
import studentRoutes from "../modules/students/students.routes"
import { parentsRouter } from "../modules/parents/parents.routes";
const router = Router();


router.use("/auth", authRoutes);
router.use("/schools", schoolRoutes);
router.use("/students", studentRoutes);
router.use("/parents", parentsRouter);
// later you will add:
// router.use("/billing", billingRoutes);
// router.use("/fees", feesRoutes);
// router.use("/payments", paymentsRoutes);
// router.use("/attendance", attendanceRoutes);
// router.use("/revenue", revenueRoutes);


export default router;


