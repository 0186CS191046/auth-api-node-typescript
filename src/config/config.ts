import dotenv from "dotenv";
import path from "path";
import type { SignOptions } from "jsonwebtoken";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({path:path.join(__dirname,'../../.env')});

export const config = {
    port : process.env.PORT,
    mongodb : {
        uri : process.env.MONGODB_URI || 'mongodb://localhost:27017/'
    },
    jwt : {
        secret : process.env.JWT_SECRET || 'default-secret-key',
        expiresIn : process.env.JWT_EXPIRES_IN as SignOptions["expiresIn"] || '1h'
    },
    bcrypt:{
        saltRound : process.env.SALT_ROUND || 10
    },
    email : {
        host : process.env.EMAIL_HOST,
        port : process.env.EMAIL_PORT,
        user : process.env.EMAIL_USER,
        pass : process.env.EMAIL_PASS
    },
    frontend :{
        uri : process.env.FRONTEND_URL
    }
}