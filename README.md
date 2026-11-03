# lostundfound
Repositori untuk Website Lost and Found oleh Kelompok 6 Rekayasa Perangkat Lunak - 3D

Tugas Praktik RPL: *Software Construction & Good Coding Practices*

## 1. Link Repository

https://github.com/ghassanmygit/lostundfound.git (branch `feature/fr-02-lapor-temuan`)

## 2. Identifikasi FR yang Dikerjakan

**FR-02 — Lapor Barang Temuan**: pengguna yang menemukan barang membuat laporan berisi data barang dan foto, serta menyebutkan pos satpam tempat barang dititipkan.

| Aspek | Keterangan |
|---|---|
| Endpoint | `POST /api/laporan/temuan` (`multipart/form-data`) |
| Input | `idPengguna`, `namaBarang`, `kategori`, `lokasiPenitipan` (pos satpam), `deskripsi` (opsional), `fotoBarang` (file JPG/PNG, maks 2 MB) |
| Proses | Upload foto → validasi input → simpan ke tabel `laporan` (MySQL) → ambil kembali data laporan yang tersimpan |
| Output sukses | `201` + data laporan |
| Output gagal | `400` + daftar pesan kesalahan; `500` untuk kesalahan server |

### Keterkaitan dengan Rancangan Sebelumnya (UTS)

| Rancangan | Keterkaitan | Rujukan |
|---|---|---|
| Use Case | Pengguna mengisi dan mengirim laporan barang temuan | UC-__ |
| Activity Diagram | Isi form → validasi → (gagal: tampil pesan error) / (berhasil: simpan laporan) | AD-__ |
| Sequence Diagram | Route → Controller → Service → Validator → Model → Database | SD-__ |
| ERD | Tabel `laporan`: `id_laporan`, `id_pengguna`, `jenis_laporan`, `nama_barang`, `kategori`, `deskripsi`, `lokasi`, `tanggal`, `foto_barang`, `status` | ERD-__ |

### Komponen yang Dikembangkan

| Lapisan | File | Tanggung jawab |
|---|---|---|
| Route | `routes/laporanRoutes.js` | Memetakan URL ke controller dan middleware upload |
| Controller | `controllers/laporanController.js` | Mengambil data request dan membentuk response |
| Service | `services/laporanService.js` | Aturan bisnis: validasi dan penyimpanan laporan |
| Model | `models/laporanModel.js` | Akses data ke database memakai prepared statement |
| Utils | `utils/validators.js` | Validasi input sesuai aturan bisnis |
| Utils | `utils/upload.js` | Upload foto (multer): batas 2 MB, nama file acak |
| Utils | `utils/errorHandler.js`, `utils/appError.js` | Penanganan error terpusat dengan pesan yang seragam |
| Utils | `utils/db.js` | Koneksi MySQL |

Prinsip yang diterapkan: penamaan camelCase, pemisahan kode per tanggung jawab (route, controller, service, model), validasi input, dan error handling terpusat.

## 3. Temuan Code Review dan Hasil Refactoring (Before–After)

### Temuan 1 — `.gitignore`: aturan tidak berfungsi sehingga `node_modules` ikut ter-commit

- **Bagian kode:** `.gitignore`
- **Masalah:** awalnya isi file berupa komentar dan perintah, lalu setelah diperbaiki setiap barisnya masih diawali spasi sehingga aturan ignore tetap tidak terbaca. Akibatnya `node_modules` dan `.env` ikut masuk repository.
- **Perbaikan:** aturan ditulis tanpa spasi di depan, dan `node_modules` dilepas dari git dengan `git rm -r --cached node_modules`.

```
# BEFORE
   node_modules
   .env
   uploads

# AFTER
node_modules
.env
uploads
```

### Temuan 2 — `utils/validators.js`: validasi deskripsi crash jika bukan teks

