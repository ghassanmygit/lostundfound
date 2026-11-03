const express = require("express");
const laporanController = require("../controllers/laporanController");
const { uploadFotoBarang } = require("../utils/upload");

const router = express.Router();

router.post("/temuan", uploadFotoBarang, laporanController.createLaporanTemuan);

module.exports = router;
