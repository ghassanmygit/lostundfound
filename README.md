# Lost & Found — FR-01 Autentikasi dan FR-02 Lapor Barang Temuan

Repositori untuk Website Lost and Found oleh **Kelompok 6 Rekayasa Perangkat Lunak - 3D**.

**Anggota:**
1. Faiz Abyakta Santoso (NIM. 1251420135) — Ketua
2. Fandy Ahmad Fahrezy (NIM. 1251420098)
3. Muhammad Ghassan Dzul Hannan (NIM. 1251420089)
4. Yazid Dio Alamgir (NIM. 1251420097)

Tugas Praktik RPL: **Software Construction & Good Coding Practices**

## 1. Link Repository

https://github.com/ghassanmygit/lostundfound

| Branch | Isi |
|---|---|
| `feature/fr-02-lapor-temuan` | FR-02: lapor barang temuan |
| `feature/fr-01-login` | FR-01: registrasi, verifikasi email, login (dibuat di atas FR-02, sudah memuat FR-02) |

## 2. Identifikasi FR yang Dikerjakan

### FR-01 — Autentikasi (UC-01 Registrasi Akun dan UC-02 Login Sistem)

Hanya warga kampus yang boleh memakai sistem. Pengguna mendaftar dengan email domain kampus, memverifikasi email lewat tautan, lalu login dengan email dan kata sandi. Hasil login berupa token yang membawa `idPengguna` dan `role`, sehingga fitur lain (misalnya pelaporan) tahu siapa pengguna yang sedang aktif tanpa menerimanya dari form.

| Endpoint | Fungsi |
|---|---|
| `POST /api/auth/registrasi` | Mendaftar (`nama`, `email`, `password`, `noWa` opsional). Akun berstatus `pending` |
| `GET /api/auth/verifikasi?token=...` | Mengaktifkan akun lewat tautan verifikasi |
| `POST /api/auth/login` | Memeriksa kredensial dan status akun, mengembalikan token |
| `GET /api/auth/saya` | Menampilkan `idPengguna` dan `role` dari token (rute terlindungi) |

| Aspek | Keterangan |
|---|---|
| Input registrasi | `nama` (maks 100 karakter), `email` (domain kampus), `password` (8-72 karakter), `noWa` (opsional, 8-15 digit) |
| Proses | Validasi → cek email belum terdaftar → hash kata sandi (bcrypt) → simpan akun `pending` dengan token verifikasi → kirim tautan verifikasi |
| Output | `201` registrasi; `200` verifikasi dan login; `400/401/403/409` untuk kesalahan |

**Keputusan implementasi**
- Sesi memakai token JWT (stateless) yang dikirim lewat header `Authorization: Bearer <token>`.
- Semua pendaftar otomatis berperan `civitas`. Akun `satpam` dibuat manual oleh admin lewat database, agar tidak ada yang bisa mendaftar sendiri sebagai satpam.
- Pesan kesalahan login untuk "email tidak ada" dan "kata sandi salah" sengaja sama (`Kredensial tidak valid`) agar tidak membocorkan email yang terdaftar.
- Kata sandi tidak pernah disimpan atau dikembalikan dalam bentuk asli (hanya hash bcrypt).

### FR-02 — Manajemen Laporan, bagian Lapor Barang Temuan (UC-04)

Pengguna yang sudah login membuat laporan awal barang temuan berisi nama barang, foto, dan pos satpam tempat barang dititipkan. Laporan disimpan dengan status "Menunggu Verifikasi" sampai Satpam memverifikasi barang fisiknya. `idPengguna` pelapor diambil dari token login, bukan dari form.

| Aspek | Keterangan |
|---|---|
| Endpoint | `POST /api/laporan/temuan` (`multipart/form-data`, wajib login) |
| Input | `namaBarang` (maks 100 karakter), `kategori`, `lokasiPenitipan` (pos satpam, maks 150 karakter), `deskripsi` (opsional, maks 500 karakter), `fotoBarang` (JPG/PNG, maks 5 MB) |
| Proses | Cek login → upload foto → validasi input → simpan ke tabel `laporan` → ambil kembali data laporan |
| Output sukses | `201` + data laporan dengan status "Menunggu Verifikasi" |
| Output gagal | `401` tanpa login; `400` + daftar pesan kesalahan; `500` untuk kesalahan server |

### Keterkaitan dengan Rancangan UTS (Dokumen Final Kelompok 6)

