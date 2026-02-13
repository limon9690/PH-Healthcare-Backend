import { Router } from "express";
import { SpecialtyController } from "./specialty.controller";
import { checkAuth } from "../../middlewares/auth-check";
import { Role } from "../../../generated/prisma/enums";
import { multerUpload } from "../../config/multer.config";
import { validateRequest } from "../../middlewares/validate-request";
import { SpecialtyValidation } from "./specialty.validation";

const router = Router();

router.post('/',  multerUpload.single("file"), validateRequest(SpecialtyValidation.createSpecialtyZodSchema), SpecialtyController.createSpecailty);

router.get('/', SpecialtyController.getAllSpecialties);

router.put('/:id', checkAuth(Role.ADMIN, Role.SUPER_ADMIN), SpecialtyController.updateSpecialty);

router.delete('/:id', checkAuth(Role.ADMIN, Role.SUPER_ADMIN), SpecialtyController.deleteSpecailty);

export const SpecialtyRoutes = router;