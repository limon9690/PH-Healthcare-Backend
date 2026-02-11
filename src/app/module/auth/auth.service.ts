import status from "http-status";
import { UserStatus } from "../../../generated/prisma/enums";
import AppError from "../../errorHelpers/AppError";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { IChangePasswordPayload, ILoginUserPayload, IRegisterPatientPayload } from "./auth.interface";
import { tokenUtils } from "../../utils/token";
import { IUserRequest } from "../../interfaces";
import { ref } from "node:process";
import { jwtUtils } from "../../utils/jwt";
import { envVars } from "../../config/env";
import { JwtPayload } from "jsonwebtoken";

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

const getMe = async (user: IUserRequest) => {
    const existingUser = await prisma.user.findUnique({
        where: {
            id: user.userId
        },
        include: {
            patients: {
                include: {
                    appointments: true,
                    medicalReports: true,
                    prescriptions: true,
                    reviews: true,
                    patientHealthData: true
                },
            },
            doctors: {
                include: {
                    appointments: true,
                    specialties: true,
                    reviews: true
                },
            },
            admins: true
        },
    });

    return existingUser;
}

const getNewToken = async (refreshToken: string, sessionToken: string) => {
    const existingSession = await prisma.session.findUnique({
        where: {
            token: sessionToken
        },
        include: {
            user: true
        }
    });

    if (!existingSession) {
        throw new AppError(status.UNAUTHORIZED, 'Invalid session token');
    }

    const verifiedToken = jwtUtils.verifyToken(refreshToken, envVars.REFRESH_TOKEN_SECRET);

    if (!verifiedToken.success && verifiedToken.error) {
        throw new AppError(status.UNAUTHORIZED, 'Invalid refresh token');
    }

    const data = verifiedToken.data as JwtPayload;

    const newAccessToken = tokenUtils.getAccessToken({
        userId: data.userId,
        email: data.email,
        role: data.role,
        name: data.name,
        status: data.status,
        isDeleted: data.isDeleted,
        emailVerified: data.emailVerified
    });

    const newRefreshToken = tokenUtils.getRefreshToken({
        userId: data.userId,
        email: data.email,
        role: data.role,
        name: data.name,
        status: data.status,
        isDeleted: data.isDeleted,
        emailVerified: data.emailVerified
    });

    const updatedSession = await prisma.session.update({
        where: {
            token: sessionToken
        },
        data: {
            expiresAt: new Date(Date.now() + (60 * 60 * 24 * 1000))
        }
    })

    return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        sessionToken: updatedSession.token
    }
}

const changePassword = async (payload: IChangePasswordPayload, sessionToken: string) => {
    const session = await auth.api.getSession({
        headers: {
            Authorization: `Bearer ${sessionToken}`
        }
    });

    if (!session) {
        throw new AppError(status.UNAUTHORIZED, 'Invalid session token');
    }

    const { currentPassword, newPassword } = payload;

    const result = await auth.api.changePassword({
        body: {
            currentPassword,
            newPassword,
            revokeOtherSessions: true

        },
        headers: {
            Authorization: `Bearer ${sessionToken}`
        }
    });

    const newAccessToken = tokenUtils.getAccessToken({
        userId: session.user.id,
        email: session.user.email,
        role: session.user.role,
        name: session.user.name,
        status: session.user.status,
        isDeleted: session.user.isDeleted,
        emailVerified: session.user.emailVerified
    });

    const newRefreshToken = tokenUtils.getRefreshToken({
        userId: session.user.id,
        email: session.user.email,
        role: session.user.role,
        name: session.user.name,
        status: session.user.status,
        isDeleted: session.user.isDeleted,
        emailVerified: session.user.emailVerified
    });

    return {
        ...result,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
    };
}

const logOut = async (sessionToken: string) => {
    const result = await auth.api.signOut({
        headers: {
            Authorization: `Bearer ${sessionToken}`
        }
    });

    return result;
}

const verifyEmail = async (email: string, otp: string) => {
    const result = await auth.api.verifyEmailOTP({
        body: {
            email,
            otp
        }
    });

    if (result.status && !result.user.emailVerified) {
        await prisma.user.update({
            where: {
                email: email
            },
            data: {
                emailVerified: true
            }
        });
    }

    return result;
}

const forgetPassword = async (email: string) => {
    const existingUser = await prisma.user.findUnique({
        where: {
            email: email
        }
    });

    if (!existingUser) {
        throw new AppError(status.NOT_FOUND, 'User with this email does not exist');
    }

    if (existingUser.status === UserStatus.BLOCKED || existingUser.isDeleted || existingUser.status === UserStatus.DELETED) {
        throw new AppError(status.FORBIDDEN, 'User is not allowed to reset password');
    }

    await auth.api.requestPasswordResetEmailOTP({
        body: {
            email: email
        }
    })
}

const resetPassword = async (email: string, otp: string, newPassword: string) => {
    const existingUser = await prisma.user.findUnique({
        where: {
            email: email
        }
    });

    if (!existingUser) {
        throw new AppError(status.NOT_FOUND, 'User with this email does not exist');
    }

    if (existingUser.status === UserStatus.BLOCKED || existingUser.isDeleted || existingUser.status === UserStatus.DELETED) {
        throw new AppError(status.FORBIDDEN, 'User is not allowed to reset password');
    }

    await auth.api.resetPasswordEmailOTP({
        body: {
            email,
            otp,
            password: newPassword
        }
    })

    await prisma.session.deleteMany({
        where: {
            userId: existingUser.id
        }
    }); 
}

export const AuthService = {
    registerPatient,
    loginUser,
    getMe,
    getNewToken,
    changePassword,
    logOut,
    verifyEmail,
    forgetPassword,
    resetPassword
}