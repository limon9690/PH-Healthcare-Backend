import { Router } from "express";
import { checkAuth } from "../../middlewares/auth-check";
import { Role } from "../../../generated/prisma/enums";
import { StatsController } from "./stats.controller";

const router = Router();

router.get(
    '/',
    checkAuth(Role.SUPER_ADMIN, Role.ADMIN, Role.DOCTOR, Role.PATIENT),
    StatsController.getDashboardStatsData
)


export const StatsRoutes = router;