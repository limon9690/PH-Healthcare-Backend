import status from "http-status";
import AppError from "../errorHelpers/AppError";

interface IEnvVariables {
  NODE_ENV: string;
  PORT: string;
  DATABASE_URL: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
}

const setEnvVars = () : IEnvVariables => {
    const envVariables = [
    'NODE_ENV',
    'PORT',
    'DATABASE_URL',
    'BETTER_AUTH_SECRET',
    'BETTER_AUTH_URL',  
    ]

    envVariables.forEach((varName) => {
        if (!process.env[varName]) {
            throw new AppError(status.INTERNAL_SERVER_ERROR, `Environment variable ${varName} is not set`);
        }
    })

  return {
    NODE_ENV: process.env.NODE_ENV as string,
    PORT: process.env.PORT as string,
    DATABASE_URL: process.env.DATABASE_URL as string,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET as string,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL as string,
  }
}

export const envVars: IEnvVariables = setEnvVars();