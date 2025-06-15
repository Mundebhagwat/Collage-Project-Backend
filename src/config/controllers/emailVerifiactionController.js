const jwt = require("jsonwebtoken");
const User = require("../model/userSchema");

const emailVerify = async (req, res) => {
    try {
        const { token } = req.query;
        // console.log("Received Token:", token);
        const decoded = jwt.verify(token, process.env.EMAIL_SECRET);

        await User.findByIdAndUpdate(decoded.userId, { isVerified: true });
        // res.json({ message: "Email verified successfully." });

        // Generate a new JWT token for immediate login
        const newToken = jwt.sign({ id: decoded.userId, role: decoded.role }, process.env.JWT_SECRET, { expiresIn: "1d" });

        // Redirect user to frontend with token as a query param
        res.redirect(`${process.env.FRONTEND_URL}/dashboard?token=${newToken}`);

    } catch (error) {
        console.error("JWT Verification Error:", error.message);

        if (error.name === "TokenExpiredError") {
            return res.redirect(`${process.env.FRONTEND_URL}/?error=token_expired`);
        }
        res.redirect(`${process.env.FRONTEND_URL}/?error=invalid_token`);
    }
};

module.exports = emailVerify;


