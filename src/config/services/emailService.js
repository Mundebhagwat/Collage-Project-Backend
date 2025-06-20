const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendVerificationEmail = async (email, token) => {
    const url = `https://collage-project-backend-j2vf.onrender.com/api/emailverify/verify-email?token=${token}`;
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Verify Your Email",
        html: `<p>Click <a href="${url}">here</a> to verify your email.</p>`,
    });
};

module.exports = { sendVerificationEmail };


