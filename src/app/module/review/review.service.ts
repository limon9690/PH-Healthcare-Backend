import status from "http-status";
import { PaymentStatus } from "../../../generated/prisma/enums";
import { IUserRequest } from "../../interfaces";
import { prisma } from "../../lib/prisma";
import { ICreateReviewPayload } from "./review.interface";
import AppError from "../../errorHelpers/AppError";

const giveReview = async (user : IUserRequest, payload : ICreateReviewPayload) => {
   const patientData = await prisma.patient.findUniqueOrThrow({
    where: {
        email : user.email
    }
   });

   const appointmentData = await prisma.appointment.findUniqueOrThrow({
    where: {
        id : payload.appointmentId
    }   });

    if(appointmentData.paymentStatus !== PaymentStatus.PAID){
        throw new AppError(status.BAD_REQUEST, "You can only review after payment is done");
    };

    if(appointmentData.patientId !== patientData.id){
        throw new AppError(status.BAD_REQUEST, "You can only review for your own appointments");
    };

    const isReviewed = await prisma.review.findFirst({
        where: {
            appointmentId : payload.appointmentId
        }
    });

    if (isReviewed) {
        throw new AppError(status.BAD_REQUEST, "You have already reviewed for this appointment. You can update your review instead.");
    };   

    const result = await prisma.$transaction(async (tx) => {
        const review = await tx.review.create({
            data: {
                ...payload,
                patientId:appointmentData.patientId,
                doctorId: appointmentData.doctorId
            }
        });

        const averageRating = await tx.review.aggregate({
            where: {
                doctorId: appointmentData.doctorId
            },
            _avg: {
                rating: true
            }
        });

        await tx.doctor.update({
            where: {
                id: appointmentData.doctorId
            },
            data: {
                averageRating: averageRating._avg.rating as number
            }
        });

        return review;
    });

    return result;
};

const getAllReviews = async () => {}

const myReviews = async (user : IUserRequest) => {}

const updateReview = async (user : IUserRequest, reviewId : string, payload : ICreateReviewPayload) => {}

const deleteReview = async (user : IUserRequest, reviewId : string) => {}

export const ReviewService = {
    giveReview,
    getAllReviews,
    myReviews,
    updateReview,
    deleteReview
}