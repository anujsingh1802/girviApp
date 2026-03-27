const express = require("express");
const upload = require("../utils/upload");
const router = express.Router();

router.post("/", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  let url = req.file.path;
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    url = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  }

  res.status(200).json({
    message: "File uploaded successfully",
    url: url,
  });
});

module.exports = router;
