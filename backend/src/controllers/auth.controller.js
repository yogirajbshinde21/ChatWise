import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

export const signup = async (req,res) => {
    // res.send("Signup route");

    // When you want to fetch data from user:
    const {fullName, email, password } = req.body;

    try {

        // All fields are required (validation)
        if(!fullName || !email || !password) {
             return res.status(400).json({message: "All fields are required."});
        }
        // hash passwords using bcryptjs
        if(password.length < 6){
            return res.status(400).json({message: "Password must be at least 6 characters."});
        }

        // Find the user with the specified email...
        const user = await User.findOne({email});
        // If user exists...
        if (user) {
            return res.status(400).json({ message: "Email already exists!" });
        }

        // If user doesn't exists already (i.e. it is a new user)...

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);

        const newUser = new User({
            fullName: fullName,
            email:email,
            password: hashedPassword
        });


        if(newUser){
            // generate jwt token here
            generateToken(newUser._id,res)
            await newUser.save();

            res.status(201).json({
                _id:newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                profilePic: newUser.profilePic,
            });

        } else {
            res.status(400).json({message: "Invalid user data" });
        }


    } catch (error) {
        console.log("Error in singup controller",error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const login = (req,res) => {
    res.send("Login route");
}

export const logout = (req,res) => {
    res.send("Logout route");
}