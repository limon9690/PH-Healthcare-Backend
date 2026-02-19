import { Router } from "express";
import { ReviewController } from "./review.controller";
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middlewares/auth-check";
import { validateRequest } from "../../middlewares/validate-request";
import { ReviewValidation } from "./review.validation";

const router = Router();

router.get('/', ReviewController.getAllReviews);

router.post(
    '/',
    checkAuth(Role.PATIENT),
    validateRequest(ReviewValidation.createReviewZodSchema),
    ReviewController.giveReview
);

router.get('/my-reviews', checkAuth(Role.PATIENT, Role.DOCTOR), ReviewController.myReviews);

router.patch('/:id', checkAuth(Role.PATIENT), validateRequest(ReviewValidation.updateReviewZodSchema), ReviewController.updateReview);

router.delete('/:id', checkAuth(Role.PATIENT), ReviewController.deleteReview);




export const ReviewRoutes = router;