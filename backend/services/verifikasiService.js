const laporanModel = require("../models/laporanModel");
const lokerModel = require("../models/lokerModel");
const AppError = require("../utils/appError");
const { withTransaction } = require("../utils/transaction");
const {
  validateIdLaporan,
  validateVerifikasi,
  validateTolak,
} = require("../utils/verifikasiValidators");

const statusMenunggu = "Menunggu Verifikasi";
const statusTersedia = "Tersedia";
const statusDitolak = "Ditolak";
const statusLokerKosong = "kosong";
const statusLokerTerisi = "terisi";

const throwIfInvalid = (errors) => {
  if (errors.length > 0) throw new AppError("Validasi gagal", 400, errors);
};

// Memastikan laporan ada, berjenis temuan, dan masih menunggu verifikasi.
const getLaporanMenunggu = async (connection, idLaporan) => {
  const laporan = await laporanModel.findLaporanForUpdate(connection, idLaporan);
  if (!laporan) throw new AppError("Laporan tidak ditemukan", 404);
  if (laporan.jenisLaporan !== "temuan") {
    throw new AppError("Hanya laporan temuan yang dapat diverifikasi", 409);
  }
  if (laporan.status !== statusMenunggu) {
    throw new AppError(
      `Laporan sudah diproses (status: ${laporan.status})`,
      409,
    );
  }
  return laporan;
};

const getDaftarMenunggu = () =>
  laporanModel.findLaporanTemuanByStatus(statusMenunggu);

const getLokerKosong = () => lokerModel.findLokerKosong();

const verifikasiLaporan = async (idSatpam, idLaporanParam, data) => {
  throwIfInvalid([
    ...validateIdLaporan(idLaporanParam),
    ...validateVerifikasi(data),
  ]);
  const idLaporan = Number(idLaporanParam);
  const idLoker = Number(data.idLoker);

  await withTransaction(async (connection) => {
    await getLaporanMenunggu(connection, idLaporan);

    const loker = await lokerModel.findLokerForUpdate(connection, idLoker);
    if (!loker) throw new AppError("Loker tidak ditemukan", 404);
    if (loker.status !== statusLokerKosong) {
      throw new AppError("Loker sudah terisi. Pilih loker lain", 409);
    }

    await lokerModel.insertPenempatan(connection, {
      idLaporan,
      idLoker,
      idSatpam,
    });
    await laporanModel.updateStatusLaporan(connection, idLaporan, statusTersedia);
    await lokerModel.updateStatusLoker(connection, idLoker, statusLokerTerisi);
  });

  return laporanModel.findLaporanById(idLaporan);
};

const tolakLaporan = async (idLaporanParam, data) => {
  throwIfInvalid([...validateIdLaporan(idLaporanParam), ...validateTolak(data)]);
  const idLaporan = Number(idLaporanParam);

  await withTransaction(async (connection) => {
    await getLaporanMenunggu(connection, idLaporan);
    await laporanModel.updateStatusLaporan(
      connection,
      idLaporan,
      statusDitolak,
      data.alasan.trim(),
    );
  });

  return laporanModel.findLaporanById(idLaporan);
};

module.exports = {
  getDaftarMenunggu,
  getLokerKosong,
  verifikasiLaporan,
  tolakLaporan,
};
