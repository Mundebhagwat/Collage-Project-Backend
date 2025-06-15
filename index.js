const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./src/config/config");
const { Server } = require("socket.io");
const http = require("http");
const userRoutes = require("./src/config/routes/userRoutes");
const authRoutes = require("./src/config/routes/authRoutes");
const matchProfilesRoutes = require("./src/config/routes/matchRoutes");
const requestRoutes = require("./src/config/routes/requestRoutes");
const emailVerifyRoutes = require("./src/config/routes/emailVerifyRoutes");
const messageRoutes = require("./src/config/routes/messageRoutes");
const adminRoutes = require("./src/config/routes/adminRoutes")
const reportRoutes = require("./src/config/routes/reportRoutes");
const subscriptionRoutes = require("./src/config/routes/subscriptionRoutes");
const checkPremium = require("./src/config/routes/checkPremiumRoutes");
const fileUpload = require("express-fileupload");

const app = express();
dotenv.config();
connectDB();

// middleware
// CORS Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(express.json({ limit: "10mb" }));
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/", // Needed for cloudinary
}));


// routes
app.get("/", (req, res) => {
    res.send("Matrimonial Backend is Running...");
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/match", matchProfilesRoutes);
app.use("/api/request", requestRoutes);
app.use("/api/emailverify", emailVerifyRoutes);
app.use("/api/message", messageRoutes)
app.use("/api/admin", adminRoutes);
app.use("/api/report", reportRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/chat", checkPremium);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

