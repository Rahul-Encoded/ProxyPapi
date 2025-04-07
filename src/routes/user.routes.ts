import { Router } from "express";
import { adduser } from "../controllers/user.controllers";

const router = Router();

// Register a new user and issue an API key
router.route("/register").post(adduser);

export default router;
