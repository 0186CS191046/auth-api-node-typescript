import type {Request,Response,NextFunction} from 'express';
import jwt from 'jsonwebtoken';
import {config} from '../config/config.js';

export interface AuthRequest extends Request {
    userId?:string
}

export const authenticateToken = async(req:AuthRequest,res:Response, next:NextFunction)=>{
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if(!token){
        return res.status(401).json({message:'Authentication token is required'});
    }
    try {
        const decoded = jwt.verify(token, config.jwt.secret) as unknown as {userId:string};
        req.userId = decoded.userId;
        next();
    } catch (error) {
        return res.status(403).json({message:'Invalid or expired token'});
    }
}