import cloudinary from "../lib/cloudinary.js";
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

export const login = async (req,res) => {
    // res.send("Login route");

    const { email, password } = req.body;
    try{
        // Search for the specified email...
        const user = await User.findOne({email});  // --> true, if email found in database. Else false.

        // If email not found in database...
        if(!user) {
            return res.status(400).json({message: "Invalid credentials"});
        }

        // if email found in database...
        // then check if password entered is correct
        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        // If entered password is not same as hashed password in database...
        if(!isPasswordCorrect){
             return res.status(400).json({message: "Invalid credentials"});
        }

        // If entered password is same as hashed password in database...
        generateToken(user._id, res);

        res.status(200).json({
            _id:user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic,
        });

    } catch (error) {
        console.log("Error in login controller",error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const logout = (req,res) => {
    // res.send("Logout route");

    try{
        res.cookie("jwt","",{maxAge:0});
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
         console.log("Error in logout controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const updateProfile = async(req, res) => {
    try{
        const {profilePic} = req.body;
        const userId = req.user._id; 

        if(!profilePic){
             return res.status(400).json({message: "Profile Pic is required"});
        }

        const uploadResponse = await cloudinary.uploader.upload(profilePic);
        const updatedUser = await User.findByIdAndUpdate(userId, {profilePic:uploadResponse.secure_url}, {new:true});

        res.status(200).json(updatedUser);

    } catch (error) {
        console.log("Error in updating profile: ", error.message);
        res.status(500).json({messgae: "internal Server Error" });
    }
};

export const checkAuth = (req, res) => {
    try{
        res.status(200).json(req.user);   // gives authenticated user
    } catch (error) {
         console.log("Error in checkAuth controller: ", error.message);
        res.status(500).json({messgae: "internal Server Error" });

    }
};