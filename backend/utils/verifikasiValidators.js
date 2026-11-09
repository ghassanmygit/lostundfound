const { isFilledString, isWithinMaxLength } = require("./validators");

const maxAlasanLength = 255;
const maxIdValue = 2147483647;

const isPositiveInteger = (value) =>
  /^[1-9][0-9]*$/.test(String(value)) && Number(value) <= maxIdValue;

const validateIdLaporan = (idLaporan) =>
  isPositiveInteger(idLaporan) ? [] : ["ID laporan tidak valid"];

const validateVerifikasi = (data = {}) =>
  isPositiveInteger(data.idLoker)
    ? []
    : ["ID loker wajib diisi dan berupa bilangan bulat positif"];

const validateTolak = (data = {}) => {
  if (!isFilledString(data.alasan)) return ["Alasan penolakan wajib diisi"];
  if (!isWithinMaxLength(data.alasan, maxAlasanLength)) {
    return [`Alasan penolakan maksimal ${maxAlasanLength} karakter`];
  }
  return [];
};

module.exports = { validateIdLaporan, validateVerifikasi, validateTolak };
