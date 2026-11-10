const db = require("../utils/db");

const selectFields = "id_loker AS idLoker, nomor_loker AS nomorLoker, status";

const findLokerKosong = async () => {
  const sql = `SELECT ${selectFields} FROM loker
    WHERE status = ? ORDER BY nomor_loker`;
  const [rows] = await db.execute(sql, ["kosong"]);
  return rows;
};

// Fungsi di bawah dipanggil di dalam transaksi, sehingga menerima connection.
const findLokerForUpdate = async (connection, idLoker) => {
  const sql = `SELECT ${selectFields} FROM loker
    WHERE id_loker = ? FOR UPDATE`;
  const [rows] = await connection.execute(sql, [idLoker]);
  return rows[0] ?? null;
};

const updateStatusLoker = async (connection, idLoker, status) => {
  await connection.execute("UPDATE loker SET status = ? WHERE id_loker = ?", [
    status,
    idLoker,
  ]);
};

const insertPenempatan = async (
  connection,
  { idLaporan, idLoker, idSatpam },
) => {
  const sql = `INSERT INTO penempatan_loker
    (id_laporan, id_loker, id_satpam, tanggal_masuk)
    VALUES (?, ?, ?, NOW())`;
  const [result] = await connection.execute(sql, [
    idLaporan,
    idLoker,
    idSatpam,
  ]);
  return result.insertId;
};

// Penempatan yang masih aktif (barang masih di loker) untuk satu laporan.
const findPenempatanAktifForUpdate = async (connection, idLaporan) => {
  const sql = `SELECT id_penempatan AS idPenempatan, id_loker AS idLoker
    FROM penempatan_loker
    WHERE id_laporan = ? AND tanggal_keluar IS NULL FOR UPDATE`;
  const [rows] = await connection.execute(sql, [idLaporan]);
  return rows[0] ?? null;
};

const tutupPenempatan = async (connection, idPenempatan) => {
  await connection.execute(
    "UPDATE penempatan_loker SET tanggal_keluar = NOW() WHERE id_penempatan = ?",
    [idPenempatan],
  );
};

module.exports = {
  findPenempatanAktifForUpdate,
  tutupPenempatan,
  findLokerKosong,
  findLokerForUpdate,
  updateStatusLoker,
  insertPenempatan,
};
