"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const apps_controllers_1 = require("../controllers/apps.controllers");
const auth_middlewares_1 = require("../middlewares/auth.middlewares");
const router = (0, express_1.Router)();
router
    .use(auth_middlewares_1.authenticateApiKey)
    .route("/register")
    .post(auth_middlewares_1.authenticateApiKey, apps_controllers_1.addApp);
exports.default = router;