| Rancangan | Keterkaitan | Rujukan |
|---|---|---|
| Kebutuhan | FR-01: daftar dengan email kampus, verifikasi lewat tautan, login. FR-02: formulir laporan barang (foto, nama, pos satpam) | FR-01 dan FR-02 (Bab 2.2) |
| Use Case | UC-01 (A1 domain bukan kampus, A2 email sudah terdaftar, A3 gagal kirim email), UC-02 (A1 kredensial tidak valid, A2 akun belum aktif), UC-04 (A1 format/ukuran foto, A2 pos satpam kosong) | Bab 3.2 |
| Activity Diagram | Alur Civitas Akademika dan Sistem Web untuk registrasi, login, dan lapor temuan | Bab 3.3 |
| Sequence Diagram | Fase 1: form temuan → `submitLaporan()` → Controller → simpan ke Database dengan status Pending | Bab 3.4 |
| ERD | Tabel `PENGGUNA` dan `LAPORAN` | Bab 3.5 |

### Penyesuaian terhadap rancangan dan ERD

| Hal | Rancangan UTS | Implementasi | Alasan |
|---|---|---|---|
| Kolom `pengguna` | `id_pengguna`, `nama`, `email`, `role`, `no_wa` | Ditambah `password_hash`, `status_akun`, `token_verifikasi` | Dibutuhkan UC-01/UC-02 untuk kata sandi, status `pending`/`aktif`, dan tautan verifikasi |
| Kolom `laporan` | `id_laporan`, `id_pelapor`, `nama_barang`, `deskripsi`, `kategori`, `status` | Ditambah `jenis_laporan`, `lokasi_penitipan`, `tanggal`, `foto_barang` | Dibutuhkan UC-04 (pos satpam, foto) dan FR-03 (tanggal). Narasi ERD menyebut jenis laporan dan tanggal, tetapi tidak tergambar |
| Pengiriman email verifikasi (UC-01 langkah 3, A3) | Tautan dikirim ke email pendaftar | Tautan dicetak di terminal server | Belum ada layanan email. Alur sama, tinggal diganti dengan `nodemailer`. Alternatif A3 (gagal kirim email) belum berlaku |
| Pengalihan ke dasbor sesuai peran (UC-02 langkah 3) | Sistem membuka sesi dan mengarahkan ke dasbor | API mengembalikan token dan `role` | Pengalihan halaman dilakukan frontend |
| Sesi | "Sesi (session)" | Token JWT | Lebih sederhana untuk frontend terpisah |

### Skema Database (MySQL 8)

```sql
CREATE DATABASE IF NOT EXISTS lostundfound CHARACTER SET utf8mb4;
USE lostundfound;

CREATE TABLE IF NOT EXISTS pengguna (
  id_pengguna INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL,
  status_akun VARCHAR(20) NOT NULL DEFAULT 'pending',
  no_wa VARCHAR(20) NULL,
  token_verifikasi VARCHAR(64) NULL,
  UNIQUE KEY uq_pengguna_email (email)
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
```

Membuat akun Satpam (setelah akun didaftarkan dan diverifikasi):

```sql
UPDATE pengguna SET role = 'satpam' WHERE email = 'email-satpam@uinjkt.ac.id';
```

### Komponen yang Dikembangkan

| Lapisan | File | Tanggung jawab |
|---|---|---|
| Entry point | `app.js` | Menyiapkan Express, route, dan error handler |
| Route | `routes/authRoutes.js`, `routes/laporanRoutes.js` | Memetakan URL ke controller dan middleware |
| Controller | `controllers/authController.js`, `controllers/laporanController.js` | Mengambil data request dan membentuk response |
| Service | `services/authService.js`, `services/laporanService.js` | Aturan bisnis: registrasi, verifikasi, login, pembuatan laporan |
| Model | `models/penggunaModel.js`, `models/laporanModel.js` | Akses data memakai prepared statement (`?`) |
| Utils | `utils/validators.js`, `utils/authValidators.js` | Validasi input laporan dan autentikasi |
| Utils | `utils/token.js`, `utils/authMiddleware.js` | Membuat dan memeriksa token; `requireAuth` dan `requireRole` |
| Utils | `utils/upload.js` | Upload foto (multer): batas ukuran, nama file acak |
| Utils | `utils/errorHandler.js`, `utils/appError.js`, `utils/db.js` | Penanganan error terpusat dan koneksi pool MySQL |

