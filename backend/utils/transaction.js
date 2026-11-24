const db = require("./db");

// Menjalankan beberapa query sebagai satu kesatuan: semua berhasil
// (commit) atau semua dibatalkan (rollback) bila ada yang gagal.
const withTransaction = async (work) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const result = await work(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

module.exports = { withTransaction };
