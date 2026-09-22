import User from "../models/user.model.js";
import type { Request, Response } from "express";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from "../config/config.js";
import type { IUserInput } from "../types/user.types.js";
import { createCustomError } from "../utils/error.js";
import { EmailService } from "../services/email.service.js";
import crypto from 'crypto';
import { error } from "console";
import { success } from "zod";

export class UserController {
    static async signup(req: Request, res: Response): Promise<void> {
        try {
            const { name, email, password }: IUserInput = req.body;
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                res.status(400).json({ status: 'error', message: "User already exists with this email!" });
                return;
            }

            const isEmailServiceWorking = await EmailService.verifyConnection();
            if (!isEmailServiceWorking) {
                res.status(500).json({ status: 'error', message: "Email Service is not working, please try again later!" });
                return;
            }

            const verificationToken = crypto.randomBytes(32).toString('hex');
            const hashedPassword = await bcrypt.hash(password, config.bcrypt.saltRound);

            const user = await User.create({
                name, email, password: hashedPassword, verificationToken,
                verificationTokenExpiresIn: new Date(Date.now() + 24 * 60 * 60 * 1000)  // 24 hours
            })
            try {
                await EmailService.sendVerificationEmail(email, name, verificationToken);
                res.status(201).json({
                    status: 'success',
                    message: 'Registration successful. Please check your email to verify your account.',
                });
            } catch (emailError) {
                console.error("Failed to send verification email", emailError);
                await User.findByIdAndUpdate(user._id, { $set: { emailVerificationFailed: true } });
                res.status(201).json({
                    status: 'warning',
                    message: 'Account created but verification email could not be sent. Please contact support.',
                    userId: user._id
                });
            }

        } catch (error) {
            console.error("Signup Error : ", error);
            res.status(500).json({
                status: 'error',
                message: 'Internal server error',
            });
        }
    }

    static async signin(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;
            const isExistingUser = await User.findOne({ email });
            if (!isExistingUser) {
                res.status(401).json({ status: 'error', message: "Invalid credentials!" })
                return;
            }
            if (isExistingUser.isVerified != true) {
                res.status(401).json({ status: 'error', message: "Please Verify your email!" });
                return;
            }
            const isPasswordValid = await bcrypt.compare(password, isExistingUser.password);
            if (!isPasswordValid) {
                res.status(401).json({ status: 'error', message: "Invalid Credentials!" });
                return;
            }
            const token = jwt.sign({ userId: isExistingUser._id }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
            res.status(200).json({
                status: 'success', data: {
                    token, user: {
                        id: isExistingUser._id,
                        name: isExistingUser.name,
                        email: isExistingUser.email,
                    }
                }
            })
        } catch (error) {
            res.status(500).json({
                status: "error",
                message: "Internal server error",
            });
        }
    }

    static async verifyEmail(req: Request, res: Response): Promise<void> {
        try {
            const { token } = req.params;
            if (typeof token !== "string") {
                res.status(400).json({
                    message: "Invalid verification token"
                });
                return;
            }
            const user = await User.findOne({ verificationToken: token, verificationTokenExpiresIn: { $gt: new Date() } });

            if (!user) {
                res.status(400).json({
                    status: "error",
                    message: "Invalid or expired verification token",
                });
                return;
            }
            user.isVerified = true;
            user.verificationToken = "";
            user.verificationTokenExpiresIn = undefined;

            await user.save();
            res.json({
                status: "success",
                message: "Email verified successfully",
            });
        } catch (error) {
            res.status(500).json({
                status: "error",
                message: "Internal server error",
            });
        }
    }

    static async forgotPassword(req: Request, res: Response): Promise<void> {
        try {
            console.log("forgotPasswordforgotPasswordforgotPasswordforgotPassword");
            
            const { email } = req.body;
            const user = await User.findOne({ email });
            if (!user) {
                res.status(400).json({ status: 'error', message: 'No account found with this email!' })
                return;
            }
            const isEmailServiceWorking = await EmailService.verifyConnection();
            if (!isEmailServiceWorking) {
                res.status(500).json({ status: 'error', message: "Email Service is not working, please try again later!" });
                return;
            }

            const resetToken = crypto.randomBytes(32).toString('hex');
            user.resetPasswordToken = resetToken;
            user.resetPasswordExpiresIn = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
            await user.save();

            try {
                await EmailService.sendPasswordResetEmail(email, user.name, resetToken);
                res.json({
                    status: 'success',
                    message: 'Password reset instructions sent to your email',
                });
                return;
            } catch (error) {
                console.error("Failed to send password reset email : ", error);
                user.resetPasswordToken = "";
                user.resetPasswordExpiresIn = undefined;
                await user.save();
                res.json({
                    status: 'error',
                    message: 'Failed to send password reset email. Please try again later!'
                });
                return;
            }
        } catch (error) {
            console.error('Forgot password error:', error);
            res.status(500).json({
                status: "error",
                message: "Internal server error",
            });
        }
    }

    static async resetPassword(req: Request, res: Response): Promise<void> {
        try {
            const { token } = req.params;
            const { password } = req.body;
            if (typeof token !== "string") {
                res.status(400).json({
                    message: "Invalid verification token"
                });
                return;
            }
            const user = await User.findOne({
                resetPasswordToken: token,
                resetPasswordExpiresIn: { $gt: new Date() },
            });

            if (!user) {
                res.status(400).json({
                    status: "error",
                    message: "Invalid or expired reset token",
                });
                return;
            }

            const hashedPassword = await bcrypt.hash(password, config.bcrypt.saltRound);
            user.password = hashedPassword;
            user.resetPasswordToken = "";
            user.resetPasswordExpiresIn = undefined;
            await user.save();

            res.json({
                status: "success",
                message: "Password reset successfully",
            });
        } catch (error) {
            console.error('Reset password error:', error);
            res.status(500).json({
                status: "error",
                message: "Internal server error",
            });
        }
    }
}