const User = require("../model/userSchema");

// ✅ Shortlist a user (No changes needed)
const shortlistProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (!user.shortlistedProfiles.includes(req.params.id)) {
            user.shortlistedProfiles.push(req.params.id);
            await user.save();
        }

        res.status(200).json({ message: "Profile shortlisted!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ Send a connection request (Updated)
const sendRequest = async (req, res) => {
    try {
        const sender = await User.findById(req.user.id);
        const receiver = await User.findById(req.params.id);

        if (!receiver) return res.status(404).json({ message: "User not found" });

        // Check if request already exists
        const existingRequest = sender.sentRequests.find(req => req.userId.toString() === receiver.id);

        if (!existingRequest) {
            sender.sentRequests.push({ userId: receiver.id, status: "pending" });
            receiver.receivedRequests.push({ userId: sender.id, status: "pending" });

            await sender.save();
            await receiver.save();
        }

        res.status(200).json({ message: "Request sent!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ Accept a request (Updated)
const acceptRequest = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const sender = await User.findById(req.params.id);

        if (!sender) return res.status(404).json({ message: "User not found" });

        // Update request status to "accepted"
        const receivedRequest = user.receivedRequests.find(req => req.userId.toString() === sender.id);
        if (receivedRequest) receivedRequest.status = "accepted";

        const sentRequest = sender.sentRequests.find(req => req.userId.toString() === user.id);
        if (sentRequest) sentRequest.status = "accepted";

        await user.save();
        await sender.save();

        res.status(200).json({ message: "Request accepted!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ Reject a request (New function)
const rejectRequest = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const sender = await User.findById(req.params.id);

        if (!sender) return res.status(404).json({ message: "User not found" });

        // Update request status to "rejected"
        const receivedRequest = user.receivedRequests.find(req => req.userId.toString() === sender.id);
        if (receivedRequest) receivedRequest.status = "rejected";

        const sentRequest = sender.sentRequests.find(req => req.userId.toString() === user.id);
        if (sentRequest) sentRequest.status = "rejected";

        await user.save();
        await sender.save();

        res.status(200).json({ message: "Request rejected!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ Get all connection requests (New function)
const getConnectionRequests = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .populate({
                path: "receivedRequests",
                populate: { path: "userId", select: "fullName profilePicture location" } // Ensure proper population
            });

        if (!user) return res.status(404).json({ message: "User not found" });

        res.status(200).json({ requests: user.receivedRequests });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


module.exports = { shortlistProfile, sendRequest, acceptRequest, rejectRequest, getConnectionRequests };
