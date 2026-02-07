import { Request, Response } from "express";
import { catchAsync } from "../../shared/catch-async";
import { DoctorService } from "./doctor.service";
import { sendResponse } from "../../shared/send-respone";
import status from "http-status";

const getAllDoctors = catchAsync(async (req : Request, res : Response) => {
    const doctors = await DoctorService.getAllDoctors();
    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Doctors retrieved successfully",
        data: doctors,
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
    const updatedDoctor = await DoctorService.updateDoctor(updateDoctorPayload, id as string);

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