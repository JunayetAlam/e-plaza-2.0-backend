import { NextFunction, Request, Response } from "express";

export const setMe = (req: Request, res: Response, next: NextFunction) => {
    req.me = true;
    next();
};