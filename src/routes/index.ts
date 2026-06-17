// src/routes/index.ts
import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes";
import schoolRoutes from "../modules/schools/schools.routes"
import studentRoutes from "../modules/students/students.routes"
import { parentsRouter } from "../modules/parents/parents.routes";
import classesRoutes from "../modules/classes/classes.routes";
import { createFeesRoutes } from "../modules/fees/fees.routes";
import billingRoutes from "../modules/billing/billing.routes";
import { PrismaClient } from "@prisma/client"; // 👈 add this

const prisma = new PrismaClient(); // 👈 add this


const router = Router();


router.use("/auth", authRoutes);
router.use("/schools", schoolRoutes);
router.use("/students", studentRoutes);
router.use("/parents", parentsRouter);
router.use("/classes", classesRoutes);
router.use("/fees", createFeesRoutes(prisma)); // ✅ call it with prisma
router.use("/billing", billingRoutes);
// later you will add:
//router.use("/attendance", attendanceRoutes);
// router.use("/fees", feesRoutes);
// router.use("/payments", paymentsRoutes);
// router.use("/revenue", revenueRoutes);


export default router;

