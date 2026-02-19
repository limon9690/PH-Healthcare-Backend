import { NextFunction, Request, Response } from "express";
import { envVars } from "../config/env";
import status from "http-status";
import z from "zod";
import { IErrorResponse, IErrorSource } from "../interfaces/error.interface";
import { zodErrorHandler } from "../errorHelpers/zod-error-handler";
import AppError from "../errorHelpers/AppError";
import { deleteUploadedFilesFromGlobalErrorHandler } from "../utils/deleteUploadedFilesFromGlobalErrorHandler";


export const globalErrorHandler = async (err: any, req: Request, res: Response, next: NextFunction) => {
    if (envVars.NODE_ENV === 'development') {
        console.error('Global Error Handler:', err);
    }

    await deleteUploadedFilesFromGlobalErrorHandler(req);

    let errorSources: IErrorSource[] = [];
    let statusCode: number = status.INTERNAL_SERVER_ERROR;
    let message: string = 'Internal Server Error';
    let stack: string | undefined = undefined;

    if (err instanceof z.ZodError) {
        const zodErrorResponse = zodErrorHandler(err);
        statusCode = zodErrorResponse.statusCode as number;
        message = zodErrorResponse.message;
        errorSources = [...zodErrorResponse.errorSources];
        stack = err.stack;
    } else if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
        stack = err.stack;
        errorSources = [
            {
                path: '',
                message: err.message
            }
        ]
    } 
    else if (err instanceof Error) {
        message = err.message;
        statusCode = status.INTERNAL_SERVER_ERROR;
        stack = err.stack
    }

    const errorResponse: IErrorResponse = {
        success: false,
        message,
        errorSources,
        stack: envVars.NODE_ENV === 'development' ? stack : undefined,
        error: envVars.NODE_ENV === 'development' ? err : undefined
    };

    res.status(statusCode).json(errorResponse);
}