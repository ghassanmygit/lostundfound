export const formatTanggal = (value) =>
  new Date(value).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export const urlFoto = (namaFile) => (namaFile ? `/uploads/${namaFile}` : null);

export const kategoriList = [
  "elektronik",
  "dokumen & buku",
  "pakaian & aksesoris",
  "wadah makanan & minuman",
  "lainnya",
];
