// For protectRoute function

import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

export const protectRoute = async (req,res,next) => {   // 'next' parameter refers to 'updateProfile' function in auth.route.js file

    // Authentication logic

    try{
        // Try to get token from cookie first, then from Authorization header
        let token = req.cookies.jwt;
        
        // If no cookie, check Authorization header
        if (!token) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7); // Remove 'Bearer ' prefix
            }
        }

        // Debug logging for production troubleshooting
        if (process.env.NODE_ENV === "production") {
            console.log("🔐 Auth Check:", {
                hasToken: !!token,
                tokenSource: req.cookies.jwt ? 'cookie' : (req.headers.authorization ? 'header' : 'none'),
                hasCookies: !!req.cookies,
                cookieKeys: Object.keys(req.cookies),
                hasAuthHeader: !!req.headers.authorization,
                rawCookieHeader: req.headers.cookie,
                origin: req.get('origin'),
                referer: req.get('referer')
            });
        }

        if(!token){
            console.log("❌ No JWT token found in cookies or Authorization header");
            return res.status(401).json({ message: "Unauthorized - No Token Provided" });
        }

        const decoded = jwt.verify(token,process.env.JWT_SECRET);

        if(!decoded) {
            return res.status(401).json({ message: "Unauthorized - Invalid Token" });
        }

        const user = await User.findById(decoded.userId).select("-password");  // Selected everything from 'decoded' token except password.

        if(!user){
            return res.status(404).json({ message: "User not found" });
        }

        req.user = user;

        // If the user is authenticated:
         next();     // ✅ This will pass control to the next function (like your route handler)


    } catch (error) {
        console.log("Error in protectRoute middleware: ", error.message);
        res.status(500).json({ message: "Internal Server Error "});
    }
};