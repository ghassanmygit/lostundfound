const express = require("express");
const klaimController = require("../controllers/klaimController");
const { uploadFotoBukti } = require("../utils/upload");
const { requireAuth, requireRole } = require("../utils/authMiddleware");

const router = express.Router();

router.post(
  "/",
  requireAuth,
  requireRole("civitas"),
  uploadFotoBukti,
  klaimController.createKlaim,
);
router.get("/saya", requireAuth, klaimController.getKlaimSaya);

module.exports = router;
