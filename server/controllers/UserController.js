import mongoose from "mongoose";
import User from "../model/UserModel.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../config/utils.js";
import cloudinary from "../config/cloudinary.js";
import jsonwebToken from 'jsonwebtoken'

//signup a usser

export const signup=async(req,res)=>{
    const {fullName,email,password}=req.body;
    try{
        if(!fullName || !email || !password ){
            return res.json({success:false,message: "Missing details"})
        }
        const user=await User.findOne({email});
        if(user){
            return res.json({success:false,message: "Acc Already Exist"})
        }
        const salt =await bcrypt.genSalt(10)
        const hashedPassword=await bcrypt.hash(password,salt);

        const newUser = await User.create({
            fullName,email,password:hashedPassword
        });

        const token=generateToken(newUser._id)

        res.json({success:true,userData:newUser,token,message:"Account Created Successfullly"})
    }catch(error){
        console.log(error.message);
        return res.json({success:false,message: error.message})
    }
}
//controller to login a user
export const login =async(req,res) =>{
    try {
        console.log("Request body:", req.body); // Debug line
        if (!req.body) {
            return res.json({success: false, message: "No request body received"});
        }
        const{email ,password} = req.body;
        if (!email || !password) {
            return res.json({success: false, message: "Email and password are required"});
        }
        console.log("Searching for user with email:", email); // Debug line
        const userData =await User.findOne({email})
        
        if (!userData) {
            return res.json({success: false, message: "User not found"});
        }

        const isPasswordCorrect =await bcrypt.compare(password,userData.password);
        if(!isPasswordCorrect){
            return res.json({success:false,message:"Invalid Credentials"});
        }
         const token=generateToken(userData._id)

        res.json({success:true,userData,token,message:"Login Successfull"})
    } catch (error) {
        console.log(error.message);
        res.json({success:false,message:error.message})
    }
}
//controller to check if user is authenticated
export const checkAuth=(req,res)=>{
    res.json({success:true,user:req.user});
}

// Temporary route to list all users (remove this in production)
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}, {password: 0}); // Exclude password
        res.json({success: true, users});
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}

//controller to update user profile details
export const updateProfile= async(req,res)=>{
    try {
        const{profilePic, bio, fullName}=req.body;

        const userId = req.user._id;
        let updatedUser;

        if(!profilePic){
            updatedUser=await User.findByIdAndUpdate(userId,{bio,fullName},{new:true})
        }else{
            const upload=await cloudinary.uploader.upload(profilePic);

            updatedUser=await User.findByIdAndUpdate(userId,{profilePic:upload.secure_url,bio,fullName},{new:true})
        }
        res.json({success:true,user:updatedUser})
    } catch (error) {
        console.log(error.message);
        res.json({success:false,message:error.message})
    }
}