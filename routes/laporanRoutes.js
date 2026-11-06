const express = require("express");
const laporanController = require("../controllers/laporanController");
const { uploadFotoBarang } = require("../utils/upload");
const { requireAuth } = require("../utils/authMiddleware");

const router = express.Router();

router.post(
  "/temuan",
  requireAuth,
  uploadFotoBarang,
  laporanController.createLaporanTemuan,
);

module.exports = router;
