const express = require("express");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const router = express.Router();

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "chat-attachments",
    allowed_formats: ["jpg", "png", "jpeg", "pdf", "mp4", "doc", "docx"],
    public_id: (req, file) => `${Date.now()}-${file.originalname}`,
  },
});

const upload = multer({ storage });

router.post("/", upload.single("file"), (req, res) => {
  try {
    console.log("➡️ File Upload Attempt");

    if (!req.file) {
      console.log("❌ No file received");
      return res.status(400).json({ message: "No file uploaded" });
    }

    console.log("✅ File Uploaded to Cloudinary:", req.file);

    res.status(200).json({ url: req.file.path });
  } catch (error) {
    console.error("❌ Upload Failed:", error);
    res.status(500).json({ message: "Upload failed", error: error.message });
  }
});

module.exports = router;
