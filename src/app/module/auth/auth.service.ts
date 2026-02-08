import status from "http-status";
import { UserStatus } from "../../../generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { ILoginUserPayload, IRegisterPatientPayload } from "./auth.interface";
import { tokenUtils } from "../../utils/token";

const registerPatient = async (payload: IRegisterPatientPayload) => {
    const data = await auth.api.signUpEmail({
        body: {
            ...payload
        }
    });

    if (!data.user) {
        throw new AppError(status.BAD_REQUEST, 'User registration failed');
    }

    try {
        const patient = await prisma.$transaction(async (tx) => {
            const patientData = await tx.patient.create({
                data: {
                    userId: data.user.id,
                    name: data.user.name,
                    email: data.user.email
                }
            });
            return patientData;
        })

        const accessToken = tokenUtils.getAccessToken({
            userId: data.user.id,
            email: data.user.email,
            role: data.user.role,
            name: data.user.name,
            status: data.user.status,
            isDeleted: data.user.isDeleted,
            emailVerified: data.user.emailVerified
        });

        const refreshToken = tokenUtils.getRefreshToken({
            userId: data.user.id,
            email: data.user.email,
            role: data.user.role,
            name: data.user.name,
            status: data.user.status,
            isDeleted: data.user.isDeleted,
            emailVerified: data.user.emailVerified
        });

        return {
            ...data,
            accessToken,
            refreshToken,
            patient
        };
    } catch (error) {
        console.log('Error creating patient record:', error);
        // Rollback user creation if patient creation fails
        await prisma.user.delete({
            where: { id: data.user.id }
        });
        throw error;
    }
}

const loginUser = async (payload: ILoginUserPayload) => {
    const data = await auth.api.signInEmail({
        body: {
            ...payload
        }
    });

    if (!data.user) {
        throw new AppError(status.BAD_REQUEST, 'User login failed');
    }

    if (data.user.status === UserStatus.BLOCKED) {
        throw new AppError(status.FORBIDDEN, 'User is blocked');
    }

    if (data.user.status === UserStatus.DELETED || data.user.isDeleted) {
        throw new AppError(status.GONE, 'User is deleted');
    }

    const accessToken = tokenUtils.getAccessToken({
        userId: data.user.id,
        email: data.user.email,
        role: data.user.role,
        name: data.user.name,
        status: data.user.status,
        isDeleted: data.user.isDeleted,
        emailVerified: data.user.emailVerified
    });

    const refreshToken = tokenUtils.getRefreshToken({
        userId: data.user.id,
        email: data.user.email,
        role: data.user.role,
        name: data.user.name,
        status: data.user.status,
        isDeleted: data.user.isDeleted,
        emailVerified: data.user.emailVerified
    });

    return {
        ...data,
        accessToken,
        refreshToken
    };
}

export const AuthService = {
    registerPatient,
    loginUser
}