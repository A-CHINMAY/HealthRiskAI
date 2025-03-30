const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const dotenv = require("dotenv");
const mongoose = require('mongoose'); 

dotenv.config();

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            token = req.headers.authorization.split(" ")[1];
            console.log("JWT_SECRET:", process.env.JWT_SECRET); 
            console.log("Token:", token);


            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log("Decoded:", decoded); // 

            const objectId = new mongoose.Types.ObjectId(decoded.userId);

            req.user = await User.findById(objectId).select("-password");
            console.log("req.user:", req.user); 


            if (!req.user) { 
                return res.status(401).json({ message: "User not found" });
            }

            next();
        } catch (error) {
            console.error("JWT Verification Error:", error); 
            res.status(401).json({ message: "Not authorized, invalid token" });
            return;
        }
    } else {
        res.status(401).json({ message: "Not authorized, no token provided" });
        return;
    }
};

module.exports = { protect }; 