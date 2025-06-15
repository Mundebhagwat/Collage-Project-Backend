const User = require('../model/userSchema');

const requirePremium = async (req, res, next) => {
    const userId = req.user.id;

    try {
        const user = await User.findById(userId);

        if (!user || user.membership !== 'premium') {
            return res.status(403).json({ message: 'Premium membership required' });
        }

        next();
    } catch (error) {
        console.error('Premium check failed:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

module.exports = requirePremium;


// this is not in use now but keep here for feature use 
