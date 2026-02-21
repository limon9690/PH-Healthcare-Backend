import { Request, Response } from "express";
import { catchAsync } from "../../shared/catch-async";
import { StatsService } from "./stats.service";
import { sendResponse } from "../../shared/send-respone";
import status from "http-status";

const getDashboardStatsData = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    const result = await StatsService.getDashboardStatsData(user);

    sendResponse(res, {
        statusCode: status.OK,
        success: true,
        message: "Stats data retrieved successfully!",
        data: result
    })
});

export const StatsController = {
    getDashboardStatsData
}