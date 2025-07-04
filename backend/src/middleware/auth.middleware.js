// For protectRoute function

import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

export const protectRoute = async (req,res,next) => {   // 'next' parameter refers to 'updateProfile' function in auth.route.js file

    try{
        const token = req.cookies.jwt;

        if(!token){
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

        next();   // Invoking 'updateProfile' function in auth.route.js file after authenticating user.


    } catch (error) {
        console.log("Error in protectRoute middleware: ", error.message);
        res.status(500).json({ message: "Internal Server Error "});
    }
};