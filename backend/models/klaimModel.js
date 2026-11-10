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

// Daftar klaim berstatus tertentu (mis. Pending atau Disetujui)
// mencocokkan barang fisik di loker.
const findKlaimByStatus = async (status) => {
  const sql = `SELECT k.id_klaim AS idKlaim, k.id_laporan AS idLaporan,
    l.nama_barang AS namaBarang, l.deskripsi AS deskripsiBarang,
    l.foto_barang AS fotoBarang, lk.nomor_loker AS nomorLoker,
    k.ciri_khusus AS ciriKhusus, k.foto_bukti AS fotoBukti,
    p.nama AS namaPengklaim, p.no_wa AS noWaPengklaim, k.tanggal
    FROM klaim k
    JOIN laporan l ON l.id_laporan = k.id_laporan
    JOIN pengguna p ON p.id_pengguna = k.id_pengklaim
    LEFT JOIN penempatan_loker pl
      ON pl.id_laporan = l.id_laporan AND pl.tanggal_keluar IS NULL
    LEFT JOIN loker lk ON lk.id_loker = pl.id_loker
    WHERE k.status = ? ORDER BY k.tanggal ASC, k.id_klaim ASC`;
  const [rows] = await db.execute(sql, [status]);
  return rows;
};

// Dipanggil di dalam transaksi. Tanpa forUpdate hanya membaca, dengan
// forUpdate baris klaim dikunci.
const findKlaimStatus = async (
  connection,
  idKlaim,
  { forUpdate = false } = {},
) => {
  const sql = `SELECT id_klaim AS idKlaim, id_laporan AS idLaporan, status
    FROM klaim WHERE id_klaim = ? ${forUpdate ? "FOR UPDATE" : ""}`;
  const [rows] = await connection.execute(sql, [idKlaim]);
  return rows[0] ?? null;
};

const updateKeputusanKlaim = async (
  connection,
  idKlaim,
  { status, idValidator, alasanPenolakan = null },
) => {
  await connection.execute(
    `UPDATE klaim SET status = ?, id_validator = ?, alasan_penolakan = ?
     WHERE id_klaim = ?`,
    [status, idValidator, alasanPenolakan, idKlaim],
  );
};

// Klaim lain atas barang yang sama otomatis ditolak saat satu klaim disetujui.
const tolakKlaimLain = async (
  connection,
  { idLaporan, kecualiIdKlaim, statusAwal, statusBaru, idValidator, alasan },
) => {
  await connection.execute(
    `UPDATE klaim SET status = ?, id_validator = ?, alasan_penolakan = ?
     WHERE id_laporan = ? AND status = ? AND id_klaim <> ?`,
    [statusBaru, idValidator, alasan, idLaporan, statusAwal, kecualiIdKlaim],
  );
};

const updateStatusKlaim = async (connection, idKlaim, status) => {
  await connection.execute("UPDATE klaim SET status = ? WHERE id_klaim = ?", [
    status,
    idKlaim,
  ]);
};

module.exports = {
  findKlaimByStatus,
  findKlaimStatus,
  updateKeputusanKlaim,
  updateStatusKlaim,
  tolakKlaimLain,
  insertKlaim,
  findKlaimById,
  findKlaimByPengklaim,
  existsKlaimByStatus,
};
