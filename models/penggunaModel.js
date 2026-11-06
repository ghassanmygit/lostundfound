const db = require("../utils/db");

const selectFields = `id_pengguna AS idPengguna, nama, email,
  password_hash AS passwordHash, role, status_akun AS statusAkun,
  no_wa AS noWa`;

const insertPengguna = async ({
  nama,
  email,
  passwordHash,
  role,
  statusAkun,
  noWa,
  tokenVerifikasi,
}) => {
  const sql = `INSERT INTO pengguna
    (nama, email, password_hash, role, status_akun, no_wa, token_verifikasi)
    VALUES (?, ?, ?, ?, ?, ?, ?)`;
  const [result] = await db.execute(sql, [
    nama,
    email,
    passwordHash,
    role,
    statusAkun,
    noWa ?? null,
    tokenVerifikasi,
  ]);
  return result.insertId;
};

const findPenggunaByEmail = async (email) => {
  const sql = `SELECT ${selectFields} FROM pengguna WHERE email = ?`;
  const [rows] = await db.execute(sql, [email]);
  return rows[0] ?? null;
};

const findPenggunaByTokenVerifikasi = async (tokenVerifikasi) => {
  const sql = `SELECT ${selectFields} FROM pengguna WHERE token_verifikasi = ?`;
  const [rows] = await db.execute(sql, [tokenVerifikasi]);
  return rows[0] ?? null;
};

const aktifkanPengguna = async (idPengguna) => {
  const sql = `UPDATE pengguna SET status_akun = 'aktif', token_verifikasi = NULL
    WHERE id_pengguna = ?`;
  await db.execute(sql, [idPengguna]);
};

module.exports = {
  insertPengguna,
  findPenggunaByEmail,
  findPenggunaByTokenVerifikasi,
  aktifkanPengguna,
};
