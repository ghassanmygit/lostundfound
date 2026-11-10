const allowedCategories = [
  "elektronik",
  "dokumen & buku",
  "pakaian & aksesoris",
  "wadah makanan & minuman",
  "lainnya",
];
const allowedImageTypes = ["image/jpeg", "image/png"];

const maxImageSizeMb = 5;
const maxImageSizeBytes = maxImageSizeMb * 1024 * 1024;

const maxNamaBarangLength = 100;
const maxLokasiLength = 150;
const maxDeskripsiLength = 500;

const noWaPattern = /^\+?[0-9]{8,15}$/;

const isFilledString = (value) =>
  typeof value === "string" && value.trim().length > 0;
const isWithinMaxLength = (value, maxLength) =>
  value.trim().length <= maxLength;

// Pemeriksaan yang dipakai bersama laporan temuan dan laporan hilang.
const checkNamaBarang = (data, errors) => {
  if (!isFilledString(data.namaBarang)) {
    errors.push("Nama barang wajib diisi");
  } else if (!isWithinMaxLength(data.namaBarang, maxNamaBarangLength)) {
    errors.push(`Nama barang maksimal ${maxNamaBarangLength} karakter`);
  }
};

const checkKategori = (data, errors) => {
  if (!allowedCategories.includes(data.kategori)) {
    errors.push(
      `Kategori harus salah satu dari: ${allowedCategories.join(", ")}`,
    );
  }
};

const checkLokasi = (value, pesanWajib, pesanTerlaluPanjang, errors) => {
  if (!isFilledString(value)) {
    errors.push(pesanWajib);
  } else if (!isWithinMaxLength(value, maxLokasiLength)) {
    errors.push(pesanTerlaluPanjang);
  }
};

const checkDeskripsi = (data, errors) => {
  if (
    data.deskripsi !== undefined &&
    (typeof data.deskripsi !== "string" ||
      !isWithinMaxLength(data.deskripsi, maxDeskripsiLength))
  ) {
    errors.push(
      `Deskripsi harus berupa teks maksimal ${maxDeskripsiLength} karakter`,
    );
  }
};

// Pemeriksaan foto yang dipakai laporan temuan dan klaim.
const checkFoto = (file, pesanWajib, errors) => {
  if (!file) {
    errors.push(pesanWajib);
    return;
  }
  if (!allowedImageTypes.includes(file.mimetype))
    errors.push("Foto harus berformat JPG atau PNG");
  if (file.size > maxImageSizeBytes)
    errors.push(`Ukuran foto maksimal ${maxImageSizeMb} MB`);
};

const validateLaporanTemuan = (data = {}, file) => {
  const errors = [];

  checkNamaBarang(data, errors);
  checkKategori(data, errors);
  checkLokasi(
    data.lokasiPenitipan,
    "Pos satpam tempat barang dititipkan wajib diisi",
    `Lokasi penitipan maksimal ${maxLokasiLength} karakter`,
    errors,
  );
  checkDeskripsi(data, errors);

  checkFoto(file, "Foto barang wajib diunggah", errors);

  return { isValid: errors.length === 0, errors };
};

const validateLaporanHilang = (data = {}) => {
  const errors = [];

  checkNamaBarang(data, errors);
  checkKategori(data, errors);
  checkLokasi(
    data.lokasiTerakhir,
    "Lokasi terakhir barang dilihat wajib diisi",
    `Lokasi terakhir maksimal ${maxLokasiLength} karakter`,
    errors,
  );
  checkDeskripsi(data, errors);

  if (
    typeof data.kontak !== "string" ||
    !noWaPattern.test(data.kontak.trim())
  ) {
    errors.push("Nomor kontak wajib diisi (8-15 digit, boleh diawali +)");
  }

  return { isValid: errors.length === 0, errors };
};

module.exports = {
  allowedCategories,
  checkFoto,
  validateLaporanTemuan,
  validateLaporanHilang,
  maxImageSizeBytes,
  maxImageSizeMb,
  noWaPattern,
  isFilledString,
  isWithinMaxLength,
};
