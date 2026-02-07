import { Router } from "express";
import { SpecialtyRoutes } from "../module/specialty/specialty.route";
import { AuthRoute } from "../module/auth/auth.route";
import { DoctorRoutes } from "../module/user/user.routes";

const router = Router();

router.use("/specialties", SpecialtyRoutes);
router.use("/users", DoctorRoutes);
router.use("/auth", AuthRoute);

export const indexRoutes = router;