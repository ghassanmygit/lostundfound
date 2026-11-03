# lostundfound
Repositori untuk Website Lost and Found oleh Kelompok 6 Rekayasa Perangkat Lunak - 3D

Tugas Praktik RPL: *Software Construction & Good Coding Practices*

## 1. Link Repository

https://github.com/ghassanmygit/lostundfound.git (branch `feature/fr-02-lapor-temuan`)

## 2. Identifikasi FR yang Dikerjakan

**FR-02 — Lapor Barang Temuan**: pengguna yang menemukan barang membuat laporan berisi data barang dan foto, serta menyebutkan pos satpam tempat barang dititipkan.

| Aspek | Keterangan |
|---|---|
| Input | `namaBarang`, `kategori`, `lokasiPenitipan` (pos satpam), `deskripsi` (opsional), `foto` (JPG/PNG, maks 2 MB) |
| Proses | Validasi input → simpan foto dengan nama aman → simpan data laporan |
| Output | `201` + data laporan, atau `400` + daftar pesan kesalahan |
| Endpoint | `POST /api/laporan-temuan`, `GET /api/laporan-temuan`, `GET /api/laporan-temuan/:id` |

### Keterkaitan dengan Rancangan Sebelumnya (UTS)

| Rancangan | Keterkaitan | Rujukan |
|---|---|---|
| Use Case | Aktor mengisi dan mengirim laporan barang temuan | UC-__ |
| Activity Diagram | Isi form → validasi → (gagal: tampil pesan error) / (berhasil: simpan laporan) | AD-__ |
| Sequence Diagram | Route → Controller → Service → Validator → Model | SD-__ |
| ERD | Entitas laporan: nama barang, kategori, lokasi penitipan, deskripsi, foto, waktu dibuat | ERD-__ |

### Komponen yang Dikembangkan

| Lapisan | File | Tanggung jawab |
|---|---|---|
| Route | `routes/laporanRoutes.js` | Memetakan URL ke controller |
| Middleware | `middlewares/parseMultipart.js`, `middlewares/errorHandler.js` | Membaca form + foto; menyeragamkan respons error |
| Controller | `controllers/laporanController.js` | Mengambil data request dan membentuk response |
| Service | `services/laporanService.js` | Aturan bisnis: validasi, simpan foto, simpan laporan |
| Model | `models/laporanModel.js` | Akses data |
| Utils | `utils/validators.js`, `utils/fileStorage.js`, `utils/appError.js` | Validasi, penyimpanan foto, error terstruktur |

Prinsip yang diterapkan: penamaan camelCase yang jelas, modularitas, Single Responsibility, tanpa duplikasi (DRY), validasi input, error handling terpusat, dan format kode yang konsisten.

## 3. Temuan Code Review dan Hasil Refactoring (Before–After)

Perilaku fungsional tidak berubah.

### Temuan 1 — `utils/validators.js`: angka ajaib dan pengecekan panjang tidak konsisten

- **Bagian kode:** validasi nama barang dan deskripsi
- **Masalah:** angka `100` dan `500` tertulis langsung di kode. Nama barang memakai helper `isWithinMaxLength`, sedangkan deskripsi menulis ulang `trim().length > 500` secara manual (logika berulang).
- **Perbaikan:** batas dijadikan konstanta bernama dan semua pengecekan memakai helper yang sama.

```js
// BEFORE
} else if (!isWithinMaxLength(data.namaBarang, 100)) {
  errors.push("Nama barang maksimal 100 karakter");
}
if (data.deskripsi && data.deskripsi.trim().length > 500) {
  errors.push("Deskripsi maksimal 500 karakter");
}

// AFTER
const maxNamaBarangLength = 100;
const maxDeskripsiLength = 500;
...
if (!isWithinMaxLength(namaBarang, maxNamaBarangLength)) {
  return [`Nama barang maksimal ${maxNamaBarangLength} karakter`];
}
if (!isWithinMaxLength(deskripsi, maxDeskripsiLength)) {
  return [`Deskripsi maksimal ${maxDeskripsiLength} karakter`];
}
```

### Temuan 2 — `utils/validators.js`: satu fungsi besar dan crash pada deskripsi non-string

- **Bagian kode:** fungsi `validateLaporanTemuan`
- **Masalah:** satu fungsi memvalidasi semua field sekaligus (melanggar Single Responsibility). Selain itu `data.deskripsi.trim()` melempar `TypeError` jika deskripsi bukan string, sehingga server error 500.
- **Perbaikan:** dipecah menjadi `validateNamaBarang`, `validateKategori`, `validateLokasiPenitipan`, `validateDeskripsi`, dan `validateFoto`. Deskripsi non-string kini ditolak dengan pesan "Deskripsi harus berupa teks".

