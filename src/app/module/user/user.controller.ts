import { Request, Response } from "express";
import { catchAsync } from "../../shared/catch-async";
import { UserService } from "./user.service";
import { sendResponse } from "../../shared/send-respone";

const createDoctor = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;

    const doctor = await UserService.createDoctor(payload);

    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Doctor created successfully",
        data: doctor,
    });
})

export const UserController = {
    createDoctor,
};