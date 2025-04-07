"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adduser = void 0;
const crypto_1 = __importDefault(require("crypto"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const asyncHandler_1 = require("../utils/asyncHandler");
const User_models_1 = __importDefault(require("../models/User.models"));
exports.adduser = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ error: "Email is required" });
    }
    // Check if user already exists
    const existingUser = yield User_models_1.default.findOne({ email });
    if (existingUser) {
        return res.status(409).json({ error: "User already registered" });
    }
    // Generate a unique API key
    const apiKey = crypto_1.default.randomBytes(16).toString("hex");
    // Hash the API key before storing it
    const apiKeyHash = yield bcrypt_1.default.hash(apiKey, 10);
    // Save user to the database
    const newUser = new User_models_1.default({ email, apiKeyHash });
    yield newUser.save();
    res.status(201).json({ apiKey }); // Return the plain API key to the user
}));
