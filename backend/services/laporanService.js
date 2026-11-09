const laporanModel = require("../models/laporanModel");
const AppError = require("../utils/appError");
const {
  validateLaporanTemuan,
  validateLaporanHilang,
} = require("../utils/validators");

const jenisLaporanTemuan = "temuan";
const jenisLaporanHilang = "hilang";
const statusTemuanAwal = "Menunggu Verifikasi";
const statusHilangAwal = "Dicari";

const trimOrNull = (value) =>
  typeof value === "string" && value.trim() ? value.trim() : null;

const createLaporanTemuan = async (idPengguna, data, file) => {
  const { isValid, errors } = validateLaporanTemuan(data, file);
  if (!isValid) throw new AppError("Validasi gagal", 400, errors);

  const idLaporan = await laporanModel.insertLaporan({
    idPengguna,
    jenisLaporan: jenisLaporanTemuan,
    namaBarang: data.namaBarang.trim(),
    kategori: data.kategori,
    deskripsi: trimOrNull(data.deskripsi),
    lokasiPenitipan: data.lokasiPenitipan.trim(),
    fotoBarang: file.filename,
    status: statusTemuanAwal,
  });

  return laporanModel.findLaporanById(idLaporan);
};

const createLaporanHilang = async (idPengguna, data) => {
  const { isValid, errors } = validateLaporanHilang(data);
  if (!isValid) throw new AppError("Validasi gagal", 400, errors);

  const idLaporan = await laporanModel.insertLaporan({
    idPengguna,
    jenisLaporan: jenisLaporanHilang,
    namaBarang: data.namaBarang.trim(),
    kategori: data.kategori,
    deskripsi: trimOrNull(data.deskripsi),
    lokasiTerakhir: data.lokasiTerakhir.trim(),
    kontak: data.kontak.trim(),
    status: statusHilangAwal,
  });

  return laporanModel.findLaporanById(idLaporan);
};

const getLaporanSaya = (idPengguna) =>
  laporanModel.findLaporanByPelapor(idPengguna);

module.exports = { createLaporanTemuan, createLaporanHilang, getLaporanSaya };
