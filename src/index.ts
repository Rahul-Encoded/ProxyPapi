import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({
    path: './.env',
});

const app = express();

// Enable CORS
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*', // Fallback to '*' if CORS_ORIGIN is not set
    credentials: true,
}));

// Parse JSON request bodies
app.use(express.json({
    limit: "16kb", // Adjust the limit as needed
}));

// Test route
app.get('/', (req, res) => {
    res.status(200).send("Welcome to the ProxyPapi");
});

//routes import
import userRouter from "./routes/user.routes"


// Add routes
app.use("/api/v1/user", userRouter)

// Port and database URI
const port = process.env.PORT || 8000;
const db = process.env.MONGODB_URI;

if (!db) {
    console.error("MONGODB_URI is not defined in the .env file.");
    process.exit(1);
}

// Connect to MongoDB
mongoose
    .connect(db)
    .then(() => {
        console.log("App connected to database.");
        app.listen(port, () => {
            console.log(`App is listening on port ${port}`);
        });
    })
    .catch((error) => {
        console.error("Database connection error:", error.message);
        process.exit(1);
    });