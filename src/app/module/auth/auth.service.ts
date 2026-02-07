import { UserStatus } from "../../../generated/prisma/enums";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";

interface IRegisterPatientPayload {
    name: string;
    email: string;
    password: string;
}

interface ILoginUserPayload {
    email: string;
    password: string;
}

const registerPatient = async (payload: IRegisterPatientPayload) => {
    const data = await auth.api.signUpEmail({
        body: {
            ...payload
        }
    });

    if (!data.user) {
        throw new Error('User registration failed');
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

        return {
            ...data,
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
        throw new Error('User login failed');
    }

    if (data.user.status === UserStatus.BLOCKED) {
        throw new Error('User is blocked');
    }

    if (data.user.status === UserStatus.DELETED || data.user.isDeleted) {
        throw new Error('User is deleted');
    }

    return data;
}

export const AuthService = {
    registerPatient,
    loginUser
}