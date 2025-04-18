import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../utils/asyncHandler.utils";
import User, { IUser } from "../models/User.models";

// Extend the Request type locally
interface CustomRequest extends Request {
  user?: IUser;
}

export const authenticateApiKey = asyncHandler(
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const apiKey = req.headers["x-api-key"];

    if (!apiKey) {
      return res.status(401).json({ error: "API key is required" });
    }

    // Find user by API key hash
    const user = await User.findOne({});

    if (!user) {
      return res.status(401).json({ error: "Invalid API key" });
    }

    // Compare the incoming API key with the stored hash
    const isValid = await user.isMatching(apiKey as string);

    if (!isValid) {
      return res.status(401).json({ error: "Invalid API key" });
    }

    // Attach user to request object for further use
    req.user = user;
    next();
  }
);
