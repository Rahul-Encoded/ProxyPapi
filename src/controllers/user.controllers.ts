import { Request, Response } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { asyncHandler } from "../utils/asyncHandler.utils";
import User from "../models/User.models";
import { sendEmail } from "../utils/sendEmail.utils";

// Register a new user
export const registerUser = asyncHandler(async (req: Request, res: Response) => {
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

  // Send the API key to the user's email
  const subject = "Your API Key for ProxyPapi";
  const text = `Thank you for registering with ProxyPapi! Your API key is:\n\n${apiKey}\n\nPlease keep it safe as it will be required for authentication.`;
  await sendEmail(email, subject, text);

  // Return a success message without exposing the API key
  res.status(201).json({ message: "Registration successful! Please check your email for the API key." });
});

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { apiKey } = req.body;

  if (!apiKey) {
    return res.status(400).json({ error: "API key is required" });
  }

  // Find the user by API key hash
  const user = await User.findOne({});

  if (!user) {
    return res.status(404).json({ error: "Invalid API key" });
  }

  // Compare the incoming API key with the stored hash
  const isValid = await bcrypt.compare(apiKey, user.apiKeyHash);

  if (!isValid) {
    return res.status(401).json({ error: "Invalid API key" });
  }

  // Return a success message
  res.status(200).json({ message: "Login successful!" });
});