const db = require("../utils/db");

const selectFields = `k.id_klaim AS idKlaim, k.id_laporan AS idLaporan,
  l.nama_barang AS namaBarang, k.ciri_khusus AS ciriKhusus,
  k.foto_bukti AS fotoBukti, k.status,
  k.alasan_penolakan AS alasanPenolakan, k.tanggal`;
const fromKlaim = `FROM klaim k JOIN laporan l ON l.id_laporan = k.id_laporan`;

const insertKlaim = async ({
  idLaporan,
  idPengklaim,
  fotoBukti,
  ciriKhusus,
  status,
}) => {
  const sql = `INSERT INTO klaim
    (id_laporan, id_pengklaim, foto_bukti, ciri_khusus, status, tanggal)
    VALUES (?, ?, ?, ?, ?, NOW())`;
  const [result] = await db.execute(sql, [
    idLaporan,
    idPengklaim,
    fotoBukti,
    ciriKhusus,
    status,
  ]);
  return result.insertId;
};

const findKlaimById = async (idKlaim) => {
  const sql = `SELECT ${selectFields} ${fromKlaim} WHERE k.id_klaim = ?`;
  const [rows] = await db.execute(sql, [idKlaim]);
  return rows[0] ?? null;
};

const findKlaimByPengklaim = async (idPengklaim) => {
  const sql = `SELECT ${selectFields} ${fromKlaim}
    WHERE k.id_pengklaim = ? ORDER BY k.tanggal DESC, k.id_klaim DESC`;
  const [rows] = await db.execute(sql, [idPengklaim]);
  return rows;
};

const existsKlaimByStatus = async (idLaporan, idPengklaim, status) => {
  const sql = `SELECT 1 FROM klaim
    WHERE id_laporan = ? AND id_pengklaim = ? AND status = ? LIMIT 1`;
  const [rows] = await db.execute(sql, [idLaporan, idPengklaim, status]);
  return rows.length > 0;
};

module.exports = {
  insertKlaim,
  findKlaimById,
  findKlaimByPengklaim,
  existsKlaimByStatus,
};
