const laporanModel = require("../models/laporanModel");
const AppError = require("../utils/appError");
const { validateLaporanTemuan } = require("../utils/validators");

// Sesuaikan kedua nilai ini dengan isi kolom jenis_laporan dan status di tabel laporan (ERD).
const jenisLaporanTemuan = "temuan";
const statusLaporanAwal = "tersedia";

const trimOrNull = (value) =>
  typeof value === "string" && value.trim() ? value.trim() : null;

const createLaporanTemuan = async (data, file) => {
  const { isValid, errors } = validateLaporanTemuan(data, file);
  if (!isValid) throw new AppError("Validasi gagal", 400, errors);

  const idLaporan = await laporanModel.insertLaporan({
    idPengguna: Number(data.idPengguna),
    jenisLaporan: jenisLaporanTemuan,
    namaBarang: data.namaBarang.trim(),
    kategori: data.kategori,
    deskripsi: trimOrNull(data.deskripsi),
    lokasiPenitipan: data.lokasiPenitipan.trim(),
    fotoBarang: file.filename,
    status: statusLaporanAwal,
  });

  return laporanModel.findLaporanById(idLaporan);
};

const getLaporanById = async (idLaporan) => {
  const laporan = await laporanModel.findLaporanById(idLaporan);
  if (!laporan) throw new AppError("Laporan tidak ditemukan", 404);

  return laporan;
};

module.exports = { createLaporanTemuan, getLaporanById };
