import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcrypt";

export interface IUser extends Document {
  email: string;
  apiKeyHash: string;
  createdAt: Date;
  updatedAt: Date;
  isMatching(apiKey: string): Promise<boolean>;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    email: { type: String, required: true, unique: true },
    apiKeyHash: { type: String, required: true, unique: true },
  },
  {
    timestamps: true,
  }
);

UserSchema.methods.isMatching = async function (
  apiKey: string
): Promise<boolean> {
  return await bcrypt.compare(apiKey, this.apiKeyHash);
};

export default mongoose.model<IUser>("User", UserSchema);
