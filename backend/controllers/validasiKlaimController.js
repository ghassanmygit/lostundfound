const validasiKlaimService = require("../services/validasiKlaimService");

const getKlaimPending = async (req, res) => {
  const daftarKlaim = await validasiKlaimService.getKlaimPending();
  res.json({ success: true, data: daftarKlaim });
};

const setujuiKlaim = async (req, res) => {
  const klaim = await validasiKlaimService.setujuiKlaim(
    req.user.idPengguna,
    req.params.id,
  );
  res.json({
    success: true,
    message: "Klaim disetujui. Barang siap diambil oleh pengaju",
    data: klaim,
  });
};

const tolakKlaim = async (req, res) => {
  const klaim = await validasiKlaimService.tolakKlaim(
    req.user.idPengguna,
    req.params.id,
    req.body,
  );
  res.json({ success: true, message: "Klaim ditolak", data: klaim });
};

module.exports = { getKlaimPending, setujuiKlaim, tolakKlaim };
