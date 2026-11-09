const express = require("express");
const laporanController = require("../controllers/laporanController");
const verifikasiController = require("../controllers/verifikasiController");
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
router.get(
  "/menunggu",
  requireAuth,
  requireRole("satpam"),
  verifikasiController.getDaftarMenunggu,
);
router.post(
  "/:id/verifikasi",
  requireAuth,
  requireRole("satpam"),
  verifikasiController.verifikasiLaporan,
);
router.post(
  "/:id/tolak",
  requireAuth,
  requireRole("satpam"),
  verifikasiController.tolakLaporan,
);

module.exports = router;
