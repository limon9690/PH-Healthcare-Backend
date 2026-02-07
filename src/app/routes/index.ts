import { Router } from "express";
import { SpecialtyRoutes } from "../module/specialty/specialty.route";
import { AuthRoute } from "../module/auth/auth.route";

const router = Router();

router.use("/specialties", SpecialtyRoutes);
router.use("/auth", AuthRoute);

export const indexRoutes = router;