const admin = require('../services/firebaseAdmin'); // ✅ Import your admin setup
const User = require('../model/userSchema');

const upgradeToPremium = async (req, res) => {
    const userId = req.user.id;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // // ✅ Set custom claim
        // await admin.auth().setCustomUserClaims(user.firebaseUid, {
        //     membership: 'premium',
        // });

        // ✅ Update in MongoDB (optional, for reference)
        user.membership = 'premium';
        await user.save();

        res.status(200).json({ message: 'Upgraded to premium successfully' });
    } catch (err) {
        console.error('Upgrade to premium failed:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { upgradeToPremium };
