import type {Request, Response, NextFunction} from 'express';
import type {ZodSchema} from "zod";

export const validateRequest = (schema:ZodSchema)=>{
    return async(req:Request,res:Response,next:NextFunction) : Promise<void> => {
        try {
            await schema.parseAsync(req.body);
            next();
        } catch (error) {
            if(error instanceof Error){
                res.status(500).json({status:'error',message:'Validation failed', 
                    errors:'errors' in error ? (error as any).errors : [error.message]})
                    return;
            }
            next(error);
        }
    }
}