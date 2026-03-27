const express = require("express");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { cloudinary } = require("../config/cloudinary");
const auth = require("../middleware/auth");
const adminOnly = require("../middleware/admin");
const { addItem, getUserItems, getAllItems, updateStatus, publicGetAllItems } = require("../controllers/itemController");

const router = express.Router();

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "girvi/items",
    allowed_formats: ["jpg", "jpeg", "png", "webp"]
  }
});

const upload = multer({ storage });

router.post("/add", auth, upload.array("images", 5), addItem);
router.get("/user", auth, getUserItems);
router.get("/all", auth, adminOnly, getAllItems);
router.get("/public/all", publicGetAllItems);
router.put("/:id/status", auth, adminOnly, updateStatus);

module.exports = router;
