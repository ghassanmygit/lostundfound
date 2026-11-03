const allowedCategories = [
  "elektronik",
  "dokumen & buku",
  "pakaian & aksesoris",
  "wadah makanan & minuman",
  "lainnya",
];
const allowedImageTypes = ["image/jpeg", "image/png"];
const maxImageSizeBytes = 2 * 1024 * 1024;

const maxNamaBarangLength = 100;
const maxLokasiLength = 150; 
const maxDeskripsiLength = 500;

const isFilledString = (value) =>
  typeof value === "string" && value.trim().length > 0;
const isWithinMaxLength = (value, maxLength) =>
  value.trim().length <= maxLength;

const validateLaporanTemuan = (data = {}, file) => {
  const errors = [];

  const idPengguna = Number(data.idPengguna);
  if (!Number.isInteger(idPengguna) || idPengguna <= 0) {
    errors.push("ID pengguna tidak valid");
  }

  if (!isFilledString(data.namaBarang)) {
    errors.push("Nama barang wajib diisi");
  } else if (!isWithinMaxLength(data.namaBarang, 100)) {
    errors.push("Nama barang maksimal 100 karakter");
  }

  if (!allowedCategories.includes(data.kategori)) {
    errors.push(
      `Kategori harus salah satu dari: ${allowedCategories.join(", ")}`,
    );
  }

  if (!isFilledString(data.lokasiPenitipan)) {
    errors.push("Pos satpam tempat barang dititipkan wajib diisi");
  }

  if (
    data.deskripsi !== undefined &&
    (typeof data.deskripsi !== "string" || data.deskripsi.trim().length > 500)
  ) {
    errors.push("Deskripsi harus berupa teks maksimal 500 karakter");
  }

  if (!file) {
    errors.push("Foto barang wajib diunggah");
  } else {
    if (!allowedImageTypes.includes(file.mimetype))
      errors.push("Foto harus berformat JPG atau PNG");
    if (file.size > maxImageSizeBytes) errors.push("Ukuran foto maksimal 2 MB");
  }

  return { isValid: errors.length === 0, errors };
};

module.exports = { validateLaporanTemuan, maxImageSizeBytes };
