const klaimModel = require("../models/klaimModel");
const laporanModel = require("../models/laporanModel");
const AppError = require("../utils/appError");
const { validateKlaim } = require("../utils/klaimValidators");

const statusKlaimPending = "Pending";
// Hanya barang yang sudah diverifikasi Satpam (tampil di katalog) yang bisa diklaim.
const statusBarangTersedia = "Tersedia";

const createKlaim = async (idPengklaim, data, file) => {
  const { isValid, errors } = validateKlaim(data, file);
  if (!isValid) throw new AppError("Validasi gagal", 400, errors);

  const idLaporan = Number(data.idLaporan);
  const barang = await laporanModel.findLaporanById(idLaporan);
  if (
    !barang ||
    barang.jenisLaporan !== "temuan" ||
    barang.status !== statusBarangTersedia
  ) {
    throw new AppError("Barang tidak ditemukan di katalog", 404);
  }
  if (barang.idPengguna === idPengklaim) {
    throw new AppError(
      "Anda tidak dapat mengklaim barang yang Anda laporkan sendiri",
      403,
    );
  }

  const sudahMengajukan = await klaimModel.existsKlaimByStatus(
    idLaporan,
    idPengklaim,
    statusKlaimPending,
  );
  if (sudahMengajukan) {
    throw new AppError(
      "Anda sudah mengajukan klaim untuk barang ini dan masih menunggu validasi",
      409,
    );
  }

  const idKlaim = await klaimModel.insertKlaim({
    idLaporan,
    idPengklaim,
    fotoBukti: file.filename,
    ciriKhusus: data.ciriKhusus.trim(),
    status: statusKlaimPending,
  });

  return klaimModel.findKlaimById(idKlaim);
};

const getKlaimSaya = (idPengklaim) =>
  klaimModel.findKlaimByPengklaim(idPengklaim);

module.exports = { createKlaim, getKlaimSaya };
