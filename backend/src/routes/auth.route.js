// Filename is 'auth.route.js' instead of 'auth.js' to follow convenient convention.

import express from "express";
import { checkAuth, login, logout, signup, updateProfile } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";



const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);


// Only profile picture can be updated — not name or email.
router.put("/update-profile", protectRoute, updateProfile);  // 'protectRoute' ensures only logged-in users can update their profile.

// Checks if the user is still authenticated (used during page refresh).
// Example: If user is on the profile page and refreshes it...
// → If NOT authenticated → redirect to login page
// → If authenticated     → keep them on profile page
router.get("/check", protectRoute, checkAuth);




export default router;   // This becomes "authRoutes" (A Router object)