"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config({
    path: "./.env",
});
const app = (0, express_1.default)();
// Enable CORS
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || "*", // Fallback to '*' if CORS_ORIGIN is not set
    credentials: true,
}));
// Parse JSON request bodies
app.use(express_1.default.json({
    limit: "16kb", // Adjust the limit as needed
}));
// Test route
app.get("/", (req, res) => {
    res.status(200).send("Welcome to the ProxyPapi");
});
//routes import
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const apps_routes_1 = __importDefault(require("./routes/apps.routes"));
// Add routes
app.use("/api/v1/user", user_routes_1.default);
app.use("/api/v1/apps", apps_routes_1.default);
// Port and database URI
const port = process.env.PORT || 8000;
const db = process.env.MONGODB_URI;
if (!db) {
    console.error("MONGODB_URI is not defined in the .env file.");
    process.exit(1);
}
// Connect to MongoDB
mongoose_1.default
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
