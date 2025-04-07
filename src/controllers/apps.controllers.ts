import crypto from "crypto";
import { asyncHandler } from "../utils/asyncHandler";
import App from "../models/App.models";
import { Request, Response } from "express";
import { IUser } from "../models/User.models";

// Extend the Request type locally
interface CustomRequest extends Request {
  user?: IUser;
}

export const addApp = asyncHandler(async (req: CustomRequest, res: Response) => {
  const { name, baseURL, rateLimit } = req.body;

  if (!name || !baseURL || !rateLimit) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Generate a unique app ID
  const appId = `app_${crypto.randomBytes(8).toString("hex")}`;

  // Save app to the database
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized: User not found" });
  }

  const newApp = new App({
    userId: req.user._id,
    name,
    baseURL,
    rateLimit,
    appId,
  });
  await newApp.save();

  res.status(201).json({ appId });
});
