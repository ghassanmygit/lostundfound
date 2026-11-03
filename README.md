# Lost & Found — FR-02 Lapor Barang Temuan

Repositori untuk Website Lost and Found oleh **Kelompok 6 Rekayasa Perangkat Lunak - 3D**.

**Anggota:**

1. Faiz Abyakta Santoso (NIM. 1251420135) — Ketua
2. Fandy Ahmad Fahrezy (NIM. 1251420098)
3. Muhammad Ghassan Dzul Hannan (NIM. 1251420089)
4. Yazid Dio Alamgir (NIM. 1251420097)

Tugas Praktik RPL: **Software Construction & Good Coding Practices**

## 1. Link Repository

https://github.com/ghassanmygit/lostundfound (branch `feature/fr-02-lapor-temuan`)

## 2. Identifikasi FR yang Dikerjakan

**FR-02 — Manajemen Laporan, bagian Lapor Barang Temuan (UC-04).** Pengguna yang menemukan barang membuat laporan awal berisi nama barang, foto, dan pos satpam tempat barang akan dititipkan. Laporan disimpan dengan status "Menunggu Verifikasi" sampai Satpam memverifikasi barang fisiknya.

| Aspek         | Keterangan                                                                                                                                                                                  |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Endpoint      | `POST /api/laporan/temuan` (`multipart/form-data`)                                                                                                                                          |
| Input         | `idPengguna`, `namaBarang` (maks 100 karakter), `kategori`, `lokasiPenitipan` (pos satpam, maks 150 karakter), `deskripsi` (opsional, maks 500 karakter), `fotoBarang` (JPG/PNG, maks 5 MB) |
| Proses        | Upload foto → validasi input → simpan ke tabel `laporan` (MySQL) → ambil kembali data laporan yang tersimpan                                                                                |
| Output sukses | `201` + data laporan dengan status "Menunggu Verifikasi"                                                                                                                                    |
| Output gagal  | `400` + daftar pesan kesalahan; `500` untuk kesalahan server                                                                                                                                |

### Keterkaitan dengan Rancangan UTS (Dokumen Final Kelompok 6)

| Rancangan        | Keterkaitan                                                                                                                                                                 | Rujukan         |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| Kebutuhan        | Sistem menyediakan formulir laporan barang temuan (foto, nama, pos satpam)                                                                                                  | FR-02 (Bab 2.2) |
| Use Case         | Pengguna mengisi form, sistem memvalidasi lalu menyimpan laporan berstatus "Menunggu Verifikasi"; alternatif A1 (format/ukuran foto tidak valid) dan A2 (pos satpam kosong) | UC-04 (Bab 3.2) |
| Activity Diagram | Civitas Akademika mengisi form → Sistem Web menyimpan laporan dengan status menunggu verifikasi                                                                             | Bab 3.3         |
| Sequence Diagram | Fase 1: form temuan → `submitLaporan()` → Controller → simpan ke Database dengan status Pending                                                                             | Bab 3.4         |
| ERD              | Tabel `LAPORAN` dan `PENGGUNA`                                                                                                                                              | Bab 3.5         |

### Penyesuaian terhadap ERD

ERD di dokumen UTS hanya menggambar `id_laporan`, `id_pelapor`, `nama_barang`, `deskripsi`, `kategori`, `status` pada tabel `LAPORAN`. Implementasi FR-02 membutuhkan empat kolom tambahan (narasi ERD sendiri menyebut jenis laporan dan tanggal, tetapi tidak tergambar):

| Kolom              | Alasan                                                |
| ------------------ | ----------------------------------------------------- |
| `jenis_laporan`    | Membedakan laporan "temuan" dan "hilang"              |
| `lokasi_penitipan` | Pos satpam tempat barang dititipkan (UC-04 langkah 2) |
| `tanggal`          | Dipakai pencarian dan filter katalog (FR-03)          |
| `foto_barang`      | Foto yang diunggah pada UC-04                         |

Kolom kunci asing mengikuti ERD (`id_pelapor`). Pada kode, input form masih bernama `idPengguna` sampai fitur login (FR-01) tersedia.

### Skema Database (MySQL 8)

```sql
CREATE DATABASE IF NOT EXISTS lostundfound CHARACTER SET utf8mb4;
USE lostundfound;

CREATE TABLE IF NOT EXISTS pengguna (
  id_pengguna INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL,
  no_wa VARCHAR(20) NULL
);

CREATE TABLE IF NOT EXISTS laporan (
  id_laporan INT AUTO_INCREMENT PRIMARY KEY,
  id_pelapor INT NOT NULL,
  jenis_laporan VARCHAR(20) NOT NULL,
  nama_barang VARCHAR(100) NOT NULL,
  kategori VARCHAR(50) NOT NULL,
  deskripsi TEXT NULL,
  lokasi_penitipan VARCHAR(150) NOT NULL,
  tanggal DATETIME NOT NULL,
  foto_barang VARCHAR(255) NOT NULL,
  status VARCHAR(30) NOT NULL,
  FOREIGN KEY (id_pelapor) REFERENCES pengguna(id_pengguna)
);

INSERT INTO pengguna (nama, email, role, no_wa)
VALUES ('Pengguna Uji', 'uji@kampus.ac.id', 'mahasiswa', '081234567890');
```

