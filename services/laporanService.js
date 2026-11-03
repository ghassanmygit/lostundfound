const laporanModel = require("../models/laporanModel");
const AppError = require("../utils/appError");
const { validateLaporanTemuan } = require("../utils/validators");

const jenisLaporanTemuan = "temuan";
const statusLaporanAwal = "Menunggu Verifikasi";

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

module.exports = { createLaporanTemuan };
