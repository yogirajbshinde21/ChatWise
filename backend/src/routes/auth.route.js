// Filename is 'auth.route.js' instead of 'auth.js' to follow convinient convention.

import express from "express";
import { login, logout, signup } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", logout);

export default router;   // This becomes "authRoutes" (A Router object)