const User = require("../model/userSchema");

const getMatches = async (req, res) => {
    try {
        const { minAge, maxAge, preferredReligion, preferredCaste, location } = req.query;

        if (!minAge || !maxAge) {
            return res.status(400).json({ error: "Required fields: minAge and maxAge" });
        }

        // Get current user from DB using req.user.id
        const currentUser = await User.findById(req.user.id);
        if (!currentUser) return res.status(404).json({ error: "User not found" });

        // Determine opposite gender
        let targetGender = "";
        if (currentUser.gender.toLowerCase() === "male") targetGender = "female";
        else if (currentUser.gender.toLowerCase() === "female") targetGender = "male";
        else targetGender = "other";

        // Convert age range to date range
        const currentDate = new Date();
        const minDOB = new Date();
        minDOB.setFullYear(currentDate.getFullYear() - parseInt(maxAge, 10));
        const maxDOB = new Date();
        maxDOB.setFullYear(currentDate.getFullYear() - parseInt(minAge, 10));

        // Build query
        let query = {
            _id: { $ne: req.user.id }, // exclude current user
            gender: { $regex: new RegExp(`^${targetGender}$`, "i") },
            dateOfBirth: { $gte: minDOB, $lte: maxDOB }
        };

        if (preferredReligion) query.religion = { $regex: new RegExp(`^${preferredReligion}$`, "i") };
        if (preferredCaste) query.caste = { $regex: new RegExp(`^${preferredCaste}$`, "i") };
        if (location) query.location = { $regex: new RegExp(location.trim(), "i") };

        const matches = await User.find(query).select("-password").lean();

        const processedMatches = matches.map(user => ({
            ...user,
            age: new Date().getFullYear() - new Date(user.dateOfBirth).getFullYear(),
        }));

        res.status(200).json(processedMatches);
    } catch (error) {
        console.error("Error fetching matches:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = getMatches;

