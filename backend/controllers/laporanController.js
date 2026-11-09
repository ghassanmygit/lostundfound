const laporanService = require("../services/laporanService");

const createLaporanTemuan = async (req, res) => {
  const laporan = await laporanService.createLaporanTemuan(
    req.user.idPengguna,
    req.body,
    req.file,
  );
  res.status(201).json({
    success: true,
    message: "Laporan temuan berhasil dibuat",
    data: laporan,
  });
};

const createLaporanHilang = async (req, res) => {
  const laporan = await laporanService.createLaporanHilang(
    req.user.idPengguna,
    req.body,
  );
  res.status(201).json({
    success: true,
    message: "Laporan barang hilang berhasil dibuat",
    data: laporan,
  });
};

const getLaporanSaya = async (req, res) => {
  const daftarLaporan = await laporanService.getLaporanSaya(
    req.user.idPengguna,
  );
  res.json({ success: true, data: daftarLaporan });
};

module.exports = { createLaporanTemuan, createLaporanHilang, getLaporanSaya };
