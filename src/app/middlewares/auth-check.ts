import { NextFunction, Request, Response } from "express";
import { Role, UserStatus } from "../../generated/prisma/enums";
import { CookieUtils } from "../utils/cookie";
import { prisma } from "../lib/prisma";
import AppError from "../errorHelpers/AppError";
import status from "http-status";
import { jwtUtils } from "../utils/jwt";
import { envVars } from "../config/env";

export const checkAuth = (...authRoles: Role[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const sessionToken = CookieUtils.getCookie(req, 'better-auth.session_token');
            if (!sessionToken) {
                throw new AppError(status.UNAUTHORIZED, 'Unauthorized: No session token provided');
            }

            if (sessionToken) {
                const sessionExists = await prisma.session.findFirst({
                    where: {
                        token: sessionToken,
                        expiresAt: {gt: new Date()}
                    },
                    include: {
                        user: true
                    }
                })

                if (sessionExists && sessionExists.user) {
                    const user = sessionExists.user;

                    const now = new Date();
                    const expiresAt = new Date(sessionExists.expiresAt);
                    const createdAt = new Date(sessionExists.createdAt);

                    const sessionLifeTime = expiresAt.getTime() - createdAt.getTime();
                    const timeRemaining = expiresAt.getTime() - now.getTime();
                    const percentageRemaining = (timeRemaining / sessionLifeTime) * 100;

                    if (percentageRemaining < 20) {
                        res.setHeader('X-Session-Refresh', 'true');
                        res.setHeader('X-Session-Expires-At', expiresAt.toISOString());
                        res.setHeader('X-Session-Time-Remaining', timeRemaining.toString());   
                    }

                    if (user.status === UserStatus.BLOCKED || user.status === UserStatus.DELETED) {
                        throw new AppError(status.FORBIDDEN, 'Forbidden: User is not active');
                    }

                    if (user.isDeleted) {
                        throw new AppError(status.FORBIDDEN, 'Forbidden: User is deleted');
                    }

                    if (authRoles.length > 0 && !authRoles.includes(user.role)) {
                        throw new AppError(status.FORBIDDEN, 'Forbidden: You do not have enough permissions to access this resource');
                    }
                }

            }

            const accessToken = CookieUtils.getCookie(req, 'accessToken');
            if (!accessToken) {
                throw new AppError(status.UNAUTHORIZED, 'Unauthorized: No access token provided');
            }

            const verifiedToken = jwtUtils.verifyToken(accessToken, envVars.ACCESS_TOKEN_SECRET);
            if (!verifiedToken) {
                throw new AppError(status.UNAUTHORIZED, 'Unauthorized: Invalid access token');
            }

            if (!verifiedToken.success) {
                throw new AppError(status.UNAUTHORIZED, 'Unauthorized: ' + verifiedToken.message);
            }

            if (authRoles.length > 0 && !authRoles.includes(verifiedToken.data?.role)) {
                throw new AppError(status.FORBIDDEN, 'Forbidden: You do not have enough permissions to access this resource');
            }

            next();
        } catch (error: any) {
            next(error);
        }
    }
}