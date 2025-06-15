const mongoose = require("mongoose");
const User = require("../model/userSchema");


// updated shortlist code 
const shortlistProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const profileId = req.params.profileId;

        // console.log("user Id: " + userId + " profile Id: " + profileId);

        // Only fetch shortlistedProfiles field to check the status
        const user = await User.findById(userId).select("shortlistedProfiles");

        const isProfileInShortlist = user.shortlistedProfiles.includes(profileId);

        if (isProfileInShortlist) {
            // Remove from shortlist using $pull
            await User.findByIdAndUpdate(userId, {
                $pull: { shortlistedProfiles: profileId }
            });
            return res.json({
                message: "Profile removed from shortlist",
                isShortlisted: false
            });
        } else {
            // Add to shortlist using $addToSet (avoids duplicates)
            await User.findByIdAndUpdate(userId, {
                $addToSet: { shortlistedProfiles: profileId }
            });
            return res.json({
                message: "Profile added to shortlist",
                isShortlisted: true
            });
        }
    } catch (error) {
        console.error("Error in shortlistProfile:", error);
        res.status(500).json({ message: "Error updating shortlist", error });
    }
};


const checkShortlistStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const profileId = req.params.profileId;

        if (!mongoose.Types.ObjectId.isValid(profileId)) {
            return res.status(400).json({ message: "Invalid profile ID", isShortlisted: false });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found", isShortlisted: false });

        const profileObjectId = new mongoose.Types.ObjectId(profileId);
        const isShortlisted = user.shortlistedProfiles.some(id => id.toString() === profileObjectId.toString());

        return res.json({ isShortlisted });
    } catch (error) {
        console.error("🔴 Error checking shortlist status:", error);
        res.status(500).json({ message: "Server error", isShortlisted: false });
    }
};

module.exports = { shortlistProfile, checkShortlistStatus };
