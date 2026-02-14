import { Request, Response } from "express";
import { catchAsync } from "../../shared/catch-async";
import { DoctorService } from "./doctor.service";
import { sendResponse } from "../../shared/send-respone";
import status from "http-status";
import { IQueryParams } from "../../interfaces/query.interface";

const getAllDoctors = catchAsync(async (req : Request, res : Response) => {
    const query = req.query;
    const result = await DoctorService.getAllDoctors(query as IQueryParams);

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Doctors retrieved successfully",
        data: result.data,
        meta: result.meta,
    });
});

const getSingleDoctor = catchAsync(async (req : Request, res : Response) => {
    const { id } = req.params;
    const doctor = await DoctorService.getSingleDoctor(id as string);

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Doctor retrieved successfully",
        data: doctor,
    });
});

const updateDoctor = catchAsync(async (req : Request, res : Response) => {
    const { id } = req.params;
    const updateDoctorPayload = req.body;
    const updatedDoctor = await DoctorService.updateDoctor(id as string, updateDoctorPayload);

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Doctor updated successfully",
        data: updatedDoctor,
    });
});

const deleteDoctor = catchAsync(async (req : Request, res : Response) => {
    const { id } = req.params;
    const deletedDoctor = await DoctorService.deleteDoctor(id as string);
    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Doctor deleted successfully",
        data: deletedDoctor,
    });
});

export const DoctorController = {
    getAllDoctors,
    getSingleDoctor,
    updateDoctor,
    deleteDoctor,
}