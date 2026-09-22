import mongoose from "mongoose";
import { config } from './config/config.js';
import app from './app.js';

const startServer = async () => {
    try {
        await mongoose.connect(config.mongodb.uri);
        console.log("Connected to DB!");

        const port = 3000;

        app.get('/health', (req, res) => {
            res.send('Hello World');
        });

        app.listen(port, () => {
            console.log(`Connected successfully on port ${port}`)
        });
    } catch (error) {
        console.log("Failed to start server!", error);
        process.exit(1);
    }
}

startServer();