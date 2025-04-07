import { Router } from "express";
import { addApp, proxyRequest } from "../controllers/apps.controllers";
import { authenticateApiKey } from "../middlewares/auth.middlewares";

const router = Router();

router
  .route("/register")
  .post(authenticateApiKey, addApp);

router.use("/apis/:appId", authenticateApiKey, proxyRequest);


export default router;
