import crypto from "crypto";
import { asyncHandler } from "../utils/asyncHandler";
import App from "../models/App.models";
import { Request, Response } from "express";
import { IUser } from "../models/User.models";
import axios from "axios";

// Extend the Request type locally
interface CustomRequest extends Request {
  user?: IUser;
}

export const addApp = asyncHandler(
  async (req: CustomRequest, res: Response) => {
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
  }
);

export const proxyRequest = asyncHandler(async (req, res) => {
  const { appId } = req.params;

  // Find the app by appId
  const app = await App.findOne({ appId });

  if (!app) {
    return res.status(404).json({ error: "App not found" });
  }

  // Extract the target URL
  const { baseURL } = app;
  const targetUrl = `${baseURL}${req.originalUrl.replace(
    `/apis/${appId}`,
    ""
  )}`;

  // Forward the request to the target API
  try {
    const response = await axios({
      method: req.method,
      url: targetUrl,
      headers: req.headers,
      data: req.body,
    });

    // Return the target API's response to the client
    res.status(response.status).json(response.data);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error forwarding request:", error.message);
    } else {
      console.error("Error forwarding request:", error);
    }

    if (axios.isAxiosError(error) && error.response) {
      // Forward the target API's error response to the client
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: "Failed to forward request" });
    }
  }
});
