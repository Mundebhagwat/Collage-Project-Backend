// controllers/adminController.js
const User = require("../model/userSchema");

// Get all users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}, "-password").sort({ createdAt: -1 }); // Exclude password
        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Server error while fetching users." });
    }
};

// // Admin: Block or Unblock a user
// const toggleBlockUser = async (req, res) => {
//     try {
//         const adminId = req.user.id; // assuming authentication middleware sets this
//         const { userId } = req.params;
//         const { block, reason } = req.body;

//         // Prevent admin from blocking themselves
//         if (userId === adminId) {
//             return res.status(400).json({ message: "Admins cannot block themselves." });
//         }

//         const user = await User.findById(userId);

//         if (!user) {
//             return res.status(404).json({ message: "User not found." });
//         }

//         if (block) {
//             if (user.blocked) {
//                 return res.status(400).json({ message: "User is already blocked." });
//             }

//             user.blocked = true;
//             user.blockReason = reason || "Blocked by admin";
//         } else {
//             if (!user.blocked) {
//                 return res.status(400).json({ message: "User is not currently blocked." });
//             }

//             user.blocked = false;
//             user.blockReason = "";
//         }

//         await user.save();

//         res.status(200).json({
//             message: `User has been ${block ? "blocked" : "unblocked"} successfully.`,
//             userId: user._id,
//             blocked: user.blocked,
//             blockReason: user.blockReason,
//         });

//     } catch (error) {
//         console.error("Error in toggleBlockUser:", error);
//         res.status(500).json({ message: "Internal server error." });
//     }
// };

const toggleBlockUser = async (req, res) => {
    try {
        const adminId = req.user.id;
        const { userId } = req.params;
        const { block, reason } = req.body;

        // Prevent admin from blocking themselves
        if (userId === adminId) {
            return res.status(400).json({ message: "Admins cannot block themselves." });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        if (block && user.blocked) {
            return res.status(400).json({ message: "User is already blocked." });
        }

        if (!block && !user.blocked) {
            return res.status(400).json({ message: "User is not currently blocked." });
        }

        //Use update directly to avoid full schema validation
        const updated = await User.findByIdAndUpdate(
            userId,
            {
                $set: {
                    blocked: block,
                    blockReason: block ? (reason || "Blocked by admin") : ""
                }
            },
            { new: true } // returns the updated doc
        );

        res.status(200).json({
            message: `User has been ${block ? "blocked" : "unblocked"} successfully.`,
            userId: updated._id,
            blocked: updated.blocked,
            blockReason: updated.blockReason,
        });

    } catch (error) {
        console.error("Error in toggleBlockUser:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};



const verifyUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { verified } = req.body;

        // Optional: check if the request comes from an Admin
        if (!req.user || req.user.role !== "Admin") {
            return res.status(403).json({ message: "Access denied. Admins only." });
        }

        // Find user
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found." });

        // Update verification status
        user.adminApproved = !!verified;
        await user.save();

        return res.status(200).json({
            message: `User ${verified ? "verified" : "unverified"} successfully.`,
            userId: user._id,
            adminApproved: user.adminApproved,
        });
    } catch (err) {
        console.error("Verification error:", err);
        return res.status(500).json({ message: "Server error. Please try again." });
    }
};

module.exports = {
    getAllUsers,
    toggleBlockUser,
    verifyUser,
};
