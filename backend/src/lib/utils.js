import jwt from 'jsonwebtoken';

// For creating JWT token
export const generateToken = (userId, res) => {
    const token = jwt.sign({userId}, process.env.JWT_SECRET,{
        expiresIn: "7d"
    });


    res.cookie("jwt", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000,  // connverted into milliseconds
        httpOnly: true,   //prevents XSS attacks cross-site scripting attacks
        sameSite: "strict",   // prevent CSRF attacks (Cross Site Request Forgery) attacks
        secure: process.env.NODE_ENV !== "development"
    });


    return token;

};