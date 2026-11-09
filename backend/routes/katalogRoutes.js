const express = require("express");
const katalogController = require("../controllers/katalogController");
const { requireAuth } = require("../utils/authMiddleware");

const router = express.Router();

router.get("/", requireAuth, katalogController.getKatalog);
router.get("/:id", requireAuth, katalogController.getDetailKatalog);

module.exports = router;
