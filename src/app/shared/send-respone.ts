import { Response } from "express";

interface IresponseData<T> {
    statusCode: number;
    success: boolean;
    message?: string;
    data?: T;
    meta? : {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    }
}


export const sendResponse = <T>(res: Response, responseData: IresponseData<T>) => {
    res.status(responseData.statusCode).json({
        statusCode: responseData.statusCode,
        success: responseData.success,
        message: responseData.message,
        data: responseData.data,
        meta: responseData.meta,
    });
}