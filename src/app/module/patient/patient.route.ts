import { Router } from "express";
import { checkAuth } from "../../middlewares/auth-check";
import { Role } from "../../../generated/prisma/enums";
import { multerUpload } from "../../config/multer.config";
import { PatientController } from "./patient.controller";
import { updateMyPatientProfileMiddleware } from "./patient.middlewares";
import { validateRequest } from "../../middlewares/validate-request";
import { PatientValidation } from "./patient.validationt";

const router = Router();

router.patch("/update-my-profile",
    checkAuth(Role.PATIENT),
    multerUpload.fields([
        { name : "profilePhoto", maxCount : 1},
        { name : "medicalReports", maxCount : 5}
    ]),
    updateMyPatientProfileMiddleware,
    validateRequest(PatientValidation.updatePatientProfileZodSchema),
    PatientController.updateMyProfile
)

export const PatientRoutes = router;