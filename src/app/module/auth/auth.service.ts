import { UserStatus } from "../../../generated/prisma/enums";
import { auth } from "../../lib/auth";

interface IRegisterPatientPayload {
  name: string;
  email: string;
  password: string;
}

interface ILoginUserPayload {
  email: string;
  password: string;
}

const registerPatient = async (payload : IRegisterPatientPayload) => {
    const data = await auth.api.signUpEmail({
        body: {
            ...payload
        }
    });

    if (!data.user) {
        throw new Error('User registration failed');
    }

    return data;
}

const loginUser = async (payload : ILoginUserPayload) => {
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

    return data.user;
}

export const AuthService = {
    registerPatient,
    loginUser
}