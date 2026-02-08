import { Router } from "express";
import { SpecialtyController } from "./specialty.controller";
import { checkAuth } from "../../middlewares/auth-check";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post('/', SpecialtyController.createSpecailty);
router.get('/', checkAuth(Role.ADMIN), SpecialtyController.getAllSpecialties);
router.put('/:id', SpecialtyController.updateSpecialty),
router.delete('/:id', SpecialtyController.deleteSpecailty)

export const SpecialtyRoutes = router;