const penjemputanService = require("../services/penjemputanService");

const getDaftarPenjemputan = async (req, res) => {
  const daftarKlaim = await penjemputanService.getDaftarPenjemputan();
  res.json({ success: true, data: daftarKlaim });
};

const konfirmasiPenjemputan = async (req, res) => {
  const klaim = await penjemputanService.konfirmasiPenjemputan(req.params.id);
  res.json({
    success: true,
    message: "Barang telah diserahkan kepada pemilik dan loker dikosongkan",
    data: klaim,
  });
};

module.exports = { getDaftarPenjemputan, konfirmasiPenjemputan };
