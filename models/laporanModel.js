const db = require("../utils/db");

const insertLaporan = async ({
  idPengguna,
  jenisLaporan,
  namaBarang,
  kategori,
  deskripsi,
  lokasiPenitipan,
  fotoBarang,
  status,
}) => {
  const sql = `INSERT INTO laporan
    (id_pelapor, jenis_laporan, nama_barang, kategori, deskripsi, lokasi_penitipan, tanggal, foto_barang, status)
    VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, ?)`;
  const [result] = await db.execute(sql, [
    idPengguna,
    jenisLaporan,
    namaBarang,
    kategori,
    deskripsi ?? null,
    lokasiPenitipan,
    fotoBarang,
    status,
  ]);
  return result.insertId;
};

const findLaporanById = async (idLaporan) => {
  const sql = `SELECT id_laporan AS idLaporan, id_pelapor AS idPengguna,
    jenis_laporan AS jenisLaporan, nama_barang AS namaBarang, kategori,
    deskripsi, lokasi_penitipan AS lokasiPenitipan, tanggal, foto_barang AS fotoBarang, status
    FROM laporan WHERE id_laporan = ?`;
  const [rows] = await db.execute(sql, [idLaporan]);
  return rows[0] ?? null;
};

module.exports = { insertLaporan, findLaporanById };
