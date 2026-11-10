const express = require("express");
const klaimController = require("../controllers/klaimController");
const validasiKlaimController = require("../controllers/validasiKlaimController");
const penjemputanController = require("../controllers/penjemputanController");
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

router.get(
  "/disetujui",
  requireAuth,
  requireRole("satpam"),
  penjemputanController.getDaftarPenjemputan,
);
router.post(
  "/:id/serahkan",
  requireAuth,
  requireRole("satpam"),
  penjemputanController.konfirmasiPenjemputan,
);

module.exports = router;