Prinsip yang diterapkan: penamaan camelCase, pemisahan tanggung jawab per lapisan (SRP), konstanta alih-alih angka langsung (DRY), validasi input sebelum menyentuh database, query berparameter untuk mencegah SQL injection, kata sandi di-hash, dan error handling terpusat.

### Cara Menjalankan

```bash
npm install
# salin .env.example menjadi .env lalu isi nilainya
npm run dev
```

Isi `.env`:

| Variabel | Keterangan |
|---|---|
| `PORT` | Port server (mis. 3001) |
| `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Koneksi MySQL |
| `JWT_SECRET` | Kunci rahasia penandatangan token (teks acak yang panjang) |
| `JWT_EXPIRES_IN` | Masa berlaku token (mis. `1d`) |
| `ALLOWED_EMAIL_DOMAINS` | Domain email kampus, dipisah koma (mis. `mhs.uinjkt.ac.id,uinjkt.ac.id`) |
| `APP_BASE_URL` | Alamat dasar untuk tautan verifikasi |

File `.env` tidak ikut di-commit. Tautan verifikasi muncul di terminal server dengan awalan `[VERIFIKASI]`.

### Batasan Saat Ini

- Tautan verifikasi belum dikirim lewat email (dicetak di terminal server).
- Yang diimplementasikan untuk pelaporan hanya barang temuan (UC-04). Laporan barang hilang (UC-03), verifikasi Satpam (UC-05), daftar laporan milik pengguna, dan fitur lain di luar cakupan tugas ini.
- Tipe foto dicek dari `mimetype` yang dikirim klien, belum dari isi file.
- Belum ada fitur lupa kata sandi, kirim ulang tautan verifikasi, dan pembatasan jumlah percobaan login.

## 3. Temuan Code Review dan Hasil Refactoring (Before–After)

Setiap perbaikan di-commit terpisah sehingga before–after dapat dilihat pada riwayat git.

### Temuan 1 — `lokasiPenitipan` tanpa batas panjang (validasi tidak lengkap)

- **Bagian kode:** `validateLaporanTemuan` di `utils/validators.js`
- **Masalah:** kolom `lokasi_penitipan` bertipe `VARCHAR(150)`, tetapi validator hanya mengecek "tidak kosong". Input lebih dari 150 karakter lolos validasi dan baru ditolak database sebagai error, sehingga pengguna menerima pesan server error alih-alih pesan validasi yang jelas.
- **Perbaikan:** menambahkan pengecekan panjang memakai fungsi `isWithinMaxLength` yang sudah ada.
- **Jenis perubahan:** perbaikan bug (input terlalu panjang kini menghasilkan 400, bukan error server).

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

- **Bagian kode:** validasi `namaBarang` dan `deskripsi` di `utils/validators.js`
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

- **Bagian kode:** `utils/validators.js` dan `utils/errorHandler.js`
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

- **Bagian kode:** `services/laporanService.js`
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

### Temuan 5 — Identitas pelapor dipercaya dari form (celah keamanan)

- **Bagian kode:** `controllers/laporanController.js`, `services/laporanService.js`, `utils/validators.js`, `routes/laporanRoutes.js`
- **Masalah:** `idPengguna` dikirim klien lewat form dan langsung dipakai sebagai pemilik laporan. Siapa pun bisa membuat laporan atas nama pengguna lain hanya dengan mengganti angka tersebut, dan validator hanya mengecek bahwa nilainya bilangan bulat positif.
- **Perbaikan:** rute dilindungi `requireAuth`; `idPengguna` diambil dari token login (`req.user.idPengguna`) dan diteruskan sebagai parameter service. Validasi `idPengguna` dari form dihapus, dan field itu diabaikan jika tetap dikirim.
- **Jenis perubahan:** perbaikan keamanan (perilaku berubah: laporan kini wajib login).

```js
// BEFORE
// routes/laporanRoutes.js
router.post("/temuan", uploadFotoBarang, laporanController.createLaporanTemuan);
// controllers/laporanController.js
const laporan = await laporanService.createLaporanTemuan(req.body, req.file);
// services/laporanService.js
const createLaporanTemuan = async (data, file) => { ...
  idPengguna: Number(data.idPengguna),
// utils/validators.js
const idPengguna = Number(data.idPengguna);
if (!Number.isInteger(idPengguna) || idPengguna <= 0) {
  errors.push("ID pengguna tidak valid");
}

// AFTER
// routes/laporanRoutes.js
router.post("/temuan", requireAuth, uploadFotoBarang, laporanController.createLaporanTemuan);
// controllers/laporanController.js
const laporan = await laporanService.createLaporanTemuan(
  req.user.idPengguna, req.body, req.file,
);
// services/laporanService.js
const createLaporanTemuan = async (idPengguna, data, file) => { ...
  idPengguna,
// utils/validators.js: validasi idPengguna dihapus
```

### Perbaikan lain (konfigurasi dan penamaan)

- **Penamaan file:** semua file diganti ke camelCase tanpa mengubah isi (`laporancontrollers.js` → `laporanController.js`, `laporanmodels.js` → `laporanModel.js`, `laporanroutes.js` → `laporanRoutes.js`, `laporanservices.js` → `laporanService.js`, `apperror.js` → `appError.js`).
- **`.gitignore`:** aturan sebelumnya diawali spasi sehingga `node_modules` dan `.env` ikut ter-commit. Diperbaiki dan keduanya dilepas dari git (`git rm -r --cached`).

## 4. Hasil Pengujian

Pengujian manual dengan cURL. Lingkungan: Windows, Node.js, MySQL 8.0 lokal, database `lostundfound`.

### 4.1 FR-01 Autentikasi (6 November 2026)

| ID | FR | Jenis | Langkah | Hasil yang diharapkan | Hasil aktual | Status |
|---|---|---|---|---|---|---|
| TC-L01 | FR-01 | Normal | Registrasi dengan nama, email kampus, kata sandi valid | 201, `statusAkun` = `pending` | 201, "Registrasi berhasil. Silakan verifikasi email Anda", `role` = `civitas`, `statusAkun` = `pending` | Sesuai |
| TC-L02 | FR-01 | Normal | Buka tautan verifikasi dari terminal server | 200, akun aktif | Akun aktif (terbukti login berhasil sesudahnya) | Sesuai |
| TC-L03 | FR-01 | Normal | Login dengan akun yang sudah aktif | 200 + token | 200, token diterima | Sesuai |
| TC-L04 | FR-01 | Normal | `GET /api/auth/saya` dengan token | 200, berisi `idPengguna` dan `role` | 200, `{"idPengguna":2,"role":"civitas"}` | Sesuai |
| TC-L05 | FR-01 | Invalid | `GET /api/auth/saya` tanpa token | 401, "Anda harus login terlebih dahulu" | 401, "Anda harus login terlebih dahulu" | Sesuai |
| TC-L06 | FR-01 | Invalid | Registrasi dengan email `x@gmail.com` | 400, "Gunakan email resmi kampus yang valid" | *(isi)* | *(isi)* |
| TC-L07 | FR-01 | Invalid | Registrasi dengan email yang sudah terdaftar | 409, "Akun dengan email ini sudah ada. Silakan login" | *(isi)* | *(isi)* |
| TC-L08 | FR-01 | Invalid | Registrasi dengan kata sandi `123` dan nama kosong | 400, "Nama wajib diisi" dan "Kata sandi harus 8-72 karakter" | *(isi)* | *(isi)* |
| TC-L09 | FR-01 | Invalid | Login sebelum membuka tautan verifikasi | 403, "Akun belum aktif..." | *(isi)* | *(isi)* |
| TC-L10 | FR-01 | Invalid | Login dengan kata sandi salah | 401, "Kredensial tidak valid" | *(isi)* | *(isi)* |
| TC-L11 | FR-01 | Invalid | Verifikasi dengan `token=abc` | 400, "Tautan verifikasi tidak valid atau sudah dipakai" | *(isi)* | *(isi)* |
| TC-L12 | FR-01 | Edge (SQL injection) | Registrasi dengan email `a' OR '1'='1@mhs.uinjkt.ac.id` | 400, "Format email tidak valid" | *(isi)* | *(isi)* |
| TC-L13 | FR-01 | Edge | `GET /api/auth/saya` dengan token palsu `abc.def.ghi` | 401, "Sesi tidak valid atau sudah berakhir..." | *(isi)* | *(isi)* |

### 4.2 FR-02 Lapor Barang Temuan (3 November 2026, sebelum login ditambahkan)

Pengujian pada tabel ini dijalankan saat `idPengguna` masih dikirim lewat form. Setelah FR-01 ditambahkan, TC-07 diganti oleh TC-12 dan TC-13 (di bawah), sedangkan kasus lainnya tetap berlaku dengan tambahan header `Authorization`.

| ID | FR | Jenis | Langkah | Hasil yang diharapkan | Hasil aktual | Status |
|---|---|---|---|---|---|---|
| TC-01 | FR-02 | Normal | Kirim semua field valid + `foto.png` | 201, laporan tersimpan, status "Menunggu Verifikasi" | 201, "Laporan temuan berhasil dibuat", `idLaporan` terisi, status "Menunggu Verifikasi", foto tersimpan dengan nama acak | Sesuai |
| TC-02 | FR-02 | Invalid | `namaBarang` dikosongkan | 400, "Nama barang wajib diisi" | 400, "Validasi gagal", errors: "Nama barang wajib diisi" | Sesuai |
| TC-03 | FR-02 | Invalid | `kategori=senjata` | 400, daftar kategori yang diizinkan | 400, "Kategori harus salah satu dari: elektronik, dokumen & buku, pakaian & aksesoris, wadah makanan & minuman, lainnya" | Sesuai |
| TC-04 | FR-02 | Invalid | Tanpa file `fotoBarang` | 400, "Foto barang wajib diunggah" | 400, errors: "Foto barang wajib diunggah" | Sesuai |
| TC-05 | FR-02 | Invalid | Unggah `uji.gif` (`image/gif`) | 400, "Foto harus berformat JPG atau PNG" | 400, errors: "Foto harus berformat JPG atau PNG" | Sesuai |
| TC-06 | FR-02 | Invalid | Unggah `besar.png` (6 MB) | 400, "Ukuran foto maksimal 5 MB" | 400, "Ukuran foto maksimal 5 MB" (ditolak lebih awal oleh middleware upload, sebelum validator berjalan) | Sesuai |
| TC-07 | FR-02 | Invalid | `idPengguna=abc` | 400, "ID pengguna tidak valid" | 400, errors: "ID pengguna tidak valid" (tidak berlaku lagi setelah FR-01, digantikan TC-12 dan TC-13) | Sesuai |
| TC-08 | FR-02 | Edge (SQL injection) | `namaBarang='; DROP TABLE laporan; --` | 201, tersimpan sebagai teks biasa, tabel tetap ada | 201, `namaBarang` tersimpan persis `'; DROP TABLE laporan; --`. Tabel `laporan` tetap ada (TC-10 dan TC-11 sesudahnya berhasil menyimpan ke tabel yang sama) | Sesuai |
| TC-09 | FR-02 | Edge (SQL injection) | `kategori=elektronik' OR '1'='1` | 400, ditolak daftar kategori | 400, "Kategori harus salah satu dari: ..." | Sesuai |
| TC-10a | FR-02 | Edge (batas) | `namaBarang` 100 karakter | 201, diterima | 201, laporan tersimpan | Sesuai |
| TC-10b | FR-02 | Edge (batas) | `namaBarang` 101 karakter | 400, "Nama barang maksimal 100 karakter" | 400, errors: "Nama barang maksimal 100 karakter" | Sesuai |
| TC-11 | FR-02 | Edge (karakter khusus) | `deskripsi=<script>alert(1)</script> 😀` | 201, tersimpan apa adanya sebagai teks | 201, `deskripsi` tersimpan dan terbaca kembali sama persis, termasuk emoji | Sesuai |

### 4.3 FR-02 setelah login ditambahkan (6 November 2026)

| ID | FR | Jenis | Langkah | Hasil yang diharapkan | Hasil aktual | Status |
|---|---|---|---|---|---|---|
| TC-12 | FR-02 | Invalid | Kirim laporan tanpa header `Authorization` | 401, "Anda harus login terlebih dahulu" | *(isi)* | *(isi)* |
| TC-13 | FR-02 | Edge (keamanan) | Kirim laporan dengan token akun A dan `idPengguna` akun lain di form | 201, tersimpan atas nama akun A, field `idPengguna` diabaikan | *(isi)* | *(isi)* |
| TC-14 | FR-02 | Normal | Kirim laporan dengan token dan tanpa `idPengguna` di form | 201, `id_pelapor` sama dengan id akun yang login | *(isi)* | *(isi)* |

Catatan: query memakai prepared statement (`?`), sehingga input seperti pada TC-08 diperlakukan sebagai data, bukan perintah SQL. Karakter HTML pada TC-11 disimpan apa adanya; pencegahan XSS dilakukan saat data ditampilkan di antarmuka, di luar cakupan tugas ini.

Riwayat perintah terminal pengerjaan dan pengujian terlampir di LMS sebagai bukti pengerjaan.
