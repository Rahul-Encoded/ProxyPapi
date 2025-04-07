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
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IApp>("App", AppSchema);
