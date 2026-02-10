import { Router } from "express";
import { DoctorController } from "./doctor.controller";
import { validateRequest } from "../../middlewares/validate-request";
import { updateDoctorZodSchema } from "./doctor.validation";
import { checkAuth } from "../../middlewares/auth-check";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.get("/", DoctorController.getAllDoctors);

router.get("/:id", DoctorController.getSingleDoctor);

router.put("/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), validateRequest(updateDoctorZodSchema), DoctorController.updateDoctor);

router.delete("/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), DoctorController.deleteDoctor);

export const DoctorRoutes = router;