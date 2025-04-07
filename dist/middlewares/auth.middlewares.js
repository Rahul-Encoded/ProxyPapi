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
exports.authenticateApiKey = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const User_models_1 = __importDefault(require("../models/User.models"));
exports.authenticateApiKey = (0, asyncHandler_1.asyncHandler)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const apiKey = req.headers["x-api-key"];
    if (!apiKey) {
        return res.status(401).json({ error: "API key is required" });
    }
    // Find user by API key hash
    const user = yield User_models_1.default.findOne({});
    if (!user) {
        return res.status(401).json({ error: "Invalid API key" });
    }
    // Compare the incoming API key with the stored hash
    const isValid = yield user.isMatching(apiKey);
    if (!isValid) {
        return res.status(401).json({ error: "Invalid API key" });
    }
    // Attach user to request object for further use
    req.user = user;
    next();
}));
