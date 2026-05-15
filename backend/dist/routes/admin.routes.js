"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("../controllers/admin.controller");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
// Secure all routes with ADMIN role
router.use(auth_1.authenticate, (0, auth_1.requireRole)(['ADMIN']));
router.get('/stats', admin_controller_1.AdminController.getStats);
router.get('/users', admin_controller_1.AdminController.getUsers);
exports.default = router;