### Komponen yang Dikembangkan

| Lapisan     | File                                         | Tanggung jawab                                     |
| ----------- | -------------------------------------------- | -------------------------------------------------- |
| Entry point | `app.js`                                     | Menyiapkan Express, route, dan error handler       |
| Route       | `routes/laporanRoutes.js`                    | Memetakan URL ke controller dan middleware upload  |
| Controller  | `controllers/laporanController.js`           | Mengambil data request dan membentuk response      |
| Service     | `services/laporanService.js`                 | Aturan bisnis: validasi dan penyimpanan laporan    |
| Model       | `models/laporanModel.js`                     | Akses data memakai prepared statement (`?`)        |
| Utils       | `utils/validators.js`                        | Validasi input sesuai aturan bisnis                |
| Utils       | `utils/upload.js`                            | Upload foto (multer): batas ukuran, nama file acak |
| Utils       | `utils/errorHandler.js`, `utils/appError.js` | Penanganan error terpusat dengan pesan seragam     |
| Utils       | `utils/db.js`                                | Koneksi pool MySQL                                 |

Prinsip yang diterapkan: penamaan camelCase, pemisahan tanggung jawab per lapisan (SRP), konstanta alih-alih angka langsung (DRY), validasi input sebelum menyentuh database, query berparameter untuk mencegah SQL injection, dan error handling terpusat.

### Cara Menjalankan

```bash
npm install
# salin .env.example menjadi .env lalu isi DB_PASSWORD
npm run dev
```

Isi `.env`: `PORT`, `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`. File `.env` tidak ikut di-commit.

### Batasan Saat Ini

- Login (FR-01) belum ada, sehingga `idPengguna` dikirim lewat form.
- Yang diimplementasikan hanya laporan barang temuan (UC-04). Laporan barang hilang (UC-03), verifikasi Satpam (UC-05), dan fitur lain di luar cakupan tugas ini.
- Tipe foto dicek dari `mimetype` yang dikirim klien, belum dari isi file.

## 3. Temuan Code Review dan Hasil Refactoring (Before–After)

Setiap perbaikan di-commit terpisah sehingga before–after dapat dilihat pada riwayat git.

### Temuan 1 — `lokasiPenitipan` tanpa batas panjang (validasi tidak lengkap)

- **Bagian kode:** `validateLaporanTemuan` di `utils/validators.js` (commit `13ac281`)
- **Masalah:** kolom `lokasi_penitipan` bertipe `VARCHAR(150)`, tetapi validator hanya mengecek "tidak kosong". Input lebih dari 150 karakter lolos validasi dan baru ditolak database sebagai error, sehingga pengguna menerima pesan server error alih-alih pesan validasi yang jelas.
- **Perbaikan:** menambahkan pengecekan panjang memakai fungsi `isWithinMaxLength` yang sudah ada.
- **Jenis perubahan:** perbaikan bug (perilaku untuk input terlalu panjang berubah dari error server menjadi 400).

```js
// BEFORE
if (!isFilledString(data.lokasiPenitipan)) {
  errors.push("Pos satpam tempat barang dititipkan wajib diisi");
}

// AFTER
if (!isFilledString(data.lokasiPenitipan)) {
  errors.push("Pos satpam tempat barang dititipkan wajib diisi");
} else if (!isWithinMaxLength(data.lokasiPenitipan, maxLokasiLength)) {
  errors.push(`Lokasi penitipan maksimal ${maxLokasiLength} karakter`);
}
```

### Temuan 2 — Angka batas panjang tersebar dan logika panjang ditulis berulang (DRY, magic number)

- **Bagian kode:** validasi `namaBarang` dan `deskripsi` di `utils/validators.js` (commit `da5009a`, `13ac281`)
- **Masalah:** angka 100 dan 500 ditulis langsung di dua tempat (kondisi dan pesan error), sehingga mengubah batas berarti mengedit dua lokasi dan pesan bisa tidak sinkron. Validasi `deskripsi` juga memakai `.trim().length > 500` sendiri, padahal sudah ada helper `isWithinMaxLength`.
- **Perbaikan:** batas didefinisikan sekali sebagai konstanta, dan semua pengecekan panjang memakai helper yang sama.
- **Jenis perubahan:** refactor murni, perilaku tidak berubah.

