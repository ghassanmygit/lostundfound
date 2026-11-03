const laporanModel = require("../models/laporanModel");
const AppError = require("../utils/appError");
const { saveImage } = require("../utils/fileStorage");
const { validateLaporanTemuan } = require("../utils/validators");

// Sesuaikan kedua nilai ini dengan isi kolom jenis_laporan dan status di ERD/tabel laporan.
const jenisLaporanTemuan = "temuan";
const statusLaporanAwal = "tersedia";

const isPositiveInteger = (value) => Number.isInteger(value) && value > 0;

const trimOrNull = (value) =>
  typeof value === "string" && value.trim() ? value.trim() : null;

const buatLaporanTemuan = async (data, file, idPengguna) => {
  if (!isPositiveInteger(idPengguna)) {
    throw new AppError("Pengguna tidak valid", 401);
  }

  const { isValid, errors } = validateLaporanTemuan(data, file);
  if (!isValid) throw new AppError("Validasi gagal", 400, errors);

  const fotoBarang = await saveImage(file);

  const idLaporan = await laporanModel.insertLaporan({
    idPengguna,
    jenisLaporan: jenisLaporanTemuan,
    namaBarang: data.namaBarang.trim(),
    kategori: data.kategori,
    deskripsi: trimOrNull(data.deskripsi),
    lokasiPenitipan: data.lokasiPenitipan.trim(),
    fotoBarang,
    status: statusLaporanAwal,
  });

  return laporanModel.findLaporanById(idLaporan);
};

const ambilLaporanById = async (idLaporan) => {
  if (!isPositiveInteger(idLaporan)) {
    throw new AppError("ID laporan tidak valid", 400);
  }

  const laporan = await laporanModel.findLaporanById(idLaporan);
  if (!laporan) throw new AppError("Laporan tidak ditemukan", 404);

  return laporan;
};

module.exports = { buatLaporanTemuan, ambilLaporanById };
