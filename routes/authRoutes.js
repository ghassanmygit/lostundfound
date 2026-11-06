const express = require("express");
const authController = require("../controllers/authController");
const { requireAuth } = require("../utils/authMiddleware");

const router = express.Router();

router.post("/registrasi", authController.registrasi);
router.get("/verifikasi", authController.verifikasiEmail);
router.post("/login", authController.login);
router.get("/saya", requireAuth, authController.profilSaya);

module.exports = router;
