const laporanModel = require("../models/laporanModel");
const AppError = require("../utils/appError");
const {
  validateLaporanTemuan,
  validateLaporanHilang,
} = require("../utils/validators");
const { withTransaction } = require("../utils/transaction");
const { validateIdLaporan } = require("../utils/verifikasiValidators");

const jenisLaporanTemuan = "temuan";
const jenisLaporanHilang = "hilang";
const statusTemuanAwal = "Menunggu Verifikasi";
const statusHilangAwal = "Dicari";
const statusSelesai = "Selesai";

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

const createLaporanHilang = async (idPengguna, data, file) => {
  const { isValid, errors } = validateLaporanHilang(data, file);
  if (!isValid) throw new AppError("Validasi gagal", 400, errors);

  const idLaporan = await laporanModel.insertLaporan({
    idPengguna,
    jenisLaporan: jenisLaporanHilang,
    namaBarang: data.namaBarang.trim(),
    kategori: data.kategori,
    deskripsi: trimOrNull(data.deskripsi),
    lokasiTerakhir: data.lokasiTerakhir.trim(),
    kontak: data.kontak.trim(),
    fotoBarang: file ? file.filename : null,
    status: statusHilangAwal,
  });

  return laporanModel.findLaporanById(idLaporan);
};

const getLaporanSaya = (idPengguna) =>
  laporanModel.findLaporanByPelapor(idPengguna);

const tandaiHilangDitemukan = async (idPengguna, idLaporanParam) => {
  const errors = validateIdLaporan(idLaporanParam);
  if (errors.length > 0) throw new AppError("Validasi gagal", 400, errors);
  const idLaporan = Number(idLaporanParam);

  await withTransaction(async (connection) => {
    const laporan = await laporanModel.findLaporanForUpdate(
      connection,
      idLaporan,
    );
    if (!laporan || laporan.idPengguna !== idPengguna) {
      throw new AppError("Laporan tidak ditemukan", 404);
    }
    if (laporan.jenisLaporan !== jenisLaporanHilang) {
      throw new AppError(
        "Hanya laporan hilang yang dapat ditandai ketemu",
        409,
      );
    }
    if (laporan.status !== statusHilangAwal) {
      throw new AppError(
        `Laporan sudah diproses (status: ${laporan.status})`,
        409,
      );
    }
    await laporanModel.updateStatusLaporan(
      connection,
      idLaporan,
      statusSelesai,
    );
  });

  return laporanModel.findLaporanById(idLaporan);
};

module.exports = {
  createLaporanTemuan,
  createLaporanHilang,
  getLaporanSaya,
  tandaiHilangDitemukan,
};
