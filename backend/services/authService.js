const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const penggunaModel = require("../models/penggunaModel");
const AppError = require("../utils/appError");
const { signToken } = require("../utils/token");
const { validateRegistrasi, validateLogin } = require("../utils/authValidators");

const roleDefault = "civitas";
const statusPending = "pending";
const statusAktif = "aktif";
const saltRounds = 10;

const buildTautanVerifikasi = (tokenVerifikasi) =>
  `${process.env.APP_BASE_URL}/api/auth/verifikasi?token=${tokenVerifikasi}`;

const registrasi = async (data) => {
  const { isValid, errors } = validateRegistrasi(data);
  if (!isValid) throw new AppError("Data registrasi tidak valid", 400, errors);

  const email = data.email.trim().toLowerCase();
  if (await penggunaModel.findPenggunaByEmail(email)) {
    throw new AppError("Akun dengan email ini sudah ada. Silakan login", 409);
  }

  const tokenVerifikasi = crypto.randomBytes(32).toString("hex");
  const idPengguna = await penggunaModel.insertPengguna({
    nama: data.nama.trim(),
    email,
    passwordHash: await bcrypt.hash(data.password, saltRounds),
    role: roleDefault,
    statusAkun: statusPending,
    noWa: data.noWa?.trim() || null,
    tokenVerifikasi,
  });

  // Simulasi pengiriman email: tautan dicetak di terminal server.
  // Ganti dengan nodemailer saat layanan email tersedia.
  console.log(`[VERIFIKASI] ${email}: ${buildTautanVerifikasi(tokenVerifikasi)}`);

  return { idPengguna, nama: data.nama.trim(), email, role: roleDefault, statusAkun: statusPending };
};

const verifikasiEmail = async (tokenVerifikasi) => {
  const tokenValid =
    typeof tokenVerifikasi === "string" && /^[a-f0-9]{64}$/.test(tokenVerifikasi);
  const pengguna = tokenValid
    ? await penggunaModel.findPenggunaByTokenVerifikasi(tokenVerifikasi)
    : null;
  if (!pengguna) {
    throw new AppError("Tautan verifikasi tidak valid atau sudah dipakai", 400);
  }

  await penggunaModel.aktifkanPengguna(pengguna.idPengguna);
};

const login = async (data) => {
  const { isValid, errors } = validateLogin(data);
  if (!isValid) throw new AppError("Data login tidak valid", 400, errors);

  const pengguna = await penggunaModel.findPenggunaByEmail(
    data.email.trim().toLowerCase(),
  );
  const passwordCocok = pengguna
    ? await bcrypt.compare(data.password, pengguna.passwordHash)
    : false;
  if (!passwordCocok) throw new AppError("Kredensial tidak valid", 401);

  if (pengguna.statusAkun !== statusAktif) {
    throw new AppError("Akun belum aktif. Verifikasi email Anda terlebih dahulu", 403);
  }

  const token = signToken({ idPengguna: pengguna.idPengguna, role: pengguna.role });
  return {
    token,
    pengguna: {
      idPengguna: pengguna.idPengguna,
      nama: pengguna.nama,
      email: pengguna.email,
      role: pengguna.role,
    },
  };
};

module.exports = { registrasi, verifikasiEmail, login };
