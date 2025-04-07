"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controllers_1 = require("../controllers/user.controllers");
const router = (0, express_1.Router)();
// Register a new user and issue an API key
router.route("/register").post(user_controllers_1.adduser);
exports.default = router;
