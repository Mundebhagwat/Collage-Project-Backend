const Message = require("../model/Message");

// Fetch chat messages
const getMessages = async (req, res) => {
    try {
        const messages = await Message.find({ chatId: req.params.chatId }).sort({ timestamp: 1 });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: "Error fetching messages", error: error.message });
    }
};

// Send message 
const sendMessage = async (req, res) => {
    try {
        const { chatId, content } = req.body;
        const senderId = req.user.id;

        const message = new Message({ chatId, senderId, content });
        await message.save();

        res.status(201).json(message);
    } catch (error) {
        res.status(500).json({ message: "Error sending message", error: error.message });
    }
};

module.exports = { getMessages, sendMessage }


