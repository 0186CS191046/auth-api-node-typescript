import type { Response } from 'express';

export class CustomeError extends Error {
    public statusCode: number;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        Object.setPrototypeOf(this,CustomeError.prototype)

    }
}

export const createCustomError = (message:string,statusCode:number)=>{
    return new CustomeError(message, statusCode);
}

export const handleControllerError = (error:unknown,res:Response)=>{
    if(error instanceof CustomeError){
        return res.status(error.statusCode).json({status:'error', message:error.message})
    }
    console.error("Unexpected Error :", error);
    return res.status(500).json({status:'error', message:'Internal Server Error'})
}