```js
// BEFORE
} else if (!isWithinMaxLength(data.namaBarang, 100)) {
  errors.push("Nama barang maksimal 100 karakter");
}
...
(typeof data.deskripsi !== "string" || data.deskripsi.trim().length > 500)
errors.push("Deskripsi harus berupa teks maksimal 500 karakter");

// AFTER
const maxNamaBarangLength = 100;
const maxLokasiLength = 150;
const maxDeskripsiLength = 500;
...
} else if (!isWithinMaxLength(data.namaBarang, maxNamaBarangLength)) {
  errors.push(`Nama barang maksimal ${maxNamaBarangLength} karakter`);
}
...
(typeof data.deskripsi !== "string" ||
  !isWithinMaxLength(data.deskripsi, maxDeskripsiLength))
errors.push(`Deskripsi harus berupa teks maksimal ${maxDeskripsiLength} karakter`);
```

### Temuan 3 — Batas ukuran foto ditulis di dua tempat dan tidak sesuai UC-04 (DRY)

- **Bagian kode:** `utils/validators.js` dan `utils/errorHandler.js` (commit `dff3163`, `22a4854`)
- **Masalah:** teks "2 MB" ditulis langsung di validator dan error handler, terpisah dari nilai batas sebenarnya (`2 * 1024 * 1024`). Jika batas diubah, pesan bisa tidak sinkron. Selain itu, UC-04 alternatif A1 pada rancangan UTS menyebut batas 5 MB.
- **Perbaikan:** batas didefinisikan sekali sebagai `maxImageSizeMb`, nilai byte dan pesan error diturunkan darinya, dan batas disesuaikan menjadi 5 MB.
- **Jenis perubahan:** refactor, ditambah penyesuaian nilai batas dengan rancangan.

```js
// BEFORE (validators.js)
const maxImageSizeBytes = 2 * 1024 * 1024;
...
if (file.size > maxImageSizeBytes) errors.push("Ukuran foto maksimal 2 MB");

// BEFORE (errorHandler.js)
err.code === "LIMIT_FILE_SIZE" ? "Ukuran foto maksimal 2 MB" : "Unggah file gagal";

// AFTER (validators.js)
const maxImageSizeMb = 5;
const maxImageSizeBytes = maxImageSizeMb * 1024 * 1024;
...
if (file.size > maxImageSizeBytes)
  errors.push(`Ukuran foto maksimal ${maxImageSizeMb} MB`);

// AFTER (errorHandler.js)
const { maxImageSizeMb } = require("./validators");
err.code === "LIMIT_FILE_SIZE"
  ? `Ukuran foto maksimal ${maxImageSizeMb} MB`
  : "Unggah file gagal";
```

### Temuan 4 — Status awal tidak sesuai rancangan dan ada kode tidak terpakai

- **Bagian kode:** `services/laporanService.js` (commit `516be38`)
- **Masalah:** status awal laporan bernilai `"tersedia"`, padahal UC-04 menetapkan "Menunggu Verifikasi" (laporan baru belum diverifikasi Satpam). Fungsi `getLaporanById` tidak dipakai route mana pun (kode mati), dan komentar "Sesuaikan kedua nilai ini..." adalah catatan sementara yang tertinggal.
- **Perbaikan:** status awal disesuaikan dengan rancangan, fungsi tidak terpakai dan komentar sementara dihapus.
- **Jenis perubahan:** penyesuaian nilai status dengan rancangan dan pembersihan kode.

```js
// BEFORE
// Sesuaikan kedua nilai ini dengan isi kolom jenis_laporan dan status di tabel laporan (ERD).
const jenisLaporanTemuan = "temuan";
const statusLaporanAwal = "tersedia";
...
const getLaporanById = async (idLaporan) => {
  const laporan = await laporanModel.findLaporanById(idLaporan);
  if (!laporan) throw new AppError("Laporan tidak ditemukan", 404);
  return laporan;
};
module.exports = { createLaporanTemuan, getLaporanById };

// AFTER
const jenisLaporanTemuan = "temuan";
const statusLaporanAwal = "Menunggu Verifikasi";
...
module.exports = { createLaporanTemuan };
```

### Perbaikan lain (konfigurasi dan penamaan)

- **Penamaan file:** semua file diganti ke camelCase tanpa mengubah isi (`laporancontrollers.js` → `laporanController.js`, `laporanmodels.js` → `laporanModel.js`, `laporanroutes.js` → `laporanRoutes.js`, `laporanservices.js` → `laporanService.js`, `apperror.js` → `appError.js`).
- **`.gitignore`:** aturan sebelumnya diawali spasi sehingga `node_modules` dan `.env` ikut ter-commit. Diperbaiki dan keduanya dilepas dari git (`git rm -r --cached`).

