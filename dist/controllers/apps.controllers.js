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
exports.addApp = void 0;
const crypto_1 = __importDefault(require("crypto"));
const asyncHandler_1 = require("../utils/asyncHandler");
const App_models_1 = __importDefault(require("../models/App.models"));
exports.addApp = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, baseURL, rateLimit } = req.body;
    if (!name || !baseURL || !rateLimit) {
        return res.status(400).json({ error: "Missing required fields" });
    }
    // Generate a unique app ID
    const appId = `app_${crypto_1.default.randomBytes(8).toString("hex")}`;
    // Save app to the database
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized: User not found" });
    }
    const newApp = new App_models_1.default({
        userId: req.user._id,
        name,
        baseURL,
        rateLimit,
        appId,
    });
    yield newApp.save();
    res.status(201).json({ appId });
}));
