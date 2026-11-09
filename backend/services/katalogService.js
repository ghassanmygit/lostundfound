const katalogModel = require("../models/katalogModel");
const AppError = require("../utils/appError");
const { validateKatalogQuery } = require("../utils/katalogValidators");
const { validateIdLaporan } = require("../utils/verifikasiValidators");

// Hanya barang yang sudah diverifikasi Satpam yang tampil di katalog.
const statusTersedia = "Tersedia";

const getKatalog = async (query) => {
  const { errors, filters } = validateKatalogQuery(query);
  if (errors.length > 0) throw new AppError("Validasi gagal", 400, errors);

  const { halaman, batas, cari, kategori } = filters;
  const kriteria = { status: statusTersedia, cari, kategori };
  const [data, total] = await Promise.all([
    katalogModel.findKatalog(kriteria, batas, (halaman - 1) * batas),
    katalogModel.countKatalog(kriteria),
  ]);

  return {
    data,
    meta: { halaman, batas, total, totalHalaman: Math.ceil(total / batas) },
  };
};

const getDetailKatalog = async (idLaporanParam) => {
  const errors = validateIdLaporan(idLaporanParam);
  if (errors.length > 0) throw new AppError("Validasi gagal", 400, errors);

  const barang = await katalogModel.findKatalogById(
    Number(idLaporanParam),
    statusTersedia,
  );
  if (!barang) throw new AppError("Barang tidak ditemukan di katalog", 404);
  return barang;
};

module.exports = { getKatalog, getDetailKatalog };
