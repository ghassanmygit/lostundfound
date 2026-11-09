const db = require("../utils/db");

const selectFields = `id_laporan AS idLaporan, id_pelapor AS idPengguna,
  jenis_laporan AS jenisLaporan, nama_barang AS namaBarang, kategori,
  deskripsi, lokasi_penitipan AS lokasiPenitipan,
  lokasi_terakhir AS lokasiTerakhir, kontak, tanggal,
  foto_barang AS fotoBarang, status`;

const insertLaporan = async ({
  idPengguna,
  jenisLaporan,
  namaBarang,
  kategori,
  deskripsi,
  lokasiPenitipan,
  lokasiTerakhir,
  kontak,
  fotoBarang,
  status,
}) => {
  const sql = `INSERT INTO laporan
    (id_pelapor, jenis_laporan, nama_barang, kategori, deskripsi,
     lokasi_penitipan, lokasi_terakhir, kontak, tanggal, foto_barang, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?)`;
  const [result] = await db.execute(sql, [
    idPengguna,
    jenisLaporan,
    namaBarang,
    kategori,
    deskripsi ?? null,
    lokasiPenitipan ?? null,
    lokasiTerakhir ?? null,
    kontak ?? null,
    fotoBarang ?? null,
    status,
  ]);
  return result.insertId;
};

const findLaporanById = async (idLaporan) => {
  const sql = `SELECT ${selectFields} FROM laporan WHERE id_laporan = ?`;
  const [rows] = await db.execute(sql, [idLaporan]);
  return rows[0] ?? null;
};

const findLaporanByPelapor = async (idPengguna) => {
  const sql = `SELECT ${selectFields} FROM laporan
    WHERE id_pelapor = ? ORDER BY tanggal DESC, id_laporan DESC`;
  const [rows] = await db.execute(sql, [idPengguna]);
  return rows;
};

module.exports = { insertLaporan, findLaporanById, findLaporanByPelapor };
