import { Router } from "express";
import { UserController } from "./user.controller";
import { validateRequest } from "../../middlewares/validate-request";
import { createDoctorZodSchema } from "./user.validation";

const router = Router();

router.post("/create-doctor", validateRequest(createDoctorZodSchema), UserController.createDoctor);

export const UserRoutes = router;