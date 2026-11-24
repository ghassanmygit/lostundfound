const db = require("../utils/db");

const selectFields = `id_laporan AS idLaporan, id_pelapor AS idPengguna,
  jenis_laporan AS jenisLaporan, nama_barang AS namaBarang, kategori,
  deskripsi, lokasi_penitipan AS lokasiPenitipan,
  lokasi_terakhir AS lokasiTerakhir, kontak, tanggal,
  foto_barang AS fotoBarang, status,
  alasan_penolakan AS alasanPenolakan`;

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

const findLaporanTemuanByStatus = async (status) => {
  const sql = `SELECT ${selectFields} FROM laporan
    WHERE jenis_laporan = ? AND status = ?
    ORDER BY tanggal ASC, id_laporan ASC`;
  const [rows] = await db.execute(sql, ["temuan", status]);
  return rows;
};

// Dipanggil di dalam transaksi: baris dikunci agar dua satpam tidak
// memproses laporan yang sama pada saat bersamaan.
const findLaporanForUpdate = async (connection, idLaporan) => {
  const sql = `SELECT ${selectFields} FROM laporan
    WHERE id_laporan = ? FOR UPDATE`;
  const [rows] = await connection.execute(sql, [idLaporan]);
  return rows[0] ?? null;
};

const updateStatusLaporan = async (
  connection,
  idLaporan,
  status,
  alasanPenolakan = null,
) => {
  await connection.execute(
    "UPDATE laporan SET status = ?, alasan_penolakan = ? WHERE id_laporan = ?",
    [status, alasanPenolakan, idLaporan],
  );
};

module.exports = {
  insertLaporan,
  findLaporanById,
  findLaporanByPelapor,
  findLaporanTemuanByStatus,
  findLaporanForUpdate,
  updateStatusLaporan,
};
