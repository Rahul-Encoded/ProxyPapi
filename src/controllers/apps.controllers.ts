import crypto from "crypto";
import { asyncHandler } from "../utils/asyncHandler.utils";
import App from "../models/App.models";
import { Request, Response } from "express";
import { IUser } from "../models/User.models";
import axios from "axios";
import { tokenBucketRateLimiter } from "../utils/rateLimiter.utils";
import { queueLengthGauge, requestCounter, requestDurationHistogram, tokenGauge } from "../utils/metrics.utils";

// Extend the Request type locally
interface CustomRequest extends Request {
  user?: IUser;
}

export const addApp = asyncHandler(
  async (req: CustomRequest, res: Response) => {
    const { name, baseURL, rateLimit, apiKeyInHeader, apiKeyInQuery } =
      req.body;

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
      apiKeyInHeader: apiKeyInHeader || false,
      apiKeyInQuery: apiKeyInQuery || false,
    });
    await newApp.save();

    res.status(201).json({ appId });
  }
);

export const proxyRequest = asyncHandler(async (req, res) => {
  const start = Date.now(); // Start timer for latency tracking
  const { appId } = req.params;

  // Find the app by appId
  const app = await App.findOne({ appId });

  if (!app) {
    requestCounter.inc({ status: "failure" }); // Increment failure counter
    return res.status(404).json({ error: "App not found" });
  }

  // Extract the target URL and API key handling configuration
  const { baseURL, apiKeyInHeader, apiKeyInQuery } = app;

  // Remove the `/api/v1/apps/apis/:appId` prefix from the original URL
  const basePath = `/api/v1/apps/apis/${appId}`;
  const targetPath = req.originalUrl.replace(basePath, "");

  // Construct the initial target URL
  let targetUrl = `${baseURL}${targetPath}`;

  // Prepare headers for the request
  const headers = Object.fromEntries(
    Object.entries(req.headers).filter(([_, value]) => typeof value === "string") as [string, string][]
  );
  delete headers["host"]; // Remove host header to avoid conflicts
  delete headers["content-length"]; // Let axios recalculate this

  // Extract the API key from the Authorization header
  let apiKey;
  if (req.headers["authorization"]) {
    apiKey = req.headers["authorization"].replace("Bearer ", "");
    console.log(
      "Extracted API Key:",
      apiKey.substring(0, 5) + "..." + apiKey.substring(apiKey.length - 5)
    );
  } else {
    requestCounter.inc({ status: "failure" }); // Increment failure counter
    return res.status(400).json({ error: "Authorization header is missing" });
  }

  // Add the API key based on the app's configuration
  if (apiKeyInHeader) {
    headers["Authorization"] = `Bearer ${apiKey}`;
  } else if (apiKeyInQuery) {
    const separator = targetUrl.includes("?") ? "&" : "?";
    targetUrl = `${targetUrl}${separator}key=${apiKey}`;
    delete headers["authorization"];
    delete headers["x-goog-api-key"];
  } else {
    console.warn("No API key handling configured for this app.");
  }

  console.log("Target URL:", targetUrl.replace(apiKey, "[REDACTED]")); // Log URL without exposing the API key
  console.log("Headers:", Object.keys(headers)); // Log header keys only for security
  console.log("Body structure:", req.body ? Object.keys(req.body) : "empty"); // Log body structure without revealing content

  // Prepare request details for rate limiting and queuing
  const requestDetails = {
    method: req.method,
    url: targetUrl,
    headers,
    body: req.body,
  };

  // Apply rate limiting
  const { allowed, remaining } = await tokenBucketRateLimiter(appId, app.rateLimit, requestDetails);

  // Update metrics
  tokenGauge.set({ appId }, remaining); // Track tokens remaining
  queueLengthGauge.set({ appId }, app.queue?.length || 0); // Track queue length

  if (!allowed) {
    requestCounter.inc({ status: "queued" }); // Increment queued counter
    return res.status(429).json({
      error: "Rate limit exceeded",
      message: "Your request has been queued and will be processed shortly.",
      remainingTokens: remaining,
    });
  }

  // Forward the request to the target API with SSL verification enabled
  try {
    console.log(`Making ${req.method} request to ${baseURL}...`);

    const response = await axios({
      method: req.method,
      url: targetUrl,
      headers,
      data: req.body,
      validateStatus: () => true, // Accept all status codes to handle API errors
    });

    const duration = (Date.now() - start) / 1000; // Calculate duration in seconds
    requestDurationHistogram.observe(duration); // Track request duration
    requestCounter.inc({ status: "success" }); // Increment success counter

    console.log("Response received with status:", response.status);
    res.status(response.status).json(response.data);
  } catch (error) {
    const duration = (Date.now() - start) / 1000; // Calculate duration in seconds
    requestDurationHistogram.observe(duration); // Track request duration
    requestCounter.inc({ status: "failure" }); // Increment failure counter

    if (axios.isAxiosError(error) && error.response) {
      console.error("API response status:", error.response.status);
      console.error("API response data:", error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: "Failed to forward request" });
    }
  }
});
export const getUserApps = asyncHandler(
  async (req: CustomRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized: User not found" });
    }

    const apps = await App.find({ userId: req.user._id }).select(
      "name baseURL rateLimit appId apiKeyInHeader apiKeyInQuery createdAt"
    );

    res.status(200).json({ apps });
  }
);

export const updateApp = asyncHandler(
  async (req: CustomRequest, res: Response) => {
    const { appId } = req.params;
    const { name, baseURL, rateLimit, apiKeyInHeader, apiKeyInQuery } =
      req.body;

    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized: User not found" });
    }

    const app = await App.findOne({ appId, userId: req.user._id });

    if (!app) {
      return res.status(404).json({ error: "App not found" });
    }

    if (name) app.name = name;
    if (baseURL) app.baseURL = baseURL;
    if (rateLimit) app.rateLimit = rateLimit;
    if (apiKeyInHeader !== undefined) app.apiKeyInHeader = apiKeyInHeader;
    if (apiKeyInQuery !== undefined) app.apiKeyInQuery = apiKeyInQuery;

    await app.save();

    res.status(200).json({
      message: "App updated successfully",
      app: {
        name: app.name,
        baseURL: app.baseURL,
        rateLimit: app.rateLimit,
        appId: app.appId,
        apiKeyInHeader: app.apiKeyInHeader,
        apiKeyInQuery: app.apiKeyInQuery,
      },
    });
  }
);

export const deleteApp = asyncHandler(
  async (req: CustomRequest, res: Response) => {
    const { appId } = req.params;

    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized: User not found" });
    }

    const app = await App.findOneAndDelete({ appId, userId: req.user._id });

    if (!app) {
      return res.status(404).json({ error: "App not found" });
    }

    res.status(200).json({ message: "App deleted successfully" });
  }
);
