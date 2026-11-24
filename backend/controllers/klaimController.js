const klaimService = require("../services/klaimService");

const createKlaim = async (req, res) => {
  const klaim = await klaimService.createKlaim(
    req.user.idPengguna,
    req.body,
    req.file,
  );
  res.status(201).json({
    success: true,
    message: "Klaim berhasil diajukan dan menunggu validasi Satpam",
    data: klaim,
  });
};

const getKlaimSaya = async (req, res) => {
  const daftarKlaim = await klaimService.getKlaimSaya(req.user.idPengguna);
  res.json({ success: true, data: daftarKlaim });
};

module.exports = { createKlaim, getKlaimSaya };
