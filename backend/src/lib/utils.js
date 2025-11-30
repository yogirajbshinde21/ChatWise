import jwt from 'jsonwebtoken';

// For creating JWT token
export const generateToken = (userId, res) => {
    const token = jwt.sign({userId}, process.env.JWT_SECRET,{
        expiresIn: "7d"
    });

    const isProduction = process.env.NODE_ENV === "production";

    const cookieOptions = {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        httpOnly: true,
        sameSite: isProduction ? "none" : "strict",
        secure: isProduction,
        path: '/',
    };

    // Log for debugging
    if (isProduction) {
        console.log("🍪 Setting secure cookie for production");
        console.log("🍪 Cookie options:", cookieOptions);
    }

    // Set the cookie
    res.cookie("jwt", token, cookieOptions);

    // CRITICAL FIX: Also return token in response body as backup
    // This allows frontend to store in localStorage if cookies fail
    res.locals.token = token;

    console.log("🍪 Cookie set successfully");

    return token;

};