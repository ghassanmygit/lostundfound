const klaimModel = require("../models/klaimModel");
const laporanModel = require("../models/laporanModel");
const AppError = require("../utils/appError");
const { withTransaction } = require("../utils/transaction");
const { validateIdKlaim } = require("../utils/klaimValidators");
const { validateTolak } = require("../utils/verifikasiValidators");

const statusKlaimPending = "Pending";
const statusKlaimDisetujui = "Disetujui";
const statusKlaimDitolak = "Ditolak";
const statusBarangTersedia = "Tersedia";
const statusBarangDiklaim = "Diklaim";
const alasanKlaimLain = "Barang sudah diserahkan melalui klaim pengguna lain";

const throwIfInvalid = (errors) => {
  if (errors.length > 0) throw new AppError("Validasi gagal", 400, errors);
};

// Memastikan klaim ada dan masih menunggu keputusan; barisnya dikunci.
const getKlaimMenunggu = async (connection, idKlaim) => {
  const klaim = await klaimModel.findKlaimStatus(connection, idKlaim, {
    forUpdate: true,
  });
  if (!klaim) throw new AppError("Klaim tidak ditemukan", 404);
  if (klaim.status !== statusKlaimPending) {
    throw new AppError(`Klaim sudah diproses (status: ${klaim.status})`, 409);
  }
  return klaim;
};

const getKlaimPending = () => klaimModel.findKlaimByStatus(statusKlaimPending);

const setujuiKlaim = async (idValidator, idKlaimParam) => {
  throwIfInvalid(validateIdKlaim(idKlaimParam));
  const idKlaim = Number(idKlaimParam);

  await withTransaction(async (connection) => {
    // Kunci barang lebih dulu, baru klaim, agar dua persetujuan atas barang
    // yang sama tidak saling menunggu (deadlock).
    const awal = await klaimModel.findKlaimStatus(connection, idKlaim);
    if (!awal) throw new AppError("Klaim tidak ditemukan", 404);
    const laporan = await laporanModel.findLaporanForUpdate(
      connection,
      awal.idLaporan,
    );

    const klaim = await getKlaimMenunggu(connection, idKlaim);
    if (laporan.status !== statusBarangTersedia) {
      throw new AppError("Barang tidak lagi tersedia untuk diklaim", 409);
    }

    await klaimModel.updateKeputusanKlaim(connection, idKlaim, {
      status: statusKlaimDisetujui,
      idValidator,
    });
    await klaimModel.tolakKlaimLain(connection, {
      idLaporan: klaim.idLaporan,
      kecualiIdKlaim: idKlaim,
      statusAwal: statusKlaimPending,
      statusBaru: statusKlaimDitolak,
      idValidator,
      alasan: alasanKlaimLain,
    });
    await laporanModel.updateStatusLaporan(
      connection,
      klaim.idLaporan,
      statusBarangDiklaim,
    );
  });

  return klaimModel.findKlaimById(idKlaim);
};

const tolakKlaim = async (idValidator, idKlaimParam, data) => {
  throwIfInvalid([...validateIdKlaim(idKlaimParam), ...validateTolak(data)]);
  const idKlaim = Number(idKlaimParam);

  await withTransaction(async (connection) => {
    await getKlaimMenunggu(connection, idKlaim);
    await klaimModel.updateKeputusanKlaim(connection, idKlaim, {
      status: statusKlaimDitolak,
      idValidator,
      alasanPenolakan: data.alasan.trim(),
    });
  });

  return klaimModel.findKlaimById(idKlaim);
};

module.exports = { getKlaimPending, setujuiKlaim, tolakKlaim };
