import jwt from 'jsonwebtoken';

// For creating JWT token
export const generateToken = (userId, res) => {
    const token = jwt.sign({userId}, process.env.JWT_SECRET,{
        expiresIn: "7d"
    });

    const cookieOptions = {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        secure: process.env.NODE_ENV === "production",
        path: '/',
        // Don't set domain - let browser handle it automatically for cross-origin
    };

    // Log for debugging
    if (process.env.NODE_ENV === "production") {
        console.log("🍪 Setting secure cookie for production");
        console.log("🍪 Cookie options:", cookieOptions);
    }

    res.cookie("jwt", token, cookieOptions);

    // Also set the token in a custom header as backup
    res.setHeader('X-Auth-Token', token);

    console.log("🍪 Cookie set successfully");

    return token;

};