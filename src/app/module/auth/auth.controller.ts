import { Request, Response } from "express";
import { catchAsync } from "../../shared/catch-async";
import { sendResponse } from "../../shared/send-respone";
import { AuthService } from "./auth.service";
import status from "http-status";
import { tokenUtils } from "../../utils/token";
import AppError from "../../errorHelpers/AppError";
import { CookieUtils } from "../../utils/cookie";

const registerPatient = catchAsync(async (req : Request, res : Response) => {
    const payload = req.body;
    const data = await AuthService.registerPatient(payload);

    const { accessToken, refreshToken, token, ...rest} = data;

    tokenUtils.setAccessTokenInCookie(res, accessToken);
    tokenUtils.setRefreshTokenInCookie(res, refreshToken);
    tokenUtils.setBetterAuthTokenInCookie(res, token as string);

    sendResponse(res, {
        statusCode: status.CREATED,
        success: true,
        message: 'Patient registered successfully',
        data: {
            ...rest,
            accessToken,
            refreshToken,
            token
        }
    })
})

const loginUser = catchAsync(async (req : Request, res : Response) => {
    const payload = req.body;
    const data = await AuthService.loginUser(payload);  

    const { accessToken, refreshToken, token, ...rest} = data;

    tokenUtils.setAccessTokenInCookie(res, accessToken);
    tokenUtils.setRefreshTokenInCookie(res, refreshToken);
    tokenUtils.setBetterAuthTokenInCookie(res, token);

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: 'User logged in successfully',
        data: {
            ...rest,
            accessToken,
            refreshToken,
            token
        }
    })
})

const getMe = catchAsync(async (req : Request, res : Response) => {
    const user = req.user;
    const result = await AuthService.getMe(user);
    
    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: 'User retrieved successfully',
        data: result
    });
});

const getNewToken = catchAsync(async (req: Request, res: Response) => {
    const refreshToken  = req.cookies.refreshToken;
    const sessionToken  = req.cookies['better-auth.session_token'];

    if (!sessionToken) {
        throw new AppError(status.UNAUTHORIZED, 'Session token is missing');
    }
    
    if (!refreshToken) {
        throw new AppError(status.UNAUTHORIZED, 'Refresh token is missing');
    }

    const result = await AuthService.getNewToken(refreshToken, sessionToken);

    const { accessToken, refreshToken: newRefreshToken, ...rest } = result;

    tokenUtils.setAccessTokenInCookie(res, accessToken);
    tokenUtils.setRefreshTokenInCookie(res, newRefreshToken);
    tokenUtils.setBetterAuthTokenInCookie(res, rest.sessionToken);

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: 'New tokens generated successfully',
        data: {
            ...rest,
            accessToken,
            refreshToken: newRefreshToken
        }
    });
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
    const sessionToken  = req.cookies['better-auth.session_token'];

    if (!sessionToken) {
        throw new AppError(status.UNAUTHORIZED, 'Session token is missing');
    }
    const payload = req.body;

    const result = await AuthService.changePassword(payload, sessionToken);

    const { accessToken, refreshToken, token } = result;
    tokenUtils.setAccessTokenInCookie(res, accessToken);
    tokenUtils.setRefreshTokenInCookie(res, refreshToken);
    tokenUtils.setBetterAuthTokenInCookie(res, token as string);

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: 'Password changed successfully',
        data: {
            ...result,
            accessToken,
            refreshToken,
            token
        }
    });
});

const logout = catchAsync(async (req: Request, res: Response) => {
    const sessionToken  = req.cookies['better-auth.session_token'];

    if (!sessionToken) {
        throw new AppError(status.UNAUTHORIZED, 'Session token is missing');
    }

    const result = await AuthService.logOut(sessionToken);

    CookieUtils.clearCookie(res, 'accessToken', {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
    });

    CookieUtils.clearCookie(res, 'refreshToken', {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
    });

    CookieUtils.clearCookie(res, 'better-auth.session_token', {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
    }); 

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: 'Logged out successfully',
        data: result
    });
});

const verifyEmail = catchAsync(async (req: Request, res: Response) => {
    const { email, otp } = req.body;
    await AuthService.verifyEmail(email, otp);

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: 'Email verified successfully',
    });
});

const forgetPassword = catchAsync(async (req: Request, res: Response) => {
    const { email } = req.body;
    await AuthService.forgetPassword(email);

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: 'Password reset OTP sent to email successfully',
    });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
    const { email, otp, newPassword } = req.body;

    await AuthService.resetPassword(email, otp, newPassword);
    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: 'Password reset successfully',
    });
});

export const AuthController = {
    registerPatient,
    loginUser,
    getMe,
    getNewToken,
    changePassword,
    logout,
    verifyEmail,
    forgetPassword,
    resetPassword
}