import crypto from "crypto";
import bcrypt from "bcrypt";
import { asyncHandler } from "../utils/asyncHandler";
import User from "../models/User.models";


export const adduser = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ error: "User already registered" });
  }

  // Generate a unique API key
  const apiKey = crypto.randomBytes(16).toString("hex");

  // Hash the API key before storing it
  const apiKeyHash = await bcrypt.hash(apiKey, 10);

  // Save user to the database
  const newUser = new User({ email, apiKeyHash });
  await newUser.save();

  res.status(201).json({ apiKey }); // Return the plain API key to the user
});
