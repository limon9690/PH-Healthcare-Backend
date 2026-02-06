import { Response } from "express";

interface IresponseData<T> {
    statusCode: number;
    success: boolean;
    message?: string;
    data?: T;
}


export const sendResponse = <T>(res: Response, responseData: IresponseData<T>) => {
    res.status(responseData.statusCode).json({
        statusCode: responseData.statusCode,
        success: responseData.success,
        message: responseData.message,
        data: responseData.data
    });
}