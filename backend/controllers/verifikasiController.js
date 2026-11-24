const verifikasiService = require("../services/verifikasiService");

const getDaftarMenunggu = async (req, res) => {
  const daftarLaporan = await verifikasiService.getDaftarMenunggu();
  res.json({ success: true, data: daftarLaporan });
};

const getLokerKosong = async (req, res) => {
  const daftarLoker = await verifikasiService.getLokerKosong();
  res.json({ success: true, data: daftarLoker });
};

const verifikasiLaporan = async (req, res) => {
  const laporan = await verifikasiService.verifikasiLaporan(
    req.user.idPengguna,
    req.params.id,
    req.body,
  );
  res.json({
    success: true,
    message: "Laporan terverifikasi dan barang tersimpan di loker",
    data: laporan,
  });
};

const tolakLaporan = async (req, res) => {
  const laporan = await verifikasiService.tolakLaporan(req.params.id, req.body);
  res.json({ success: true, message: "Laporan ditolak", data: laporan });
};

module.exports = {
  getDaftarMenunggu,
  getLokerKosong,
  verifikasiLaporan,
  tolakLaporan,
};
