import { Router } from "express";
import { SpecialtyController } from "./specialty.controller";

const router = Router();

router.post('/', SpecialtyController.createSpecailty);
router.get('/', SpecialtyController.getAllSpecialties);
router.put('/:id', SpecialtyController.updateSpecialty),
router.delete('/:id', SpecialtyController.deleteSpecailty)

export const SpecialtyRoutes = router;