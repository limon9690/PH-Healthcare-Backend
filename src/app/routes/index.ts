import { Router } from "express";
import { SpecialtyRoutes } from "../module/specialty/specialty.route";
import { AuthRoute } from "../module/auth/auth.route";
import { UserRoutes } from "../module/user/user.routes";
import { DoctorRoutes } from "../module/doctor/doctor.route";
import { AdminRoutes } from "../module/admin/admin.route";

const router = Router();

router.use("/specialties", SpecialtyRoutes);
router.use("/users", UserRoutes);
router.use("/auth", AuthRoute);
router.use("/doctors", DoctorRoutes);
router.use("/admins", AdminRoutes);

export const indexRoutes = router;