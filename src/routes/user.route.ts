import expres from "express";
import { validateRequest } from "../middlewares/validate.js";
import { forgotPasswordSchema, loginSchema, resetPasswordSchema, signupSchema } from "../validators/user.validator.js";
import { UserController } from "../controllers/user.controller.js";
const router = expres.Router();

router.post('/signup',validateRequest(signupSchema),UserController.signup);
router.post('/signin',validateRequest(loginSchema),UserController.signin);
router.get('/verify-email/:token',UserController.verifyEmail);
router.post('/forgot-password',validateRequest(forgotPasswordSchema),UserController.forgotPassword);
router.post('/reset-password/:token',validateRequest(resetPasswordSchema),UserController.resetPassword);

export default router;