```js
// BEFORE
const validateLaporanTemuan = (data = {}, file) => {
  const errors = [];
  if (!isFilledString(data.namaBarang)) { ... } else if (...) { ... }
  if (!allowedCategories.includes(data.kategori)) { ... }
  if (!isFilledString(data.lokasiPenitipan)) { ... }
  if (data.deskripsi && data.deskripsi.trim().length > 500) { ... }
  if (!file) { ... } else {
    if (!allowedImageTypes.includes(file.mimetype))
      errors.push("Foto harus berformat JPG atau PNG");
    if (file.size > maxImageSizeBytes) errors.push("Ukuran foto maksimal 2 MB");
  }
  return { isValid: errors.length === 0, errors };
};

// AFTER
const validateLaporanTemuan = (data = {}, file) => {
  const errors = [
    ...validateNamaBarang(data.namaBarang),
    ...validateKategori(data.kategori),
    ...validateLokasiPenitipan(data.lokasiPenitipan),
    ...validateDeskripsi(data.deskripsi),
    ...validateFoto(file),
  ];
  return { isValid: errors.length === 0, errors };
};
```

### Temuan 3 — `utils/appError.js`: error tak terduga tidak bisa dibedakan dari error yang disengaja

- **Bagian kode:** class `AppError` dan `middlewares/errorHandler.js`
- **Masalah:** `AppError` tidak punya penanda, sehingga error handler tidak bisa membedakan kesalahan input (aman ditampilkan) dari bug (detailnya tidak boleh bocor ke pengguna).
- **Perbaikan:** ditambah `name`, `isOperational`, dan `Error.captureStackTrace`. `errorHandler` hanya menampilkan pesan asli untuk error `isOperational`; selain itu dibalas "Terjadi kesalahan pada server".

```js
// BEFORE
class AppError extends Error {
  constructor(message, statusCode = 500, details = []) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

// AFTER
class AppError extends Error {
  constructor(message, statusCode = 500, details = []) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
```

### Temuan 4 — Repository: `node_modules` ikut ter-commit dan `.gitignore` tidak berfungsi

- **Bagian kode:** `.gitignore`
- **Masalah:** isi `.gitignore` berupa komentar dan perintah, bukan aturan ignore, sehingga seluruh `node_modules` masuk repository.
- **Perbaikan:** `.gitignore` diisi `node_modules/`, `.env`, dan `uploads/`, lalu `node_modules` dilepas dari git dengan `git rm -r --cached node_modules`.

## 4. Hasil Pengujian

Dijalankan dengan `npm test` (`tests/laporanTemuan.test.js`).

| ID | FR | Langkah | Sesuai | Tidak sesuai |
|---|---|---|---|---|
| TC-01 | FR-02 | Kirim form valid + foto PNG → respons 201, foto tersimpan | [x] | [ ] |
| TC-02 | FR-02 | Ambil laporan lewat `GET /:id` → data sama dengan yang dikirim | [x] | [ ] |
| TC-03 | FR-02 | Nama barang kosong → 400 "Nama barang wajib diisi" | [x] | [ ] |
| TC-04 | FR-02 | Kategori di luar daftar → 400 | [x] | [ ] |
| TC-05 | FR-02 | Tanpa foto → 400 "Foto barang wajib diunggah" | [x] | [ ] |
| TC-06 | FR-02 | Foto berformat GIF → 400 | [x] | [ ] |
| TC-07 | FR-02 | Foto 3 MB → 400 "Ukuran foto maksimal 2 MB" | [x] | [ ] |
| TC-08 | FR-02 | Kirim JSON (bukan multipart) → 415 | [x] | [ ] |
| TC-09 | FR-02 | Nama barang `'; DROP TABLE laporan; --` → tersimpan sebagai teks biasa | [x] | [ ] |
| TC-10 | FR-02 | Kategori `elektronik' OR '1'='1` → 400, tidak ada data tersimpan | [x] | [ ] |
| TC-11 | FR-02 | Nama 100 karakter lolos, 101 karakter ditolak | [x] | [ ] |
| TC-12 | FR-02 | Nama file `../../evil.png` dan deskripsi `<script>`/emoji → nama file diganti UUID, teks tersimpan apa adanya | [x] | [ ] |
| TC-13 | FR-02 | `GET /abc` → 400, `GET /999` → 404 | [x] | [ ] |

Pengelompokan sesuai ketentuan tugas: Normal case (TC-01 sampai TC-02), Invalid input (TC-03 sampai TC-08), Edge case (TC-09 sampai TC-13).
