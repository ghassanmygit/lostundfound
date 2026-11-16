require("dotenv").config();
const bcrypt = require("bcryptjs");
const db = require("../utils/db");
const penggunaModel = require("../models/penggunaModel");

const saltRounds = 10;
const minPasswordLength = 8;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const main = async () => {
  const [nama, emailInput, password] = process.argv.slice(2);

  if (!nama || !emailInput || !password) {
    console.error(
      'Pemakaian: node scripts/buatSatpam.js "Nama" email password',
    );
    return 1;
  }
  const email = emailInput.trim().toLowerCase();
  if (!emailPattern.test(email)) {
    console.error("Format email tidak valid");
    return 1;
  }
  if (password.length < minPasswordLength) {
    console.error(`Kata sandi minimal ${minPasswordLength} karakter`);
    return 1;
  }
  if (await penggunaModel.findPenggunaByEmail(email)) {
    console.error("Email sudah terdaftar");
    return 1;
  }

  const idPengguna = await penggunaModel.insertPengguna({
    nama: nama.trim(),
    email,
    passwordHash: await bcrypt.hash(password, saltRounds),
    role: "satpam",
    statusAkun: "aktif",
    noWa: null,
    tokenVerifikasi: null,
  });
  console.log(`Akun satpam dibuat. id_pengguna=${idPengguna}, email=${email}`);
  return 0;
};

main()
  .then((code) => {
    process.exitCode = code;
  })
  .catch((err) => {
    console.error("Gagal membuat akun satpam:", err.message);
    process.exitCode = 1;
  })
  .finally(() => db.end());
