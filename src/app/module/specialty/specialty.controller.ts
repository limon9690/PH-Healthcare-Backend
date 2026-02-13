import { NextFunction, Request, RequestHandler, Response } from "express";
import { SpecialtyService } from "./specialty.service";
import { catchAsync } from "../../shared/catch-async";
import { sendResponse } from "../../shared/send-respone";

const createSpecailty = catchAsync(async (req: Request, res: Response) => {
    
    const payload = {
        ...req.body,
        icon: req.file?.path
    }
    const data = await SpecialtyService.createSpecialty(payload);

    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Specialty created successfully!",
        data: data
    })
})


const getAllSpecialties = catchAsync(async (req: Request, res: Response) => {
    const result = await SpecialtyService.getAllSpecialties();
    
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Specialties fetched successfully!",
        data: result
    })
})

const updateSpecialty = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const data = await SpecialtyService.updateSpecialty(req.body, id as string);

    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Specialty updated successfully!",
        data: data
    })
})

const deleteSpecailty = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = await SpecialtyService.deleteSpecialty(id as string);

    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "Specialty deleted successfully!",
        data: data
    })
})

export const SpecialtyController = {
    createSpecailty,
    getAllSpecialties,
    updateSpecialty,
    deleteSpecailty
}