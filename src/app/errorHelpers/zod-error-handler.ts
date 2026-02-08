import status from "http-status";
import z from "zod";
import { IErrorResponse, IErrorSource } from "../interfaces/error.interface";

export const zodErrorHandler = (err: z.ZodError) => {
    const statusCode = status.BAD_REQUEST;
    const message = 'Zod Validation Error';

    const errorSources : IErrorSource[] = [];

    err.issues.forEach((issue) => {
        errorSources.push({
            path: issue.path.join('=>'),
            message: issue.message
        });
    });

    return {
        statusCode,
        message,
        errorSources,
        error: err
    };
}