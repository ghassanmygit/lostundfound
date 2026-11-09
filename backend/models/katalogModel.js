const db = require("../utils/db");

// Hanya kolom yang aman ditampilkan ke publik (tanpa data pelapor).
const publicFields = `id_laporan AS idLaporan, nama_barang AS namaBarang,
  kategori, deskripsi, lokasi_penitipan AS lokasiPenitipan, tanggal,
  foto_barang AS fotoBarang`;

const buildWhere = ({ status, cari, kategori }) => {
  const conditions = ["jenis_laporan = ?", "status = ?"];
  const params = ["temuan", status];

  if (kategori) {
    conditions.push("kategori = ?");
    params.push(kategori);
  }
  if (cari) {
    // Karakter khusus LIKE (% dan _) dianggap huruf biasa.
    const pola = `%${cari.replace(/[!%_]/g, "!$&")}%`;
    conditions.push(
      "(nama_barang LIKE ? ESCAPE '!' OR deskripsi LIKE ? ESCAPE '!')",
    );
    params.push(pola, pola);
  }
  return { where: conditions.join(" AND "), params };
};

const findKatalog = async (kriteria, limit, offset) => {
  const { where, params } = buildWhere(kriteria);
  const sql = `SELECT ${publicFields} FROM laporan WHERE ${where}
    ORDER BY tanggal DESC, id_laporan DESC LIMIT ? OFFSET ?`;
  const [rows] = await db.query(sql, [...params, limit, offset]);
  return rows;
};

const countKatalog = async (kriteria) => {
  const { where, params } = buildWhere(kriteria);
  const sql = `SELECT COUNT(*) AS total FROM laporan WHERE ${where}`;
  const [rows] = await db.query(sql, params);
  return rows[0].total;
};

const findKatalogById = async (idLaporan, status) => {
  const sql = `SELECT ${publicFields} FROM laporan
    WHERE id_laporan = ? AND jenis_laporan = ? AND status = ?`;
  const [rows] = await db.execute(sql, [idLaporan, "temuan", status]);
  return rows[0] ?? null;
};

module.exports = { findKatalog, countKatalog, findKatalogById };
