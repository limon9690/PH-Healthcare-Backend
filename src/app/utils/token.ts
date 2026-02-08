import { JwtPayload, SignOptions } from "jsonwebtoken";
import { jwtUtils } from "./jwt";
import { envVars } from "../config/env";
import { Response } from "express";
import { CookieUtils } from "./cookie";
import ms, { StringValue } from "ms";

const getAccessToken = (payload : JwtPayload) => {
    const accessToken = jwtUtils.createToken(
        payload, 
        envVars.ACCESS_TOKEN_SECRET, 
        {expiresIn: envVars.ACCESS_TOKEN_EXPIRES_IN} as SignOptions
    );
    return accessToken;
}

const getRefreshToken = (payload : JwtPayload) => {
    const refreshToken = jwtUtils.createToken(
        payload, 
        envVars.REFRESH_TOKEN_SECRET, 
        {expiresIn: envVars.REFRESH_TOKEN_EXPIRES_IN} as SignOptions
    );
    return refreshToken;
}

const setAccessTokenInCookie = (res : Response, token : string) => {
    CookieUtils.setCookie(res, 'accessToken', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge : 60 * 60 * 60 * 24, // 1 day in milliseconds
        path: '/'
    });
}

const setRefreshTokenInCookie = (res : Response, token : string) => {
    CookieUtils.setCookie(res, 'refreshToken', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge : 60 * 60 * 60 * 24 * 7, // 1 week in milliseconds
        path: '/'
    });
}

const setBetterAuthTokenInCookie = (res : Response, token: string) => {
    CookieUtils.setCookie(res, 'better-auth.session_token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge : 60 * 60 * 60 * 24 , // 1 day in milliseconds
        path: '/'
    });
}

export const tokenUtils = {
    getAccessToken,
    getRefreshToken,
    setAccessTokenInCookie,
    setRefreshTokenInCookie,
    setBetterAuthTokenInCookie
}