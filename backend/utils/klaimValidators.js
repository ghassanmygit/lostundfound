const {
  checkFoto,
  isFilledString,
  isWithinMaxLength,
} = require("./validators");
const { isPositiveInteger } = require("./verifikasiValidators");

const maxCiriKhususLength = 500;

const validateKlaim = (data = {}, file) => {
  const errors = [];

  if (!isPositiveInteger(data.idLaporan)) errors.push("ID laporan tidak valid");

  if (!isFilledString(data.ciriKhusus)) {
    errors.push("Ciri khusus barang wajib diisi");
  } else if (!isWithinMaxLength(data.ciriKhusus, maxCiriKhususLength)) {
    errors.push(`Ciri khusus maksimal ${maxCiriKhususLength} karakter`);
  }

  checkFoto(file, "Foto bukti kepemilikan wajib diunggah", errors);

  return { isValid: errors.length === 0, errors };
};

module.exports = { validateKlaim };
