import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes";
import schoolRoutes from "../modules/schools/schools.routes"
import studentRoutes from "../modules/students/students.routes"
import { parentsRouter } from "../modules/parents/parents.routes";
import classesRoutes from "../modules/classes/classes.routes";
const router = Router();


router.use("/auth", authRoutes);
router.use("/schools", schoolRoutes);
router.use("/students", studentRoutes);
router.use("/parents", parentsRouter);
router.use("/classes", classesRoutes);
// later you will add:
// router.use("/billing", billingRoutes);
// router.use("/fees", feesRoutes);
// router.use("/payments", paymentsRoutes);
// router.use("/attendance", attendanceRoutes);
// router.use("/revenue", revenueRoutes);


export default router;


