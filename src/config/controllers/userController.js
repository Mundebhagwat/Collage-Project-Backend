const User = require("../model/userSchema");
const mongoose = require("mongoose");


// Get All Users (Admin Only)
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get Any User (Admin Only)
const getAnyUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update user profile
const updatedUser = async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id, // user ID from auth middleware
            { $set: req.body },
            { new: true }
        );
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: "Error updating profile" });
    }
};

// Delete user account
const deleteUserlogged = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.user.id);
        res.status(200).json({ message: "Account deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting account" });
    }
};


// Delete User (Admin Only)
const deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// update prefernces 
const updatePartnerPreferences = async (req, res) => {
    try {
        const userId = req.user.id; // Extracted from auth middleware
        const { minAge, maxAge, preferredReligion, preferredCaste, location, preferredGender, education, occupation } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                $set: {
                    "partnerPreferences.minAge": minAge,
                    "partnerPreferences.maxAge": maxAge,
                    "partnerPreferences.preferredReligion": preferredReligion,
                    "partnerPreferences.preferredCaste": preferredCaste,
                    "partnerPreferences.location": location,
                    "partnerPreferences.preferredGender": preferredGender,
                    "partnerPreferences.education": education,
                    "partnerPreferences.occupation": occupation,
                }
            },
            { new: true } // Return updated user
        );

        if (!updatedUser) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({ message: "Partner preferences updated successfully", user: updatedUser });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
};

const getShortlistedProfiles = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized: No user ID found." });
        }

        // Verify the user exists first
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Populate shortlisted profiles with specific fields
        const populatedUser = await User.findById(userId).populate({
            path: 'shortlistedProfiles',
            select: 'fullName profilePicture age location'
        });

        res.json({
            totalShortlisted: populatedUser.shortlistedProfiles.length,
            profiles: populatedUser.shortlistedProfiles
        });
    } catch (error) {
        console.error("❌ Error in getShortlistedProfiles:", error);
        res.status(500).json({
            message: "Error fetching shortlisted profiles",
            error: error.message
        });
    }
};


const getPotentialMatches = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Find users who match at least one preference
        const matches = await User.find({
            _id: { $ne: req.user.id }, // Exclude self
            $or: [
                { gender: user.partnerPreferences.preferredGender },
                { age: { $gte: user.partnerPreferences.minAge, $lte: user.partnerPreferences.maxAge } },
                { location: user.partnerPreferences.location },
                { religion: user.partnerPreferences.religion },
                { caste: user.partnerPreferences.caste }
            ]
        }).select("fullName profilePicture age location");

        res.json(matches);
    } catch (error) {
        res.status(500).json({ message: "Error fetching matches", error: error.message });
    }
};

const getLimitedUserDetails = (user) => ({
    _id: user._id,
    fullName: user.fullName,
    profilePicture: user.profilePicture,
    location: user.location,
    age: new Date().getFullYear() - new Date(user.dob).getFullYear(),
    bio: 'This profile has limited visibility due to privacy settings or membership restrictions.',
});

