import { Router } from "express";
import { addApp } from "../controllers/apps.controllers";
import { authenticateApiKey } from "../middlewares/auth.middlewares";

const router = Router();

router
  .use(authenticateApiKey)
  .route("/register")
  .post(authenticateApiKey, addApp);

export default router;
