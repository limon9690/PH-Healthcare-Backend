import { Request, Response } from "express";
import { catchAsync } from "../../shared/catch-async";
import { ScheduleService } from "./schedule.service";
import { sendResponse } from "../../shared/send-respone";
import status from "http-status";
import { IQueryParams } from "../../interfaces/query.interface";

const createSchedule = catchAsync(async (req : Request, res : Response) => {
    const schedule = await ScheduleService.createSchedule(req.body);

    sendResponse(res, {
        statusCode: status.CREATED,
        success: true,
        message: "Schedule created successfully",
        data: schedule
    })
});

const getAllSchedules = catchAsync(async (req : Request, res : Response) => {
    const query = req.query;
    const schedules = await ScheduleService.getAllSchedules(query as IQueryParams);

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Schedules retrieved successfully",
        data: schedules.data,
        meta: schedules.meta
    })
});

const getScheduleById = catchAsync(async (req : Request, res : Response) => {
    const { id } = req.params;
    const schedule = await ScheduleService.getScheduleById(id as string);

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Schedule retrieved successfully",
        data: schedule
    })
});

const updateSchedule   = catchAsync(async (req : Request, res : Response) => {
    const { id } = req.params;
    const updatedSchedule = await ScheduleService.updateSchedule(id as string, req.body);

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Schedule updated successfully",
        data: updatedSchedule
    })
});

const deleteSchedule = catchAsync(async (req : Request, res : Response) => {
    const {id} = req.params;
    await ScheduleService.deleteSchedule(id as string);

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Schedule deleted successfully"
    })
});

export const ScheduleController = {
    createSchedule,
    getAllSchedules,
    getScheduleById,
    updateSchedule,
    deleteSchedule
}