import { Router } from "express";
import { addApp } from "../controllers/apps.controllers";
import { authenticateApiKey } from "../middlewares/auth.middlewares";

const router = Router();

router
  .route("/register")
  .post(authenticateApiKey, addApp);

export default router;
