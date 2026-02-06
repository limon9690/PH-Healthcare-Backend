import { Router } from "express";
import { specialtyController } from "./specialty.controller";

const router = Router();

router.post('/', specialtyController.createSpecailty);
router.get('/', specialtyController.getAllSpecialties);
router.put('/:id', specialtyController.updateSpecialty),
router.delete('/:id', specialtyController.deleteSpecailty)

export const specialtyRoutes = router;