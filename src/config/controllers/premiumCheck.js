const User = require('../model/userSchema');
const { firestore, admin } = require("../services/firebaseAdmin");

const checkPremium = async (req, res) => {
    try {
        const userId = req.user.id;
        const { chatId, message } = req.body;

        if (!chatId || !message || !message.trim()) {
            return res.status(400).json({ error: 'Missing chatId or message' });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        // // Check if the user has a valid membership status
        // if (!user || !user.membership || user.membership !== 'premium') {
        //     return res.status(403).json({ error: 'Upgrade to premium to send messages' });
        // }

        // Premium users: unlimited messages
        if (user.membership === 'premium') {
            return res.status(200).json({ allowed: true });
        }

        // Free users: check how many messages sent today in this chat
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const startTimestamp = admin.firestore.Timestamp.fromDate(startOfToday);

        const messagesRef = firestore
            .collection('chats')
            .doc(chatId)
            .collection('messages');

        const snapshot = await messagesRef
            .where('senderId', '==', userId)
            .where('createdAt', '>=', startTimestamp)
            .get();

        const messagesSentToday = snapshot.size;

        if (messagesSentToday >= 5) {
            return res.status(403).json({ error: 'Daily limit reached. Upgrade to premium to send more messages.' });
        }

        return res.status(200).json({ success: true, allowed: true, remaining: 5 - messagesSentToday });

        // // Premium verified
        // return res.status(200).json({ success: true, message: 'Allowed' });
    } catch (error) {
        console.error('[CHECK PREMIUM ERROR]', error.message);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    checkPremium,
}
