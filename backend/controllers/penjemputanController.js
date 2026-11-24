const penjemputanService = require("../services/penjemputanService");

const getDaftarPenjemputan = async (req, res) => {
  const daftarKlaim = await penjemputanService.getDaftarPenjemputan();
  res.json({ success: true, data: daftarKlaim });
};

const konfirmasiPenjemputan = async (req, res) => {
  const klaim = await penjemputanService.konfirmasiPenjemputan(
    req.params.id,
    req.body,
  );
  res.json({
    success: true,
    message: "Barang telah diserahkan kepada pemilik dan loker dikosongkan",
    data: klaim,
  });
};

const getKandidatHilang = async (req, res) => {
  const kandidat = await penjemputanService.getKandidatHilang(req.params.id);
  res.json({ success: true, data: kandidat });
};

module.exports = {
  getDaftarPenjemputan,
  getKandidatHilang,
  konfirmasiPenjemputan,
};
