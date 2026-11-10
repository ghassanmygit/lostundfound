const express = require("express");
const klaimController = require("../controllers/klaimController");
const validasiKlaimController = require("../controllers/validasiKlaimController");
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

router.get(
  "/pending",
  requireAuth,
  requireRole("satpam"),
  validasiKlaimController.getKlaimPending,
);
router.post(
  "/:id/setujui",
  requireAuth,
  requireRole("satpam"),
  validasiKlaimController.setujuiKlaim,
);
router.post(
  "/:id/tolak",
  requireAuth,
  requireRole("satpam"),
  validasiKlaimController.tolakKlaim,
);

module.exports = router;
