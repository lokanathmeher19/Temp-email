"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
router.post('/register', auth_controller_1.AuthController.register);
router.post('/login', auth_controller_1.AuthController.login);
router.post('/logout', auth_1.authenticate, auth_controller_1.AuthController.logout);
// Example protected route to get current user info
router.get('/me', auth_1.authenticate, (req, res) => {
    res.json({ success: true, user: req.user });
});
exports.default = router;
