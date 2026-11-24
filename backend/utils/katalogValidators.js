const { allowedCategories, isWithinMaxLength } = require("./validators");
const { isPositiveInteger } = require("./verifikasiValidators");

const maxCariLength = 100;
const defaultBatas = 10;
const maxBatas = 50;

// Parameter kosong (?kategori=) dianggap tidak diisi.
const orUndefined = (value) => (value === "" ? undefined : value);

const validateKatalogQuery = (query = {}) => {
  const errors = [];
  const cari = orUndefined(query.cari);
  const kategori = orUndefined(query.kategori);
  const halaman = orUndefined(query.halaman) ?? 1;
  const batas = orUndefined(query.batas) ?? defaultBatas;

  if (cari !== undefined) {
    if (typeof cari !== "string") {
      errors.push("Kata kunci pencarian harus berupa teks");
    } else if (!isWithinMaxLength(cari, maxCariLength)) {
      errors.push(`Kata kunci pencarian maksimal ${maxCariLength} karakter`);
    }
  }
  if (kategori !== undefined && !allowedCategories.includes(kategori)) {
    errors.push(
      `Kategori harus salah satu dari: ${allowedCategories.join(", ")}`,
    );
  }
  if (!isPositiveInteger(halaman)) {
    errors.push("Halaman harus berupa bilangan bulat positif");
  }
  if (!isPositiveInteger(batas) || Number(batas) > maxBatas) {
    errors.push(`Batas per halaman harus bilangan bulat 1-${maxBatas}`);
  }

  return {
    errors,
    filters: {
      cari: typeof cari === "string" ? cari.trim() || undefined : undefined,
      kategori,
      halaman: Number(halaman),
      batas: Number(batas),
    },
  };
};

module.exports = { validateKatalogQuery };
