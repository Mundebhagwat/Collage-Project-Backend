const User = require("../model/userSchema");

const reportUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { reason } = req.body;

        // Validate input
        if (!reason?.trim()) {
            return res.status(400).json({ message: "Reason is required" });
        }

        if (userId === req.user.id) {
            return res.status(400).json({ message: "You cannot report yourself" });
        }

        const reportedUser = await User.findById(userId);
        if (!reportedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        const alreadyReported = reportedUser.reportedBy.some(
            (report) => report.userId.toString() === req.user.id
        );
        if (alreadyReported) {
            return res.status(400).json({ message: "You have already reported this user" });
        }

        // Push report into the 'reportedBy' array without full validation
        await User.findByIdAndUpdate(userId, {
            $push: {
                reportedBy: {
                    userId: req.user.id,
                    reason: reason.trim(),
                    reportedAt: new Date()
                }
            }
        });

        res.status(200).json({ message: "User reported successfully" });
    } catch (error) {
        console.error("Error reporting user:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// GET /api/report
const getAllReports = async (req, res) => {
    try {
        const reportedUsers = await User.find({ "reportedBy.0": { $exists: true } })
            .select("_id fullName email profilePicture reportedBy blocked blockReason")
            .populate("reportedBy.userId", "_id fullName profilePicture");

        const formatted = reportedUsers.map((user) => ({
            id: user._id,
            reportedUser: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                profilePicture: user.profilePicture,
            },
            reportedBy: user.reportedBy,
            status: user.blocked ? "blocked" : "pending",
            blockReason: user.blockReason || "",
        }));

        res.status(200).json(formatted);
    } catch (error) {
        console.error("Fetch Reports Error:", error);
        res.status(500).json({ message: "Failed to fetch reports." });
    }
};

// DELETE /api/report/:reportId
const dismissReport = async (req, res) => {
    try {
        const userId = req.params.reportId;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "Reported user not found." });

        // Clear the report array using atomic update
        await User.findByIdAndUpdate(userId, {
            $set: { reportedBy: [] }
        });

        res.status(200).json({ message: "Reports dismissed successfully." });
    } catch (error) {
        console.error("Dismiss Report Error:", error);
        res.status(500).json({ message: "Failed to dismiss reports." });
    }
};

module.exports = {
    reportUser,
    getAllReports,
    dismissReport,
};
