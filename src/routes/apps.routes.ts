import { Router } from "express";
import { addApp, deleteApp, getUserApps, proxyRequest, updateApp } from "../controllers/apps.controllers";
import { authenticateApiKey } from "../middlewares/auth.middlewares";

const router = Router();

router.route("/register").post(authenticateApiKey, addApp);
router.route("/").get(authenticateApiKey, getUserApps);
router.route("/:appId").put(authenticateApiKey, updateApp);
router.route("/:appId").delete(authenticateApiKey, deleteApp);
router.use("/apis/:appId", authenticateApiKey, proxyRequest);



export default router;
