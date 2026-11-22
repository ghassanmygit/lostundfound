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
    req.file,
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

const tandaiHilangDitemukan = async (req, res) => {
  const laporan = await laporanService.tandaiHilangDitemukan(
    req.user.idPengguna,
    req.params.id,
  );
  res.json({
    success: true,
    message: "Laporan ditandai sudah ketemu",
    data: laporan,
  });
};

module.exports = {
  createLaporanTemuan,
  createLaporanHilang,
  getLaporanSaya,
  tandaiHilangDitemukan,
};
