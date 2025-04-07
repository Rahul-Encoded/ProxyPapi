import { Router } from "express";
import { loginUser, registerUser } from "../controllers/user.controllers";

const router = Router();

// Register a new user and issue an API key
router.route("/register").post(registerUser);
router.route("/login").post(loginUser)

export default router;
