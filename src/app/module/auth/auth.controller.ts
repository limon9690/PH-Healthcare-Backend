import { Request, Response } from "express";
import { catchAsync } from "../../shared/catch-async";
import { sendResponse } from "../../shared/send-respone";
import { AuthService } from "./auth.service";
import { log } from "node:console";

const registerPatient = catchAsync(async (req : Request, res : Response) => {
    const payload = req.body;
    const data = await AuthService.registerPatient(payload);

    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: 'Patient registered successfully',
        data: data
    })
})

const loginUser = catchAsync(async (req : Request, res : Response) => {
    const payload = req.body;
    const data = await AuthService.loginUser(payload);  
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: 'User logged in successfully',
        data: data
    })
})

export const AuthController = {
    registerPatient,
    loginUser
}