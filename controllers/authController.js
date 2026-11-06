const authService = require("../services/authService");

const registrasi = async (req, res) => {
  const pengguna = await authService.registrasi(req.body);
  res.status(201).json({
    success: true,
    message: "Registrasi berhasil. Silakan verifikasi email Anda",
    data: pengguna,
  });
};

const verifikasiEmail = async (req, res) => {
  await authService.verifikasiEmail(req.query.token);
  res.json({ success: true, message: "Akun berhasil diaktifkan. Silakan login" });
};

const login = async (req, res) => {
  const hasil = await authService.login(req.body);
  res.json({ success: true, message: "Login berhasil", data: hasil });
};

const profilSaya = (req, res) => {
  res.json({ success: true, data: req.user });
};

module.exports = { registrasi, verifikasiEmail, login, profilSaya };
