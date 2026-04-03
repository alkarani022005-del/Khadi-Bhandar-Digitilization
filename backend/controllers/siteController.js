const Banner = require('../models/Banner');
const Category = require('../models/Category');
const SiteSettings = require('../models/SiteSettings');

// ── BANNERS ──
const getBanners = async (req, res) => {
  try {
    const banners = await Banner.find({ isActive: true }).sort({ order: 1 });
    res.json(banners);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ order: 1 });
    res.json(banners);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const createBanner = async (req, res) => {
  try {
    const banner = await Banner.create({
      ...req.body,
      image: req.file ? req.file.path : req.body.image,
    });
    res.status(201).json(banner);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

const updateBanner = async (req, res) => {
  try {
    const update = { ...req.body };
    if (req.file) update.image = req.file.path;
    const banner = await Banner.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(banner);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

const deleteBanner = async (req, res) => {
  try {
    await Banner.findByIdAndDelete(req.params.id);
    res.json({ message: 'Banner deleted' });
  } catch (err) { res.status(400).json({ message: err.message }); }
};

// ── CATEGORIES ──
const getCategories = async (req, res) => {
  try {
    const cats = await Category.find({ isActive: true }).sort({ order: 1 });
    res.json(cats);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getAllCategories = async (req, res) => {
  try {
    const cats = await Category.find().sort({ order: 1 });
    res.json(cats);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const createCategory = async (req, res) => {
  try {
    const cat = await Category.create({
      ...req.body,
      image: req.file ? req.file.path : req.body.image,
    });
    res.status(201).json(cat);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

const updateCategory = async (req, res) => {
  try {
    const update = { ...req.body };
    if (req.file) update.image = req.file.path;
    const cat = await Category.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(cat);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

const deleteCategory = async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category deleted' });
  } catch (err) { res.status(400).json({ message: err.message }); }
};

// ── SITE SETTINGS ──
const getSettings = async (req, res) => {
  try {
    const settings = await SiteSettings.find();
    const obj = {};
    settings.forEach(s => { obj[s.key] = s.value; });
    res.json(obj);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const updateSetting = async (req, res) => {
  try {
    const { key, value } = req.body;
    const setting = await SiteSettings.findOneAndUpdate(
      { key },
      { key, value },
      { new: true, upsert: true }
    );
    res.json(setting);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

module.exports = {
  getBanners, getAllBanners, createBanner, updateBanner, deleteBanner,
  getCategories, getAllCategories, createCategory, updateCategory, deleteCategory,
  getSettings, updateSetting,
};