const Item = require("../models/Item");
const asyncHandler = require("../utils/asyncHandler");

const addItem = asyncHandler(async (req, res) => {
  const { itemName, category, description, estimatedValue } = req.body;
  if (!itemName || !category || !estimatedValue) {
    return res.status(400).json({ message: "itemName, category, estimatedValue are required" });
  }

  const images = (req.files || []).map((f) => f.path);

  const item = await Item.create({
    userId: req.user._id,
    itemName,
    category,
    description,
    estimatedValue,
    images
  });

  res.status(201).json(item);
});

const getUserItems = asyncHandler(async (req, res) => {
  const items = await Item.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json(items);
});

const getAllItems = asyncHandler(async (req, res) => {
  const items = await Item.find().populate("userId", "name email phone").sort({ createdAt: -1 });
  res.json(items);
});

const updateStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!status || !["approved", "rejected"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const item = await Item.findByIdAndUpdate(id, { status }, { new: true });
  if (!item) return res.status(404).json({ message: "Item not found" });

  res.json(item);
});
const publicGetAllItems = asyncHandler(async (req, res) => {
  const items = await Item.find().populate("userId", "name email phone").sort({ createdAt: -1 });
  res.json(items);
});

module.exports = { addItem, getUserItems, getAllItems, updateStatus, publicGetAllItems };
