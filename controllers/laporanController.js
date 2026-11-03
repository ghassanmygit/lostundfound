const laporanService = require("../services/laporanService");

const createLaporanTemuan = async (req, res) => {
  const laporan = await laporanService.createLaporanTemuan(req.body, req.file);
  res.status(201).json({
    success: true,
    message: "Laporan temuan berhasil dibuat",
    data: laporan,
  });
};

module.exports = { createLaporanTemuan };
