const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
    {
        // Personal information fields
        firstName: { type: String, required: true },
        middleName: { type: String },
        lastName: { type: String, required: true },
        fullName: { type: String }, // We'll keep this for backward compatibility
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        phone: { type: String, required: true },
        gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
        dateOfBirth: { type: Date, required: true },
        religion: { type: String, default: "Hindu" },
        caste: { type: String, required: true },
        rashi: { type: String },
        gothra: { type: String },

        // Basic information fields
        bloodGroup: { type: String, enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] },
        color: { type: String },
        height: { type: Number }, // in CM
        weight: { type: Number }, // in KG
        motherTongue: { type: String },

        // Career and education fields
        qualification: { type: String, enum: ["High School", "Diploma", "Bachelor's", "Master's", "Ph.D.", "Other"] },
        occupation: { type: String, required: true },
        annualIncome: { type: Number, required: true },

        // Address fields
        permanentAddress: { type: String, required: true },
        currentAddress: { type: String, required: true },
        location: { type: String }, // Keeping for backward compatibility

        // Other profile fields
        bio: { type: String, maxlength: 500 },
        profilePicture: { type: String }, // Cloudinary URL
        aadharCardPhoto: { type: String }, // New field for Aadhar card

        // Existing fields for app functionality
        partnerPreferences: {
            minAge: { type: Number },
            maxAge: { type: Number },
            preferredReligion: { type: String },
            preferredCaste: { type: String },
            location: { type: String },
            preferredGender: { type: String, enum: ["Male", "Female", "Other"] },
            education: { type: String },
            occupation: { type: String },
        },
        shortlistedProfiles: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        sentRequests: [
            {
                userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
                status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
            },
        ],
        receivedRequests: [
            {
                userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
                status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
            },
        ],
        role: { type: String, enum: ["User", "Premium", "Admin"], default: "User" },
        isVerified: { type: Boolean, default: false },
        adminApproved: { type: Boolean, default: false },
        blocked: { type: Boolean, default: false },
        blockReason: { type: String, default: '' },
        reportedBy: [
            {
                userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
                reason: String,
                reportedAt: { type: Date, default: Date.now },
            },
        ],
        membership: {
            type: String,
            enum: ['free', 'premium'],
            default: 'free',
        },
        membershipExpiry: {
            type: Date,
            default: null, // For optional expiry-based plans
        },
        privacy: {
            type: String,
            enum: ['public', 'private'],
            default: 'public',
        },

        // firebaseUid: { type: String, required: true },

    },
    { timestamps: true }
);

// Create a virtual property for fullName that concatenates firstName, middleName, and lastName
userSchema.virtual('computedFullName').get(function () {
    if (this.middleName) {
        return `${this.firstName} ${this.middleName} ${this.lastName}`;
    }
    return `${this.firstName} ${this.lastName}`;
});

// Pre-save middleware to set fullName based on firstName, middleName, and lastName
userSchema.pre('save', function (next) {
    if (this.firstName || this.lastName) {
        this.fullName = this.middleName
            ? `${this.firstName} ${this.middleName} ${this.lastName}`
            : `${this.firstName} ${this.lastName}`;
    }
    next();
});

const User = mongoose.model("User", userSchema);
module.exports = User;