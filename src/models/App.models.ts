import mongoose, { Schema, Document } from "mongoose";

export interface IApp extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  baseURL: string;
  rateLimit: {
    strategy: string;
    maxRequests: number;
    windowMs: number;
  };
  appId: string;
  apiKeyInHeader?: boolean;
  apiKeyInQuery?: boolean;
  rateLimiterState?: {
    tokens: number; // Current number of tokens in the bucket
    lastRefill: number; // Timestamp of the last token refill
  };
  queue?: Array<{
    id: string; // Unique ID for the queued request
    timestamp: number; // Timestamp when the request was queued
    method: string; // HTTP method (e.g., GET, POST)
    url: string; // Target URL
    headers: Record<string, string>; // Request headers
    body: any; // Request body
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const AppSchema: Schema<IApp> = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    baseURL: { type: String, required: true },
    rateLimit: {
      strategy: { type: String, required: true },
      maxRequests: { type: Number, required: true },
      windowMs: { type: Number, required: true },
    },
    appId: { type: String, required: true, unique: true },
    apiKeyInHeader: { type: Boolean, default: false },
    apiKeyInQuery: { type: Boolean, default: false },
    rateLimiterState: {
      tokens: { type: Number, default: 1 }, // Default to 1 tokens
      lastRefill: { type: Number, default: Date.now }, // Default to current timestamp
    },
    queue: [
      {
        id: { type: String, required: true },
        timestamp: { type: Number, required: true },
        method: { type: String, required: true },
        url: { type: String, required: true },
        headers: { type: Map, of: String, required: true },
        body: { type: Schema.Types.Mixed, required: true },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IApp>("App", AppSchema);
