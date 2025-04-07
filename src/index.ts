import express, { Request, Response } from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";


dotenv.config({
	path: './.env' 
});

const app = express();

app.use(cors({
	origin: process.env.CORS_ORIGIN, 
	credentials: true,
}));

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
	console.log(req);
	return res.status(234).send("Welcome to the ProxyPapi");
});

const port = process.env.PORT || 8000
const db = process.env.MONGODB_URI

mongoose
	.connect(db)
	.then(() => {
		console.log("App connected to database.");
		app.listen(port, () => {
			console.log(`App is listening to port ${port}`);
		});
}).catch((error) => {
	console.log(error);
})