- **Bagian kode:** validasi `deskripsi` pada `validateLaporanTemuan`
- **Masalah:** `data.deskripsi.trim()` melempar `TypeError` bila deskripsi bukan string, sehingga server mengembalikan error 500 alih-alih pesan validasi.
- **Perbaikan:** tipe data dicek lebih dulu, dan nilai yang tidak valid ditolak dengan pesan validasi yang jelas.

```js
// BEFORE
if (data.deskripsi && data.deskripsi.trim().length > 500) {
  errors.push("Deskripsi maksimal 500 karakter");
}

// AFTER
if (
  data.deskripsi !== undefined &&
  (typeof data.deskripsi !== "string" || data.deskripsi.trim().length > 500)
) {
  errors.push("Deskripsi harus berupa teks maksimal 500 karakter");
}
```

### Temuan 3 — Nama file tidak konsisten (Meaningful Naming)

- **Bagian kode:** nama file pada folder `controllers`, `models`, `routes`, `services`, dan `utils`
- **Masalah:** nama file memakai huruf kecil semua (`laporancontrollers.js`), tidak sesuai ketentuan camelCase dan sulit dibaca. Nama jamak (`controllers`, `models`) juga tidak konsisten dengan nama class/objek yang dikandungnya.
- **Perbaikan:** semua file diganti nama ke camelCase tanpa mengubah isi (`git mv`).

| Before | After |
|---|---|
| `controllers/laporancontrollers.js` | `controllers/laporanController.js` |
| `models/laporanmodels.js` | `models/laporanModel.js` |
| `routes/laporanroutes.js` | `routes/laporanRoutes.js` |
| `services/laporanservices.js` | `services/laporanService.js` |
| `utils/apperror.js` | `utils/appError.js` |

## 4. Hasil Pengujian

Pengujian dilakukan manual lewat Postman/cURL ke `POST /api/laporan/temuan`. Centang kolom yang sesuai setelah pengujian dijalankan.

| ID | FR | Jenis | Langkah | Hasil yang diharapkan | Sesuai | Tidak sesuai |
|---|---|---|---|---|---|---|
| TC-01 | FR-02 | Normal | Kirim semua field valid + foto PNG | 201, "Laporan temuan berhasil dibuat" | [ ] | [ ] |
| TC-02 | FR-02 | Invalid | `namaBarang` dikosongkan | 400, "Nama barang wajib diisi" | [ ] | [ ] |
| TC-03 | FR-02 | Invalid | `kategori` diisi `senjata` | 400, pesan daftar kategori yang diizinkan | [ ] | [ ] |
| TC-04 | FR-02 | Invalid | Tanpa file `fotoBarang` | 400, "Foto barang wajib diunggah" | [ ] | [ ] |
| TC-05 | FR-02 | Invalid | Unggah foto berformat GIF | 400, "Foto harus berformat JPG atau PNG" | [ ] | [ ] |
| TC-06 | FR-02 | Invalid | Unggah foto lebih dari 2 MB | 400, "Ukuran foto maksimal 2 MB" | [ ] | [ ] |
| TC-07 | FR-02 | Invalid | `idPengguna` diisi `abc` | 400, "ID pengguna tidak valid" | [ ] | [ ] |
| TC-08 | FR-02 | Edge | `namaBarang` diisi `'; DROP TABLE laporan; --` | 201, tersimpan sebagai teks biasa, tabel tetap ada | [ ] | [ ] |
| TC-09 | FR-02 | Edge | `kategori` diisi `elektronik' OR '1'='1` | 400, ditolak oleh daftar kategori | [ ] | [ ] |
| TC-10 | FR-02 | Edge | `namaBarang` 100 karakter, lalu 101 karakter | 100 karakter diterima (201), 101 ditolak (400) | [ ] | [ ] |
| TC-11 | FR-02 | Edge | `deskripsi` diisi `<script>alert(1)</script>` dan emoji | 201, tersimpan apa adanya sebagai teks | [ ] | [ ] |
