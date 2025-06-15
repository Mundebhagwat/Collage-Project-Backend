const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../model/userSchema");
const { generateVerificationToken } = require("../middleware/jwtAuthentiaction");
const { sendVerificationEmail } = require("../services/emailService");
const cloudinary = require("../utils/cloudinary");


// Create User (Signup)
const registerUser = async (req, res) => {
    try {
        const {
            firstName,
            middleName,
            lastName,
            email,
            password,
            phone,
            gender,
            dateOfBirth,
            religion,
            caste,
            rashi,
            gothra,
            bloodGroup,
            color,
            height,
            weight,
            motherTongue,
            qualification,
            occupation,
            annualIncome,
            permanentAddress,
            currentAddress,
            bio,
            profilePicture,
            aadharCardPhoto
        } = req.body;

        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }

        // Validate date of birth
        const currentDate = new Date();
        if (new Date(dateOfBirth) > currentDate) {
            return res.status(400).json({ message: "Invalid date of birth. Cannot be in the future." });
        }

        // Validate password
        if (!password || password.length < 3) {
            return res.status(400).json({ message: "Password must be at least 3 characters long" });
        }

        // Check for required profile picture
        if (!profilePicture) {
            return res.status(400).json({ message: "Profile picture is required" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate fullName from name components
        const fullName = middleName ?
            `${firstName} ${middleName} ${lastName}` :
            `${firstName} ${lastName}`;

        // Create new user with all fields
        const newUser = new User({
            firstName,
            middleName,
            lastName,
            fullName, // For backward compatibility
            email,
            password: hashedPassword,
            phone,
            gender,
            dateOfBirth,
            religion: religion || "Hindu", // Default to Hindu as shown in the form
            caste,
            rashi,
            gothra,
            bloodGroup,
            color,
            height: height ? Number(height) : undefined,
            weight: weight ? Number(weight) : undefined,
            motherTongue,
            qualification,
            occupation,
            annualIncome: annualIncome ? Number(annualIncome) : undefined,
            permanentAddress,
            currentAddress,
            location: permanentAddress, // For backward compatibility, using permanentAddress
            bio,
            profilePicture,
            aadharCardPhoto,
            role: "User", // Default to User role
        });

        await newUser.save();

        const token = generateVerificationToken(newUser._id, newUser.role);
        await sendVerificationEmail(newUser.email, token);

        res.status(201).json({
            message: "User registered successfully. Check email for verification.",
            userId: newUser._id
        });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};


// Login User
const loginUser = async (req, res) => {
    try {
        const { email, password, firebaseUID } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });


        if (!user.isVerified) {
            return res.status(403).json({ message: "Please verify your email before logging in." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        // // Save Firebase UID if not already present
        // if (!user.firebaseUid && firebaseUID) {
        //     user.firebaseUid = firebaseUID;
        //     await user.save();
        // }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
        res.status(200).json({ token, user });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get Logged-in User Profile
const getUserProfile = async (req, res) => {
    try {
        // const user = await User.findById(req.user.id);
        const user = await User.findById(req.user.id).select("-password -__v");
        if (!user) return res.status(404).json({ message: "User not found" });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const uploadProfilePicture = async (req, res) => {
    try {
        const file = req.files?.profilePicture;

        if (!file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(file.tempFilePath, {
            folder: "profile_pictures",
        });

        // Update user's profile picture in DB
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { profilePicture: result.secure_url },
            { new: true }
        ).select("-password");

        res.status(200).json({
            message: "Profile picture updated successfully",
            profilePicture: user.profilePicture,
        });

    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ error: "Server error while uploading profile picture" });
    }
};


module.exports = { registerUser, loginUser, getUserProfile, uploadProfilePicture };
