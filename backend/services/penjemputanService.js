const klaimModel = require("../models/klaimModel");
const laporanModel = require("../models/laporanModel");
const lokerModel = require("../models/lokerModel");
const AppError = require("../utils/appError");
const { withTransaction } = require("../utils/transaction");
const { validateIdKlaim } = require("../utils/klaimValidators");
const { isPositiveInteger } = require("../utils/verifikasiValidators");

const statusKlaimDisetujui = "Disetujui";
const statusKlaimSelesai = "Selesai";
const statusBarangDiklaim = "Diklaim";
const statusBarangSelesai = "Selesai";
const statusLokerKosong = "kosong";
const statusHilangDicari = "Dicari";

// Klaim yang sudah disetujui dan barangnya menunggu diambil pemilik.
const getDaftarPenjemputan = () =>
  klaimModel.findKlaimByStatus(statusKlaimDisetujui);

const getKandidatHilang = async (idKlaimParam) => {
  const errors = validateIdKlaim(idKlaimParam);
  if (errors.length > 0) throw new AppError("Validasi gagal", 400, errors);
  return klaimModel.findKandidatHilang(Number(idKlaimParam));
};

const konfirmasiPenjemputan = async (idKlaimParam, data = {}) => {
  const errors = validateIdKlaim(idKlaimParam);
  const pilihan = data.idLaporanHilang;
  if (
    pilihan !== undefined &&
    pilihan !== null &&
    !isPositiveInteger(pilihan)
  ) {
    errors.push("ID laporan hilang tidak valid");
  }
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

    // Laporan hilang yang ditautkan pengklaim ikut ditutup otomatis.
    const idHilang =
      pilihan === undefined
        ? klaim.idLaporanHilang
        : pilihan && Number(pilihan);
    if (idHilang) {
      const hilang = await laporanModel.findLaporanForUpdate(
        connection,
        idHilang,
      );
      if (
        !hilang ||
        hilang.jenisLaporan !== "hilang" ||
        hilang.idPengguna !== klaim.idPengklaim ||
        hilang.status !== statusHilangDicari
      ) {
        throw new AppError("Laporan hilang yang dipilih tidak valid", 400);
      }
      await laporanModel.updateStatusLaporan(
        connection,
        hilang.idLaporan,
        statusBarangSelesai,
      );
    }
  });

  return klaimModel.findKlaimById(idKlaim);
};

module.exports = {
  getDaftarPenjemputan,
  getKandidatHilang,
  konfirmasiPenjemputan,
};
