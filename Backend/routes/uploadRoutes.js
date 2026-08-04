import express from "express";
import dotenv from "dotenv";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { protect, admin } from "../middleware/authMiddleware.js";

dotenv.config();

const router = express.Router();

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  throw new Error(
    "Missing Cloudinary environment variables. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
  );
}

// 1. Configure Cloudinary
cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

// 2. Configure Storage Engine
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "ecommerce_products",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 1000, height: 1000, crop: "limit" }],
  },
});

const upload = multer({ storage });

// 3. Upload Endpoint
router.post("/", protect, admin, (req, res, next) => {
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "file", maxCount: 1 },
  ])(req, res, (err) => {
    if (err) {
      console.error("Cloudinary/Multer Error Detail:", err);
      res.status(400);
      return next(err);
    }

    const uploadedFile = req.files?.image?.[0] ?? req.files?.file?.[0];

    if (!uploadedFile) {
      res.status(400);
      return next(
        new Error(
          "No image file provided. Use form-data field 'image' or 'file'.",
        ),
      );
    }

    res.status(200).json({
      message: "Image uploaded successfully",
      image: uploadedFile.path,
    });
  });
});

export default router;
