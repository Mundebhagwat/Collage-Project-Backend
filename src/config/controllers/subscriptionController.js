const User = require('../model/userSchema');

const upgradeToPremium = async (req, res) => {
    const userId = req.user.id;

    try {
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                membership: 'premium',
                membershipExpiry: null, // or add expiry logic
            },
            {
                new: true,             // return updated user
                runValidators: false,  // skip required field validation
            }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json({
            message: 'Upgraded to premium successfully',
            user: updatedUser,
        });
    } catch (err) {
        console.error('Upgrade failed:', err);
        return res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    upgradeToPremium,
}
