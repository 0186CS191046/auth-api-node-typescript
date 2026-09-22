
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import helmet from 'helmet';
import userRoutes from "./routes/user.route.js"
const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use('/api/users', userRoutes);

app.use((err:Error, req:express.Request, res:express.Response, next:express.NextFunction)=>{
    console.error(err.stack);
    res.status(500).json({status:'error',message:'Internal Server Error!'})
})

export default app;
