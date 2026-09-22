import mongoose, { Schema } from "mongoose";
import type { IUser } from "../types/user.types.js";

const userSchema = new Schema<IUser>({
    email: {
        type: String,
        required: true,
        unique: true,
        index: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    resetPasswordToken: String,
    resetPasswordExpiresIn: Date,
    isVerified: {
        type: Boolean,
        default: false,
    },
    verificationToken: String,
    verificationTokenExpiresIn: Date,
}, { timestamps: true });

const User = mongoose.model<IUser>("User", userSchema);

export default User;