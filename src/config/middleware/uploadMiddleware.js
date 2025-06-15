const multer = require("multer");
const path = require("path");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
require("dotenv").config();

// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage Configuration (Cloudinary)
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "profile_pictures",
        format: async () => "png",
        public_id: (req, file) => `profile_${Date.now()}_${file.originalname}`,
    },
});

// Multer Middleware for Image Upload
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png/;
        const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimeType = fileTypes.test(file.mimetype);

        if (extName && mimeType) {
            return cb(null, true);
        }
        cb(new Error("Only images (JPG, JPEG, PNG) are allowed!"));
    },
});

module.exports = upload;