## 4. Hasil Pengujian

Pengujian manual dengan cURL ke `POST /api/laporan/temuan` pada 3 November 2026. Lingkungan: Windows, Node.js, MySQL 8.0 lokal, database `lostundfound`. Pengguna uji: `id_pengguna = 1`.

| ID     | FR    | Jenis                  | Langkah                                  | Hasil yang diharapkan                                | Hasil aktual                                                                                                                                                 | Status |
| ------ | ----- | ---------------------- | ---------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ |
| TC-01  | FR-02 | Normal                 | Kirim semua field valid + `foto.png`     | 201, laporan tersimpan, status "Menunggu Verifikasi" | 201, "Laporan temuan berhasil dibuat", `idLaporan` terisi, status "Menunggu Verifikasi", foto tersimpan dengan nama acak                                     | Sesuai |
| TC-02  | FR-02 | Invalid                | `namaBarang` dikosongkan                 | 400, "Nama barang wajib diisi"                       | 400, "Validasi gagal", errors: "Nama barang wajib diisi"                                                                                                     | Sesuai |
| TC-03  | FR-02 | Invalid                | `kategori=senjata`                       | 400, daftar kategori yang diizinkan                  | 400, "Kategori harus salah satu dari: elektronik, dokumen & buku, pakaian & aksesoris, wadah makanan & minuman, lainnya"                                     | Sesuai |
| TC-04  | FR-02 | Invalid                | Tanpa file `fotoBarang`                  | 400, "Foto barang wajib diunggah"                    | 400, errors: "Foto barang wajib diunggah"                                                                                                                    | Sesuai |
| TC-05  | FR-02 | Invalid                | Unggah `uji.gif` (`image/gif`)           | 400, "Foto harus berformat JPG atau PNG"             | 400, errors: "Foto harus berformat JPG atau PNG"                                                                                                             | Sesuai |
| TC-06  | FR-02 | Invalid                | Unggah `besar.png` (6 MB)                | 400, "Ukuran foto maksimal 5 MB"                     | 400, "Ukuran foto maksimal 5 MB" (ditolak lebih awal oleh middleware upload, sebelum validator berjalan)                                                     | Sesuai |
| TC-07  | FR-02 | Invalid                | `idPengguna=abc`                         | 400, "ID pengguna tidak valid"                       | 400, errors: "ID pengguna tidak valid"                                                                                                                       | Sesuai |
| TC-08  | FR-02 | Edge (SQL injection)   | `namaBarang='; DROP TABLE laporan; --`   | 201, tersimpan sebagai teks biasa, tabel tetap ada   | 201, `namaBarang` tersimpan persis `'; DROP TABLE laporan; --`. Tabel `laporan` tetap ada (TC-10 dan TC-11 sesudahnya berhasil menyimpan ke tabel yang sama) | Sesuai |
| TC-09  | FR-02 | Edge (SQL injection)   | `kategori=elektronik' OR '1'='1`         | 400, ditolak daftar kategori                         | 400, "Kategori harus salah satu dari: ..."                                                                                                                   | Sesuai |
| TC-10a | FR-02 | Edge (batas)           | `namaBarang` 100 karakter                | 201, diterima                                        | 201, laporan tersimpan                                                                                                                                       | Sesuai |
| TC-10b | FR-02 | Edge (batas)           | `namaBarang` 101 karakter                | 400, "Nama barang maksimal 100 karakter"             | 400, errors: "Nama barang maksimal 100 karakter"                                                                                                             | Sesuai |
| TC-11  | FR-02 | Edge (karakter khusus) | `deskripsi=<script>alert(1)</script> 😀` | 201, tersimpan apa adanya sebagai teks               | 201, `deskripsi` tersimpan dan terbaca kembali sama persis, termasuk emoji                                                                                   | Sesuai |

**Ringkasan:** 12 skenario uji dijalankan (TC-01 sampai TC-11, dengan TC-10 dibagi dua), seluruhnya berstatus Sesuai.

Catatan: query memakai prepared statement (`?`), sehingga input seperti pada TC-08 diperlakukan sebagai data, bukan perintah SQL. Karakter HTML pada TC-11 disimpan apa adanya; pencegahan XSS dilakukan saat data ditampilkan di antarmuka, di luar cakupan FR-02.

## 5. Daftar Kontribusi Anggota

| Anggota                      | Kontribusi                                         |
| ---------------------------- | -------------------------------------------------- |
| Faiz Abyakta Santoso         | _(models, routes)_                                 |
| Fandy Ahmad Fahrezy          | _(controllers, utils)_                             |
| Muhammad Ghassan Dzul Hannan | _(validasi, perbaikan code review, dan pengujian)_ |
| Yazid Dio Alamgir            | _(README dan service)_                             |
