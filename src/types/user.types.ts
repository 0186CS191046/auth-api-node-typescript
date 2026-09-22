export interface IUser {
    _id : string;
    name : string;
    email : string;
    password : string;
    isVerified : boolean;
    resetPasswordToken? : string;
    resetPasswordExpiresIn? : Date | undefined;
    verificationToken? : string;
    verificationTokenExpiresIn? : Date | undefined;
    createdAt : Date;
    updatedAt : Date;
}

export interface IUserInput {
    name:string;
    email:string,
    password:string
}