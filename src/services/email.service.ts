import nodemailer from "nodemailer";
import path from 'path';
import fs from 'fs/promises';
import { config } from '../config/config.js';
import { fileURLToPath } from "url";
import { Resend } from "resend";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class EmailService {
    // private static transporter = nodemailer.createTransport({
    //     service: 'gmail',
    //     auth: {
    //         user: config.email.user,
    //         pass: config.email.pass
    //     },
    //     debug: true,
    //     logger: true
    // })

    private static resend = new Resend(config.email.render_api_key);

    private static async getTemplate(templateName: string): Promise<string> {
        const templatePath = path.join(__dirname, '../templates', `${templateName}.html`);
        return await fs.readFile(templatePath, 'utf-8');
    }

    private static replaceTemplateVariables(template: string, variables: Record<string, string>): string {
        return Object.entries(variables).reduce((acc, [key, value]) => acc.replace(new RegExp(`{{${key}}`, 'g'), value),
            template)
    }

    static async verifyConnection(): Promise<boolean> {
        try {
            if (!config.email.render_api_key) {
                throw new Error("RESEND_API_KEY is not configured");
            }
            console.log('Resend API configuration verified successfully');
            return true;
        } catch (error) {
            console.error('SMTP connection verification failed:', error);
            return false;

        }
    }

    static async sendVerificationEmail(to: string,name: string,verificationToken: string): Promise<void> {
        try {
            const template = await this.getTemplate('verifyEmail');
            const verificationLink = `${config.frontend.uri}/verify-email?token=${verificationToken}`;

            const html = this.replaceTemplateVariables(template, {
                name,
                verificationLink,
            });

            const { data, error } = await this.resend.emails.send({
                from: config.email.from,
                to,
                subject: "Verify Your Email",
                html,
            });
            if (error) {
                console.error("Resend verification email error:", error);
                throw new Error(error.message);
            }

            console.log('Verification email sent successfully:', data?.id);
        } catch (error) {
            console.error('Error sending verification email:', error);
            throw new Error('Failed to send verification email');
        }
    }

    static async sendPasswordResetEmail( to: string,name: string,resetToken: string ): Promise<void> {
        try {
            const template = await this.getTemplate('resetPassword');
            const resetLink = `${config.frontend.uri}/reset-password?token=${resetToken}`;

            const html = this.replaceTemplateVariables(template, {
                name,
                resetLink,
            });

            const { data, error } = await this.resend.emails.send({
                from: config.email.from,
                to,
                subject: "Reset Your Password",
                html,
            });
            if (error) {
                console.error("Resend password reset email error:", error);
                throw new Error(error.message);
            }

            console.log('Password reset email sent successfully:', data?.id);
        } catch (error) {
            console.error('Error sending password reset email:', error);
            throw new Error('Failed to send password reset email');
        }
    }
}