const getUserProfileById = async (req, res) => {
    try {
        const { profileId } = req.params;
        const viewerId = req.user.id; // from protect middleware

        const profileUser = await User.findById(profileId).lean();
        const viewerUser = await User.findById(viewerId).lean();

        if (!profileUser) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        const isProfilePublic = profileUser.privacy === 'public';
        const isViewerPremium = viewerUser.membership === 'premium';

        let responseUserData;

        if (isProfilePublic && isViewerPremium) {
            responseUserData = profileUser; // full details
        } else {
            responseUserData = getLimitedUserDetails(profileUser); // limited view in all other cases
        }

        return res.status(200).json(responseUserData);
    } catch (error) {
        console.error('Error fetching profile details:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// const updateProfilePrivacy = async (req, res) => {
//     try {
//         const userId = req.user.id;
//         const { privacy } = req.body;

//         const validOptions = ['public', 'private'];

//         if (!validOptions.includes(privacy)) {
//             return res.status(400).json({ message: 'Invalid privacy option' });
//         }

//         const user = await User.findById(userId);

//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         user.privacy = privacy;
//         await user.save();

//         return res.status(200).json({
//             message: `Privacy updated to ${privacy}`,
//             privacy: user.privacy,
//         });
//     } catch (error) {
//         console.error('Error updating profile privacy:', error);
//         return res.status(500).json({ message: 'Server error' });
//     }
// };

const updateProfilePrivacy = async (req, res) => {
    try {
        const userId = req.user.id;
        const { privacy } = req.body;

        const validOptions = ['public', 'private'];

        if (!validOptions.includes(privacy)) {
            return res.status(400).json({ message: 'Invalid privacy option' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await User.updateOne({ _id: userId }, { privacy });

        return res.status(200).json({
            message: `Privacy updated to ${privacy}`,
            privacy,
        });
    } catch (error) {
        console.error('Error updating profile privacy:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};




const sendRequest = async (req, res) => {
    try {
        const senderId = req.user.id;
        const receiverId = req.params.profileId;

        if (!mongoose.Types.ObjectId.isValid(receiverId)) {
            return res.status(400).json({ message: "Invalid profile ID" });
        }

        const sender = await User.findById(senderId);
        const receiver = await User.findById(receiverId);

        if (!sender || !receiver) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if request is already sent
        if (
            sender.sentRequests.some(id => id.equals(receiverId)) ||
            receiver.receivedRequests.some(id => id.equals(senderId))
        ) {
            return res.status(400).json({ message: "Request already sent" });
        }

        // Add to sender's sentRequests
        sender.sentRequests.push(receiverId);

        // Add to receiver's receivedRequests
        receiver.receivedRequests.push(senderId);

        await sender.save();
        await receiver.save();

        res.status(200).json({ message: "Connection request sent successfully!" });
    } catch (error) {
        console.error("🔴 Error sending request:", error);
        res.status(500).json({ message: "Error sending request", error: error.message });
    }
};


// Cancel Connection Request
const cancelRequest = async (req, res) => {
    try {
        const senderId = req.user.id;
        const receiverId = req.params.profileId;

        if (!mongoose.Types.ObjectId.isValid(receiverId)) {
            return res.status(400).json({ message: "Invalid profile ID" });
        }

        const sender = await User.findById(senderId);
        const receiver = await User.findById(receiverId);

        if (!receiver) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if request exists
        if (!sender.sentRequests.includes(receiverId) || !receiver.receivedRequests.includes(senderId)) {
            return res.status(400).json({ message: "No request found" });
        }

        // Remove from `sentRequests`
        await User.findByIdAndUpdate(senderId, { $pull: { sentRequests: receiverId } });

        // Remove from `receivedRequests`
        await User.findByIdAndUpdate(receiverId, { $pull: { receivedRequests: senderId } });

        res.status(200).json({ message: "Connection request canceled successfully!" });
    } catch (error) {
        console.error("🔴 Error canceling request:", error);
        res.status(500).json({ message: "Error canceling request", error: error.message });
    }
};

const getSentRequests = async (req, res) => {
    try {
        const userId = req.user.id; // Authenticated user

        const user = await User.findById(userId).select("sentRequests");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ sentRequests: user.sentRequests });
    } catch (error) {
        console.error("🔴 Error fetching sent requests:", error);
        res.status(500).json({ message: "Error fetching sent requests", error: error.message });
    }
};





module.exports = {
    getAllUsers,
    getAnyUser,
    updatedUser,
    deleteUser,
    deleteUserlogged,
    updatePartnerPreferences,
    getShortlistedProfiles,
    getPotentialMatches,
    sendRequest,
    cancelRequest,
    getSentRequests,
    getUserProfileById,
    updateProfilePrivacy,
}



