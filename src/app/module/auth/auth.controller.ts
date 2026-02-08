import { Request, Response } from "express";
import { catchAsync } from "../../shared/catch-async";
import { sendResponse } from "../../shared/send-respone";
import { AuthService } from "./auth.service";
import status from "http-status";
import { tokenUtils } from "../../utils/token";

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
        data: data
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

export const AuthController = {
    registerPatient,
    loginUser
}