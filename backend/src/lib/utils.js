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
    };

    // Add domain for production to allow cross-subdomain cookies
    if (process.env.NODE_ENV === "production") {
        // Don't set domain - let browser handle it automatically
        console.log("🍪 Setting secure cookie for production");
    }

    res.cookie("jwt", token, cookieOptions);

    console.log("🍪 Cookie set:", {
        sameSite: cookieOptions.sameSite,
        secure: cookieOptions.secure,
        httpOnly: cookieOptions.httpOnly
    });

    return token;

};