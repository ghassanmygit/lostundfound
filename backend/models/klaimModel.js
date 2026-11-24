const db = require("../utils/db");

const selectFields = `k.id_klaim AS idKlaim, k.id_laporan AS idLaporan,
  k.id_laporan_hilang AS idLaporanHilang, l.nama_barang AS namaBarang, k.ciri_khusus AS ciriKhusus,
  k.foto_bukti AS fotoBukti, k.status,
  k.alasan_penolakan AS alasanPenolakan, k.tanggal`;
const fromKlaim = `FROM klaim k JOIN laporan l ON l.id_laporan = k.id_laporan`;

const insertKlaim = async ({
  idLaporan,
  idLaporanHilang,
  idPengklaim,
  fotoBukti,
  ciriKhusus,
  status,
}) => {
  const sql = `INSERT INTO klaim
    (id_laporan, id_laporan_hilang, id_pengklaim, foto_bukti, ciri_khusus,
     status, tanggal)
    VALUES (?, ?, ?, ?, ?, ?, NOW())`;
  const [result] = await db.execute(sql, [
    idLaporan,
    idLaporanHilang ?? null,
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

const findKlaimByStatus = async (status) => {
  const sql = `SELECT k.id_klaim AS idKlaim, k.id_laporan AS idLaporan, k.id_laporan_hilang AS idLaporanHilang,
    l.nama_barang AS namaBarang, l.deskripsi AS deskripsiBarang,
    l.foto_barang AS fotoBarang, lk.nomor_loker AS nomorLoker,
    k.ciri_khusus AS ciriKhusus, k.foto_bukti AS fotoBukti,
    p.nama AS namaPengklaim, p.no_wa AS noWaPengklaim, k.tanggal,
    lh.nama_barang AS namaBarangHilang,
    lh.lokasi_terakhir AS lokasiTerakhirHilang
    FROM klaim k
    JOIN laporan l ON l.id_laporan = k.id_laporan
    LEFT JOIN laporan lh ON lh.id_laporan = k.id_laporan_hilang
    JOIN pengguna p ON p.id_pengguna = k.id_pengklaim
    LEFT JOIN penempatan_loker pl
      ON pl.id_laporan = l.id_laporan AND pl.tanggal_keluar IS NULL
    LEFT JOIN loker lk ON lk.id_loker = pl.id_loker
    WHERE k.status = ? ORDER BY k.tanggal ASC, k.id_klaim ASC`;
  const [rows] = await db.execute(sql, [status]);
  return rows;
};

const findKlaimStatus = async (
  connection,
  idKlaim,
  { forUpdate = false } = {},
) => {
  const sql = `SELECT id_klaim AS idKlaim, id_laporan AS idLaporan,
    id_laporan_hilang AS idLaporanHilang, id_pengklaim AS idPengklaim, status
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

const findKandidatHilang = async (idKlaim) => {
  const sql = `SELECT lh.id_laporan AS idLaporan, lh.nama_barang AS namaBarang,
    lh.kategori, lh.lokasi_terakhir AS lokasiTerakhir,
    (lh.kategori = l.kategori) AS kategoriSama
    FROM klaim k
    JOIN laporan l ON l.id_laporan = k.id_laporan
    JOIN laporan lh ON lh.id_pelapor = k.id_pengklaim
      AND lh.jenis_laporan = 'hilang' AND lh.status = 'Dicari'
    WHERE k.id_klaim = ?
    ORDER BY kategoriSama DESC, lh.tanggal DESC, lh.id_laporan DESC`;
  const [rows] = await db.execute(sql, [idKlaim]);
  return rows.map((r) => ({ ...r, kategoriSama: Boolean(r.kategoriSama) }));
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
  findKandidatHilang,
};
