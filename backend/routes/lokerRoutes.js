const express = require("express");
const verifikasiController = require("../controllers/verifikasiController");
const { requireAuth, requireRole } = require("../utils/authMiddleware");

const router = express.Router();

router.get(
  "/kosong",
  requireAuth,
  requireRole("satpam"),
  verifikasiController.getLokerKosong,
);

module.exports = router;
