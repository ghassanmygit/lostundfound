const express = require("express");
const laporanController = require("../controllers/laporanController");
const { uploadFotoBarang } = require("../utils/upload");
const { requireAuth, requireRole } = require("../utils/authMiddleware");

const router = express.Router();

router.post(
  "/temuan",
  requireAuth,
  uploadFotoBarang,
  laporanController.createLaporanTemuan,
);
router.post(
  "/hilang",
  requireAuth,
  requireRole("civitas"),
  laporanController.createLaporanHilang,
);
router.get("/saya", requireAuth, laporanController.getLaporanSaya);

module.exports = router;
