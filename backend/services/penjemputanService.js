const klaimModel = require("../models/klaimModel");
const laporanModel = require("../models/laporanModel");
const lokerModel = require("../models/lokerModel");
const AppError = require("../utils/appError");
const { withTransaction } = require("../utils/transaction");
const { validateIdKlaim } = require("../utils/klaimValidators");

const statusKlaimDisetujui = "Disetujui";
const statusKlaimSelesai = "Selesai";
const statusBarangDiklaim = "Diklaim";
const statusBarangSelesai = "Selesai";
const statusLokerKosong = "kosong";

// Klaim yang sudah disetujui dan barangnya menunggu diambil pemilik.
const getDaftarPenjemputan = () =>
  klaimModel.findKlaimByStatus(statusKlaimDisetujui);

const konfirmasiPenjemputan = async (idKlaimParam) => {
  const errors = validateIdKlaim(idKlaimParam);
  if (errors.length > 0) throw new AppError("Validasi gagal", 400, errors);
  const idKlaim = Number(idKlaimParam);

  await withTransaction(async (connection) => {
    // Urutan kunci: barang, klaim, penempatan, loker (sama dengan alur lain).
    const awal = await klaimModel.findKlaimStatus(connection, idKlaim);
    if (!awal) throw new AppError("Klaim tidak ditemukan", 404);
    const laporan = await laporanModel.findLaporanForUpdate(
      connection,
      awal.idLaporan,
    );
    const klaim = await klaimModel.findKlaimStatus(connection, idKlaim, {
      forUpdate: true,
    });

    if (klaim.status !== statusKlaimDisetujui) {
      throw new AppError(
        `Klaim belum atau tidak dapat diserahkan (status: ${klaim.status})`,
        409,
      );
    }
    if (laporan.status !== statusBarangDiklaim) {
      throw new AppError(
        `Barang tidak dalam status Diklaim (status: ${laporan.status})`,
        409,
      );
    }

    const penempatan = await lokerModel.findPenempatanAktifForUpdate(
      connection,
      klaim.idLaporan,
    );
    if (!penempatan) {
      throw new AppError("Penempatan loker barang ini tidak ditemukan", 409);
    }

    await lokerModel.tutupPenempatan(connection, penempatan.idPenempatan);
    await lokerModel.updateStatusLoker(
      connection,
      penempatan.idLoker,
      statusLokerKosong,
    );
    await laporanModel.updateStatusLaporan(
      connection,
      klaim.idLaporan,
      statusBarangSelesai,
    );
    await klaimModel.updateStatusKlaim(connection, idKlaim, statusKlaimSelesai);
  });

  return klaimModel.findKlaimById(idKlaim);
};

module.exports = { getDaftarPenjemputan, konfirmasiPenjemputan };
