# Lost & Found — Website Barang Hilang dan Temuan

Repositori untuk Website Lost and Found oleh **Kelompok 6 Rekayasa Perangkat Lunak - 3D**. Sistem terdiri dari backend (Node.js, Express, MySQL) dan frontend (React, Vite) yang mencakup FR-01 (Autentikasi), FR-02 (Manajemen Laporan), FR-03 (Katalog dan Pencarian), FR-04 (Pengajuan Klaim), FR-05 (Validasi Klaim), FR-06 (Manajemen Loker), FR-07 (Verifikasi Laporan Temuan), dan FR-09 (Konfirmasi Penjemputan). FR-08 (Notifikasi) belum dikerjakan.

**Anggota:**

1. Faiz Abyakta Santoso (NIM. 1251420135) — Ketua
2. Fandy Ahmad Fahrezy (NIM. 1251420098)
3. Muhammad Ghassan Dzul Hannan (NIM. 1251420089)
4. Yazid Dio Alamgir (NIM. 1251420097)

Tugas Praktik RPL: **Software Construction & Good Coding Practices**

## 1. Link Repository

https://github.com/ghassanmygit/lostundfound

| Branch     | Isi                                                  |
| ---------- | ---------------------------------------------------- |
| `main`     | Versi stabil (penggabungan `backend` dan `frontend`) |
| `backend`  | Seluruh kode API di folder `backend/`                |
| `frontend` | Antarmuka web React + Vite di folder `frontend/`     |

Riwayat commit tiap fitur dapat dilihat lewat awalan pesan commit (mis. `feat(FR-03): ...`).

## 2. Identifikasi FR yang Dikerjakan

| FR    | Nama                      | Use Case                                             | Status                                                   |
| ----- | ------------------------- | ---------------------------------------------------- | -------------------------------------------------------- |
| FR-01 | Autentikasi               | UC-01 Registrasi Akun, UC-02 Login Sistem            | Selesai                                                  |
| FR-02 | Manajemen Laporan         | UC-03 Lapor Barang Hilang, UC-04 Lapor Barang Temuan | Selesai                                                  |
| FR-03 | Katalog dan Pencarian     | Katalog barang temuan                                | Selesai                                                  |
| FR-04 | Pengajuan Klaim           | Civitas mengajukan klaim atas barang temuan          | Selesai                                                  |
| FR-05 | Validasi Klaim            | Satpam menyetujui atau menolak klaim                 | Selesai                                                  |
| FR-06 | Manajemen Loker           | UC-05                                                | Selesai (penempatan dan pengosongan loker saat serah)    |
| FR-07 | Verifikasi Laporan Temuan | UC-05 Input dan Penempatan Loker                     | Selesai                                                  |
| FR-09 | Konfirmasi Penjemputan    | Satpam menyerahkan barang kepada pemilik             | Selesai                                                  |
| FR-08 | Notifikasi                | Pemberitahuan ke pengguna                            | Belum dikerjakan                                         |

### FR-01 — Autentikasi (UC-01 Registrasi Akun dan UC-02 Login Sistem)

Hanya warga kampus yang boleh memakai sistem. Pengguna mendaftar dengan email domain kampus, memverifikasi email lewat tautan, lalu login dengan email dan kata sandi. Hasil login berupa token yang membawa `idPengguna` dan `role`, sehingga fitur lain tahu siapa pengguna yang sedang aktif tanpa menerimanya dari form.

| Endpoint                             | Fungsi                                                                             |
| ------------------------------------ | ---------------------------------------------------------------------------------- |
| `POST /api/auth/registrasi`          | Mendaftar (`nama`, `email`, `password`, `noWa` opsional). Akun berstatus `pending` |
| `GET /api/auth/verifikasi?token=...` | Mengaktifkan akun lewat tautan verifikasi                                          |
| `POST /api/auth/login`               | Memeriksa kredensial dan status akun, mengembalikan token                          |
| `GET /api/auth/saya`                 | Menampilkan `idPengguna` dan `role` dari token (rute terlindungi)                  |

| Aspek            | Keterangan                                                                                                                                |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Input registrasi | `nama` (maks 100 karakter), `email` (domain kampus), `password` (8-72 karakter), `noWa` (opsional, 8-15 digit)                            |
| Proses           | Validasi → cek email belum terdaftar → hash kata sandi (bcrypt) → simpan akun `pending` dengan token verifikasi → kirim tautan verifikasi |
| Output           | `201` registrasi; `200` verifikasi dan login; `400/401/403/409` untuk kesalahan                                                           |

**Keputusan implementasi**

- Sesi memakai token JWT (stateless) yang dikirim lewat header `Authorization: Bearer <token>`.
- Semua pendaftar otomatis berperan `civitas`. Akun `satpam` dibuat manual oleh admin lewat database, agar tidak ada yang bisa mendaftar sendiri sebagai satpam.
- Pesan kesalahan login untuk "email tidak ada" dan "kata sandi salah" sengaja sama (`Kredensial tidak valid`) agar tidak membocorkan email yang terdaftar.
- Kata sandi tidak pernah disimpan atau dikembalikan dalam bentuk asli (hanya hash bcrypt).

### FR-02 — Manajemen Laporan (UC-03 Lapor Barang Hilang dan UC-04 Lapor Barang Temuan)

Pengguna yang sudah login dapat melaporkan barang temuan maupun barang hilang, dan melihat daftar laporannya sendiri. `idPengguna` pelapor selalu diambil dari token login, bukan dari form.

| Endpoint                   | Akses                 | Fungsi                                                                           |
| -------------------------- | --------------------- | -------------------------------------------------------------------------------- |
| `POST /api/laporan/temuan` | Login                 | Laporan barang temuan (`multipart/form-data`), status awal "Menunggu Verifikasi" |
| `POST /api/laporan/hilang` | Login, role `civitas` | Laporan barang hilang (JSON), status awal "Dicari"                               |
| `GET /api/laporan/saya`    | Login                 | Daftar laporan milik pengguna yang sedang login, terbaru lebih dulu              |

| Aspek         | Laporan temuan (UC-04)                                                                                                                             | Laporan hilang (UC-03)                                                                                                                       |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Input         | `namaBarang` (maks 100), `kategori`, `lokasiPenitipan` (pos satpam, maks 150), `deskripsi` (opsional, maks 500), `fotoBarang` (JPG/PNG, maks 5 MB) | `namaBarang` (maks 100), `kategori`, `lokasiTerakhir` (maks 150), `kontak` (8-15 digit, boleh diawali `+`), `deskripsi` (opsional, maks 500) |
| Proses        | Cek login → upload foto → validasi → simpan ke `laporan` → ambil kembali data                                                                      | Cek login dan role → validasi → simpan ke `laporan` → ambil kembali data                                                                     |
| Output sukses | `201` + data laporan, status "Menunggu Verifikasi"                                                                                                 | `201` + data laporan, status "Dicari"                                                                                                        |
| Output gagal  | `401` tanpa login; `400` + daftar pesan kesalahan; `500` kesalahan server                                                                          | `401` tanpa login; `403` bila bukan `civitas`; `400` + daftar pesan kesalahan                                                                |

### FR-03 — Katalog dan Pencarian

Pengguna yang sudah login dapat melihat daftar barang temuan yang sudah diverifikasi Satpam, mencari berdasarkan kata kunci, menyaring berdasarkan kategori, dan membuka detail satu barang. Hanya laporan temuan berstatus "Tersedia" yang tampil, sehingga laporan yang masih menunggu verifikasi, ditolak, atau berjenis hilang tidak pernah muncul di katalog.

| Endpoint                  | Akses  | Fungsi                                                                             |
| ------------------------- | ------ | ---------------------------------------------------------------------------------- |
| `GET /api/katalog`        | Login  | Daftar barang di katalog, terbaru lebih dulu, dengan pencarian, filter, dan paging |
| `GET /api/katalog/:id`    | Login  | Detail satu barang di katalog                                                      |
| `GET /uploads/<namaFile>` | Publik | Foto barang (nama file acak)                                                       |

| Parameter `GET /api/katalog` | Keterangan                                                              |
| ---------------------------- | ----------------------------------------------------------------------- |
| `cari`                       | Kata kunci, dicocokkan ke nama barang dan deskripsi (maks 100 karakter) |
| `kategori`                   | Salah satu kategori yang diizinkan                                      |
| `halaman`                    | Nomor halaman, bilangan bulat positif (bawaan 1)                        |
| `batas`                      | Jumlah barang per halaman, 1-50 (bawaan 10)                             |

| Aspek  | Keterangan                                                                                                                                                 |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Proses | Cek login → validasi parameter → ambil barang berstatus "Tersedia" sesuai filter → hitung total → bentuk respons dengan `meta`                             |
| Output | `200` + `data` dan `meta` (`halaman`, `batas`, `total`, `totalHalaman`); `400` parameter tidak valid; `401` tanpa login; `404` barang tidak ada di katalog |

**Keputusan implementasi**

- Respons katalog sengaja tidak memuat `idPengguna` pelapor, karena katalog bisa dilihat semua pengguna.
- Karakter khusus pencarian `%` dan `_` diperlakukan sebagai huruf biasa (bukan karakter pengganti LIKE), dan semua nilai dikirim sebagai parameter query, sehingga input seperti `' OR '1'='1` tidak dapat mengubah perintah SQL.
- Parameter kosong (mis. `?kategori=`) dianggap tidak diisi, supaya antarmuka bisa mengirim filter "semua" tanpa menyebabkan error.

### FR-07 — Verifikasi Laporan Temuan (dengan loker dasar dari FR-06 / UC-05)

Sebelum laporan temuan dipublikasikan ke katalog, Satpam mencocokkan barang fisiknya, menyimpannya di loker, lalu mencatat nomor lokernya. Setelah verifikasi, status barang menjadi "Tersedia" dan status loker menjadi "terisi". Karena langkah ini tidak dapat dipisahkan dari loker, FR-07 dikerjakan bersama versi minimal tabel loker dan penempatan loker (FR-06).

| Endpoint                           | Akses                | Fungsi                                                                     |
| ---------------------------------- | -------------------- | -------------------------------------------------------------------------- |
| `GET /api/laporan/menunggu`        | Login, role `satpam` | Daftar laporan temuan berstatus "Menunggu Verifikasi" (terlama lebih dulu) |
| `GET /api/loker/kosong`            | Login, role `satpam` | Daftar loker yang masih kosong                                             |
| `POST /api/laporan/:id/verifikasi` | Login, role `satpam` | Verifikasi laporan dan tempatkan di loker (`{"idLoker": 1}`)               |
| `POST /api/laporan/:id/tolak`      | Login, role `satpam` | Tolak laporan dengan alasan (`{"alasan": "..."}`)                          |

| Aspek             | Keterangan                                                                                                                                                                                                                         |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Input verifikasi  | `id` laporan (path), `idLoker` (bilangan bulat positif)                                                                                                                                                                            |
| Proses verifikasi | Validasi → kunci baris laporan dan loker → cek laporan ada, berjenis temuan, dan berstatus "Menunggu Verifikasi" → cek loker ada dan kosong → catat penempatan → ubah status laporan menjadi "Tersedia" dan loker menjadi "terisi" |
| Output            | `200` + data laporan; `400` input tidak valid; `401/403` akses; `404` laporan atau loker tidak ada; `409` laporan sudah diproses, bukan laporan temuan, atau loker sudah terisi                                                    |

**Keputusan implementasi**

- Seluruh perubahan verifikasi (catat penempatan, ubah status laporan, ubah status loker) dijalankan dalam satu **transaksi** (`utils/transaction.js`). Jika salah satu gagal, semuanya dibatalkan sehingga data tidak pernah setengah berubah.
- Baris laporan dan loker dikunci (`SELECT ... FOR UPDATE`). Pada uji dua satpam memverifikasi dua laporan ke loker yang sama secara bersamaan, hanya satu yang berhasil dan satunya mendapat `409`, tanpa data ganda.
- Penolakan (`/tolak`) menangani laporan yang tidak sesuai atau fiktif. Alasan penolakan disimpan di kolom `alasan_penolakan`.
- Akun `satpam` dibuat manual lewat database (lihat bagian Skema Database).

### FR-04 — Pengajuan Klaim

Civitas yang merasa memiliki barang di katalog mengajukan klaim dengan menjelaskan ciri khusus dan mengunggah foto bukti kepemilikan.

| Aspek    | Keterangan |
| -------- | ---------- |
| Endpoint | `POST /api/klaim` (multipart: `idLaporan`, `ciriKhusus`, `fotoBukti`, opsional `idLaporanHilang`), `GET /api/klaim/saya` |
| Akses    | Peran `civitas` |
| Validasi | `idLaporan` bilangan bulat positif; `ciriKhusus` wajib, maksimal 500 karakter; `fotoBukti` wajib (JPEG atau PNG, maksimal 5 MB) |
| Aturan   | Barang harus berstatus Tersedia (404 jika tidak ada di katalog); tidak boleh mengklaim laporan sendiri (403); klaim Pending yang sama tidak boleh diajukan dua kali (409) |
| Output   | `201` + data klaim berstatus `Pending`; `400`, `401`, `403`, `404`, `409` untuk kondisi di atas |

Keputusan: foto bukti diwajibkan agar Satpam punya pembanding saat memvalidasi, sehingga klaim asal-asalan dapat ditolak. Jika pengaju memiliki laporan hilang berstatus Dicari, antarmuka mewajibkan memilih laporan hilang yang sesuai (atau "tidak ada") supaya laporan hilang dan temuan tidak menumpuk.

### FR-05 — Validasi Klaim

| Aspek    | Keterangan |
| -------- | ---------- |
| Endpoint | `GET /api/klaim/pending`, `POST /api/klaim/:id/setujui`, `POST /api/klaim/:id/tolak` (body: `alasan`) |
| Akses    | Peran `satpam` |
| Proses   | Transaksi dengan penguncian baris klaim dan laporan; hanya klaim berstatus Pending yang dapat diproses |
| Hasil    | Setujui: klaim `Disetujui`, laporan temuan `Diklaim`. Tolak: klaim `Ditolak` + `alasan_penolakan` (wajib, maksimal 255 karakter) |
| Error    | `400` validasi, `403` peran, `404` klaim tidak ada, `409` klaim sudah diproses atau barang tidak lagi tersedia |

### FR-09 — Konfirmasi Penjemputan (dan pengosongan loker, FR-06)

| Aspek    | Keterangan |
| -------- | ---------- |
| Endpoint | `GET /api/klaim/disetujui`, `GET /api/klaim/:id/kandidat-hilang`, `POST /api/klaim/:id/serahkan` (body opsional: `idLaporanHilang`) |
| Akses    | Peran `satpam` |
| Proses   | Dalam satu transaksi: klaim menjadi `Selesai`, laporan temuan menjadi `Selesai`, `penempatan_loker.tanggal_keluar` diisi, loker kembali `kosong`, dan laporan hilang yang tertaut ditutup (`Selesai`) |
| Penautan | `idLaporanHilang` tidak dikirim: memakai tautan dari klaim; `null`: tidak ada laporan hilang; angka: laporan hilang pilihan Satpam. Laporan harus milik pengaju klaim, berjenis hilang, dan berstatus Dicari; jika tidak, `400` dan seluruh transaksi dibatalkan |
| Error    | `409` jika klaim belum berstatus Disetujui |

### Pengembangan di luar FR

Ditambahkan agar sistem tidak menumpuk data dan mudah dipakai, tanpa mengubah alur FR di atas:

- **Katalog barang hilang:** `GET /api/katalog/hilang` dan `/api/katalog/hilang/:id` (wajib login). Kontak dan identitas pelapor disembunyikan dari katalog publik.
- **"Sudah ketemu":** `POST /api/laporan/:id/ditemukan` oleh pemilik laporan hilang yang menemukan barangnya sendiri (Dicari menjadi Selesai). Laporan milik orang lain dijawab `404`, status selain Dicari `409`.
- **Penautan klaim ke laporan hilang:** kolom `klaim.id_laporan_hilang` dan pemilih laporan hilang saat Satpam menyerahkan barang.
- **Kirim ulang verifikasi:** `POST /api/auth/kirim-ulang-verifikasi`.
- **Halaman `/petugas`:** pintu masuk login khusus Satpam di frontend, terpisah dari login civitas.

### Keputusan Desain dan Penyesuaian

| Hal                                   | Implementasi                                                                                                                                                                                                | Alasan                                                                                                   |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Kolom `pengguna`                      | `id_pengguna`, `nama`, `email`, `role`, `no_wa`, ditambah `password_hash`, `status_akun`, `token_verifikasi`                                                                                                | Dibutuhkan registrasi dan login untuk kata sandi, status `pending`/`aktif`, dan tautan verifikasi        |
| Kolom `laporan`                       | Satu tabel untuk laporan temuan dan hilang: `jenis_laporan`, `lokasi_penitipan`, `lokasi_terakhir`, `kontak`, `tanggal`, `foto_barang`, `alasan_penolakan`. `lokasi_penitipan` dan `foto_barang` boleh NULL | Laporan hilang tidak punya foto dan pos penitipan, laporan temuan tidak punya lokasi terakhir dan kontak |
| Status laporan                        | "Menunggu Verifikasi" → "Tersedia" atau "Ditolak" → "Diklaim" → "Selesai" (temuan); "Dicari" → "Selesai" (hilang). Klaim: Pending → Disetujui atau Ditolak → Selesai                                                                                                                               | Menandai tahap tiap laporan                                                                              |
| Tabel `loker` dan `penempatan_loker`  | Loker mencatat nomor dan status (`kosong`/`terisi`); penempatan menghubungkan laporan, loker, dan satpam beserta tanggal masuk dan keluar                                                                   | Satu loker dipakai berkali-kali, sehingga perlu catatan riwayat. `tanggal_keluar` belum dipakai          |
| Pengiriman email verifikasi           | Tautan dicetak di terminal server                                                                                                                                                                           | Belum ada layanan email. Alur sama, tinggal diganti dengan `nodemailer`                                  |
| Pengalihan sesuai peran setelah login | API mengembalikan token dan `role`                                                                                                                                                                          | Pengalihan halaman dilakukan frontend                                                                    |
| Sesi                                  | Token JWT                                                                                                                                                                                                   | Lebih sederhana untuk frontend terpisah                                                                  |

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
  lokasi_penitipan VARCHAR(150) NULL,
  lokasi_terakhir VARCHAR(150) NULL,
  kontak VARCHAR(20) NULL,
  tanggal DATETIME NOT NULL,
  foto_barang VARCHAR(255) NULL,
  status VARCHAR(30) NOT NULL,
  alasan_penolakan VARCHAR(255) NULL,
  FOREIGN KEY (id_pelapor) REFERENCES pengguna(id_pengguna)
);

CREATE TABLE IF NOT EXISTS loker (
  id_loker INT AUTO_INCREMENT PRIMARY KEY,
  nomor_loker VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'kosong',
  UNIQUE KEY uq_loker_nomor (nomor_loker)
);

CREATE TABLE IF NOT EXISTS penempatan_loker (
  id_penempatan INT AUTO_INCREMENT PRIMARY KEY,
  id_laporan INT NOT NULL,
  id_loker INT NOT NULL,
  id_satpam INT NOT NULL,
  tanggal_masuk DATETIME NOT NULL,
  tanggal_keluar DATETIME NULL,
  FOREIGN KEY (id_laporan) REFERENCES laporan(id_laporan),
  FOREIGN KEY (id_loker) REFERENCES loker(id_loker),
  FOREIGN KEY (id_satpam) REFERENCES pengguna(id_pengguna)
);

INSERT INTO loker (nomor_loker) VALUES ('L-01'), ('L-02'), ('L-03');
```

Membuat akun Satpam (setelah akun didaftarkan dan diverifikasi, lalu login ulang agar token membawa role baru):

```sql
UPDATE pengguna SET role = 'satpam' WHERE email = 'email-satpam@uinjkt.ac.id';
```

#### Tabel `klaim` (FR-04, FR-05, FR-09)

```sql
CREATE TABLE klaim (
  id_klaim          INT(11) NOT NULL AUTO_INCREMENT,
  id_laporan        INT(11) NOT NULL,
  id_laporan_hilang INT(11) NULL DEFAULT NULL,
  id_pengklaim      INT(11) NOT NULL,
  id_validator      INT(11) NULL,
  foto_bukti        VARCHAR(255) NOT NULL,
  ciri_khusus       TEXT NOT NULL,
  status            VARCHAR(20) NOT NULL DEFAULT 'Pending',
  alasan_penolakan  VARCHAR(255) NULL,
  tanggal           DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_klaim),
  FOREIGN KEY (id_laporan)        REFERENCES laporan (id_laporan),
  FOREIGN KEY (id_laporan_hilang) REFERENCES laporan (id_laporan),
  FOREIGN KEY (id_pengklaim)      REFERENCES pengguna (id_pengguna),
  FOREIGN KEY (id_validator)      REFERENCES pengguna (id_pengguna)
);
```

Skrip lengkap ada di `backend/database/schema.sql`, termasuk data awal loker L-01 sampai L-20. Satpam dibuat dengan `node scripts/buatSatpam.js "Nama" email kataSandi` atau lewat SQL (`UPDATE pengguna SET role='satpam' ...`).

### Komponen yang Dikembangkan

Semua file berada di folder `backend/`.

| Lapisan     | File                                                                                                                                           | Tanggung jawab                                                                         |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Entry point | `app.js`                                                                                                                                       | Menyiapkan Express, route, penyajian foto, dan error handler                           |
| Route       | `routes/authRoutes.js`, `routes/laporanRoutes.js`, `routes/lokerRoutes.js`, `routes/katalogRoutes.js`                                          | Memetakan URL ke controller dan middleware                                             |
| Controller  | `controllers/authController.js`, `controllers/laporanController.js`, `controllers/verifikasiController.js`, `controllers/katalogController.js` | Mengambil data request dan membentuk response                                          |
| Service     | `services/authService.js`, `services/laporanService.js`, `services/verifikasiService.js`, `services/katalogService.js`                         | Aturan bisnis: registrasi, login, pembuatan laporan, verifikasi dan penolakan, katalog |
| Model       | `models/penggunaModel.js`, `models/laporanModel.js`, `models/lokerModel.js`, `models/katalogModel.js`                                          | Akses data memakai query berparameter (`?`)                                            |
| Utils       | `utils/validators.js`, `utils/authValidators.js`, `utils/verifikasiValidators.js`, `utils/katalogValidators.js`                                | Validasi input laporan, autentikasi, verifikasi, dan parameter katalog                 |
| Utils       | `utils/token.js`, `utils/authMiddleware.js`                                                                                                    | Membuat dan memeriksa token; `requireAuth` dan `requireRole`                           |
| Utils       | `utils/transaction.js`                                                                                                                         | Menjalankan beberapa query sebagai satu transaksi (commit atau rollback)               |
| Utils       | `utils/upload.js`                                                                                                                              | Upload foto (multer): batas ukuran, nama file acak                                     |
| Utils       | `utils/errorHandler.js`, `utils/appError.js`, `utils/db.js`                                                                                    | Penanganan error terpusat dan koneksi pool MySQL                                       |

Komponen FR-04, FR-05, dan FR-09:

| Lapisan    | File |
| ---------- | ---- |
| Route      | `routes/klaimRoutes.js` |
| Controller | `controllers/klaimController.js`, `controllers/validasiKlaimController.js`, `controllers/penjemputanController.js` |
| Service    | `services/klaimService.js`, `services/validasiKlaimService.js`, `services/penjemputanService.js` |
| Model      | `models/klaimModel.js` |
| Utils      | `utils/klaimValidators.js` |

Prinsip yang diterapkan: penamaan camelCase, pemisahan tanggung jawab per lapisan (SRP), konstanta alih-alih angka langsung (DRY), validasi input sebelum menyentuh database, query berparameter untuk mencegah SQL injection, kata sandi di-hash, transaksi untuk perubahan yang saling terkait, dan error handling terpusat.

### Cara Menjalankan

```bash
cd backend
npm install
# salin .env.example menjadi .env lalu isi nilainya
npm run dev
```

Jalankan perintah dari dalam folder `backend/` karena `.env` dan folder `uploads/` dibaca relatif dari situ. Buat tabel dengan skema di atas lebih dulu.

Isi `.env`:

| Variabel                                       | Keterangan                                                               |
| ---------------------------------------------- | ------------------------------------------------------------------------ |
| `PORT`                                         | Port server (mis. 3001)                                                  |
| `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Koneksi MySQL                                                            |
| `JWT_SECRET`                                   | Kunci rahasia penandatangan token (teks acak yang panjang)               |
| `JWT_EXPIRES_IN`                               | Masa berlaku token (mis. `1d`)                                           |
| `ALLOWED_EMAIL_DOMAINS`                        | Domain email kampus, dipisah koma (mis. `mhs.uinjkt.ac.id,uinjkt.ac.id`) |
| `APP_BASE_URL`                                 | Alamat dasar untuk tautan verifikasi                                     |

File `.env` tidak ikut di-commit. Tautan verifikasi muncul di terminal server dengan awalan `[VERIFIKASI]`.

### Menjalankan Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend berjalan di `http://localhost:5173`. Vite meneruskan `/api` dan `/uploads` ke `http://localhost:3001`, jadi backend harus berjalan lebih dulu. Peran Satpam masuk lewat `/petugas`.

### Batasan Saat Ini

- Tautan verifikasi belum dikirim lewat email (dicetak di terminal server dengan awalan `[VERIFIKASI]`), dan notifikasi WhatsApp/email (FR-08) belum ada.
- Belum ada fitur lupa kata sandi dan pembatasan jumlah percobaan login (rate limiting).
- Tipe foto dicek dari `mimetype` yang dikirim klien, belum dari isi file.
- Foto di `/uploads` dapat dibuka siapa pun yang mengetahui nama filenya. Nama file acak sehingga sulit ditebak, tetapi belum ada kontrol akses per foto.
- File foto tidak pernah dihapus, termasuk setelah barang diserahkan; belum ada tugas pembersihan terjadwal.
- Loker ditambah lewat SQL (belum ada endpoint pengelolaan loker).
- Akun Satpam dibuat lewat skrip atau SQL, bukan dari antarmuka.

## 3. Temuan Code Review dan Hasil Refactoring (Before–After)

Setiap perbaikan di-commit terpisah sehingga before–after dapat dilihat pada riwayat git. Path file pada bagian ini relatif terhadap folder `backend/`.

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
- **Masalah:** teks "2 MB" ditulis langsung di validator dan error handler, terpisah dari nilai batas sebenarnya (`2 * 1024 * 1024`). Jika batas diubah, pesan bisa tidak sinkron. Selain itu, alternatif A1 pada UC-04 menetapkan batas 5 MB.
- **Perbaikan:** batas didefinisikan sekali sebagai `maxImageSizeMb`, nilai byte dan pesan error diturunkan darinya, dan batas disesuaikan menjadi 5 MB.
- **Jenis perubahan:** refactor, ditambah penyesuaian nilai batas dengan kebutuhan UC-04.

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

### Temuan 4 — Status awal tidak sesuai kebutuhan dan ada kode tidak terpakai

- **Bagian kode:** `services/laporanService.js`
- **Masalah:** status awal laporan bernilai `"tersedia"`, padahal UC-04 menetapkan "Menunggu Verifikasi" (laporan baru belum diverifikasi Satpam). Fungsi `getLaporanById` tidak dipakai route mana pun (kode mati), dan komentar "Sesuaikan kedua nilai ini..." adalah catatan sementara yang tertinggal.
- **Perbaikan:** status awal disesuaikan, fungsi tidak terpakai dan komentar sementara dihapus.
- **Jenis perubahan:** penyesuaian nilai status dan pembersihan kode.

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

### Temuan 6 — Fungsi pengubah state didefinisikan di dalam `useEffect` (frontend)

- **Masalah:** `handleKetemu` pada `LaporanSaya.jsx` ditulis di dalam `useEffect`, sehingga tidak terjangkau oleh tombol di JSX. Tombol "Sudah ketemu" tampak ada tetapi tidak melakukan apa pun, tanpa pesan error.
- **Perbaikan:** fungsi dipindah ke tingkat komponen (di luar `useEffect`), dan halaman digulir ke atas agar pesan hasil terlihat.

```jsx
// BEFORE
useEffect(() => {
  const handleKetemu = async (id) => { /* ... */ };
  muatLaporan();
}, []);

// AFTER
const handleKetemu = async (id) => { /* ... */ };
useEffect(() => { muatLaporan(); }, []);
```

### Temuan 7 — Fungsi service tidak mengembalikan nilai (`katalogService.js`)

- **Masalah:** `getDetailKatalog` tidak memiliki `return barang;`, sehingga controller menerima `undefined` dan halaman detail berhenti di "Memuat...".
- **Perbaikan:** nilai dikembalikan, dan 404 diberi pesan yang sesuai jenis laporan.

```js
// BEFORE
const barang = await findKatalogById(id, jenis, statusKatalog[jenis]);
if (!barang) throw new AppError("Barang tidak ditemukan", 404);

// AFTER
const barang = await findKatalogById(id, jenis, statusKatalog[jenis]);
if (!barang) throw new AppError("Barang tidak ditemukan", 404);
return barang;
```

### Temuan 8 — Pemilihan kolom publik tidak per jenis laporan (kebocoran data)

- **Masalah:** daftar kolom yang boleh tampil di katalog dipakai sama untuk barang temuan dan hilang. Setelah katalog hilang ditambahkan, kontak dan identitas pelapor berisiko ikut tampil ke publik.
- **Perbaikan:** kolom publik dipisah per jenis (`publicFields = { temuan, hilang }`) dan query memilih dengan `publicFields[kriteria.jenis]`. TC-K20 memastikan `kontak` tidak muncul di katalog hilang. Selama perbaikan, interpolasi objek ke dalam SQL sempat menghasilkan `SELECT [object Object]`; kesalahan ini dicegah dengan menyusun string kolom per jenis di satu tempat.

### Temuan 9 — Aturan penautan ditulis longgar (data menumpuk)

- **Masalah:** klaim tidak tahu laporan hilang mana yang dipenuhi, sehingga laporan hilang tetap berstatus Dicari setelah barang diserahkan.
- **Perbaikan:** kolom `klaim.id_laporan_hilang` (opsional di API, wajib dipilih di antarmuka), validasi kepemilikan, jenis, dan status Dicari di service, serta penutupan laporan hilang di dalam transaksi `serahkan`. Jika tautan tidak valid, seluruh transaksi dibatalkan (TC-KL17).

### Perbaikan lain (konfigurasi dan penamaan)

- **Penamaan file:** semua file diganti ke camelCase tanpa mengubah isi (`laporancontrollers.js` → `laporanController.js`, `laporanmodels.js` → `laporanModel.js`, `laporanroutes.js` → `laporanRoutes.js`, `laporanservices.js` → `laporanService.js`, `apperror.js` → `appError.js`).
- **`.gitignore`:** aturan sebelumnya diawali spasi sehingga `node_modules` dan `.env` ikut ter-commit. Diperbaiki dan keduanya dilepas dari git (`git rm -r --cached`).

## 4. Hasil Pengujian

Pengujian manual dengan cURL. Lingkungan awal: Windows, Node.js, MySQL 8.0 lokal, database `lostundfound`. Baris bertanda † dijalankan ulang pada 24 November 2026 di lingkungan Linux dengan MariaDB (kompatibel MySQL) dan kode final; kolom hasil aktualnya diambil dari respons nyata. Untuk TC-L06 dan TC-L12, hasil memuat pesan terkait bagian yang diuji saja.

### 4.1 FR-01 Autentikasi (6 November 2026)

| ID     | FR    | Jenis                | Langkah                                                 | Hasil yang diharapkan                                        | Hasil aktual                                                                                            | Status  |
| ------ | ----- | -------------------- | ------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- | ------- |
| TC-L01 | FR-01 | Normal               | Registrasi dengan nama, email kampus, kata sandi valid  | 201, `statusAkun` = `pending`                                | 201, "Registrasi berhasil. Silakan verifikasi email Anda", `role` = `civitas`, `statusAkun` = `pending` | Sesuai  |
| TC-L02 | FR-01 | Normal               | Buka tautan verifikasi dari terminal server             | 200, akun aktif                                              | Akun aktif (terbukti login berhasil sesudahnya)                                                         | Sesuai  |
| TC-L03 | FR-01 | Normal               | Login dengan akun yang sudah aktif                      | 200 + token                                                  | 200, token diterima                                                                                     | Sesuai  |
| TC-L04 | FR-01 | Normal               | `GET /api/auth/saya` dengan token                       | 200, berisi `idPengguna` dan `role`                          | 200, `{"idPengguna":2,"role":"civitas"}`                                                                | Sesuai  |
| TC-L05 | FR-01 | Invalid              | `GET /api/auth/saya` tanpa token                        | 401, "Anda harus login terlebih dahulu"                      | 401, "Anda harus login terlebih dahulu"                                                                 | Sesuai  |
| TC-L06 | FR-01 | Invalid              | Registrasi dengan email `x@gmail.com`                   | 400, "Gunakan email resmi kampus yang valid"                 | 400, "Gunakan email resmi kampus yang valid" †                                                                                                 | 400, "Gunakan email resmi kampus yang valid" † |
| TC-L07 | FR-01 | Invalid              | Registrasi dengan email yang sudah terdaftar            | 409, "Akun dengan email ini sudah ada. Silakan login"        | 409, "Akun dengan email ini sudah ada. Silakan login" †                                                                                                 | 409, "Akun dengan email ini sudah ada. Silakan login" † |
| TC-L08 | FR-01 | Invalid              | Registrasi dengan kata sandi `123` dan nama kosong      | 400, "Nama wajib diisi" dan "Kata sandi harus 8-72 karakter" | 400, "Nama wajib diisi" dan "Kata sandi harus 8-72 karakter" †                                                                                                 | 400, "Nama wajib diisi" dan "Kata sandi harus 8-72 karakter" † |
| TC-L09 | FR-01 | Invalid              | Login sebelum membuka tautan verifikasi                 | 403, "Akun belum aktif..."                                   | 403, "Akun belum aktif. Verifikasi email Anda terlebih dahulu" †                                                                                                 | 403, "Akun belum aktif. Verifikasi email Anda terlebih dahulu" † |
| TC-L10 | FR-01 | Invalid              | Login dengan kata sandi salah                           | 401, "Kredensial tidak valid"                                | 401, "Kredensial tidak valid" †                                                                                                 | 401, "Kredensial tidak valid" † |
| TC-L11 | FR-01 | Invalid              | Verifikasi dengan `token=abc`                           | 400, "Tautan verifikasi tidak valid atau sudah dipakai"      | 400, "Tautan verifikasi tidak valid atau sudah dipakai" †                                                                                                 | 400, "Tautan verifikasi tidak valid atau sudah dipakai" † |
| TC-L12 | FR-01 | Edge (SQL injection) | Registrasi dengan email `a' OR '1'='1@mhs.uinjkt.ac.id` | 400, "Format email tidak valid"                              | 400, "Format email tidak valid"; tabel `pengguna` tidak berubah †                                                                                                 | 400, "Format email tidak valid"; tabel `pengguna` tidak berubah † |
| TC-L13 | FR-01 | Edge                 | `GET /api/auth/saya` dengan token palsu `abc.def.ghi`   | 401, "Sesi tidak valid atau sudah berakhir..."               | 401, "Sesi tidak valid atau sudah berakhir. Silakan login ulang" †                                                                                                 | 401, "Sesi tidak valid atau sudah berakhir. Silakan login ulang" † |

### 4.2 FR-02 Lapor Barang Temuan (3 November 2026, sebelum login ditambahkan)

Pengujian pada tabel ini dijalankan saat `idPengguna` masih dikirim lewat form. Setelah FR-01 ditambahkan, TC-07 diganti oleh TC-12 dan TC-13 (di bawah), sedangkan kasus lainnya tetap berlaku dengan tambahan header `Authorization`.

| ID     | FR    | Jenis                  | Langkah                                  | Hasil yang diharapkan                                | Hasil aktual                                                                                                                                                 | Status |
| ------ | ----- | ---------------------- | ---------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ |
| TC-01  | FR-02 | Normal                 | Kirim semua field valid + `foto.png`     | 201, laporan tersimpan, status "Menunggu Verifikasi" | 201, "Laporan temuan berhasil dibuat", `idLaporan` terisi, status "Menunggu Verifikasi", foto tersimpan dengan nama acak                                     | Sesuai |
| TC-02  | FR-02 | Invalid                | `namaBarang` dikosongkan                 | 400, "Nama barang wajib diisi"                       | 400, "Validasi gagal", errors: "Nama barang wajib diisi"                                                                                                     | Sesuai |
| TC-03  | FR-02 | Invalid                | `kategori=senjata`                       | 400, daftar kategori yang diizinkan                  | 400, "Kategori harus salah satu dari: elektronik, dokumen & buku, pakaian & aksesoris, wadah makanan & minuman, lainnya"                                     | Sesuai |
| TC-04  | FR-02 | Invalid                | Tanpa file `fotoBarang`                  | 400, "Foto barang wajib diunggah"                    | 400, errors: "Foto barang wajib diunggah"                                                                                                                    | Sesuai |
| TC-05  | FR-02 | Invalid                | Unggah `uji.gif` (`image/gif`)           | 400, "Foto harus berformat JPG atau PNG"             | 400, errors: "Foto harus berformat JPG atau PNG"                                                                                                             | Sesuai |
| TC-06  | FR-02 | Invalid                | Unggah `besar.png` (6 MB)                | 400, "Ukuran foto maksimal 5 MB"                     | 400, "Ukuran foto maksimal 5 MB" (ditolak lebih awal oleh middleware upload, sebelum validator berjalan)                                                     | Sesuai |
| TC-07  | FR-02 | Invalid                | `idPengguna=abc`                         | 400, "ID pengguna tidak valid"                       | 400, errors: "ID pengguna tidak valid" (tidak berlaku lagi setelah FR-01, digantikan TC-12 dan TC-13)                                                        | Sesuai |
| TC-08  | FR-02 | Edge (SQL injection)   | `namaBarang='; DROP TABLE laporan; --`   | 201, tersimpan sebagai teks biasa, tabel tetap ada   | 201, `namaBarang` tersimpan persis `'; DROP TABLE laporan; --`. Tabel `laporan` tetap ada (TC-10 dan TC-11 sesudahnya berhasil menyimpan ke tabel yang sama) | Sesuai |
| TC-09  | FR-02 | Edge (SQL injection)   | `kategori=elektronik' OR '1'='1`         | 400, ditolak daftar kategori                         | 400, "Kategori harus salah satu dari: ..."                                                                                                                   | Sesuai |
| TC-10a | FR-02 | Edge (batas)           | `namaBarang` 100 karakter                | 201, diterima                                        | 201, laporan tersimpan                                                                                                                                       | Sesuai |
| TC-10b | FR-02 | Edge (batas)           | `namaBarang` 101 karakter                | 400, "Nama barang maksimal 100 karakter"             | 400, errors: "Nama barang maksimal 100 karakter"                                                                                                             | Sesuai |
| TC-11  | FR-02 | Edge (karakter khusus) | `deskripsi=<script>alert(1)</script> 😀` | 201, tersimpan apa adanya sebagai teks               | 201, `deskripsi` tersimpan dan terbaca kembali sama persis, termasuk emoji                                                                                   | Sesuai |

### 4.3 FR-02 setelah login ditambahkan (6 November 2026)

| ID    | FR    | Jenis           | Langkah                                                              | Hasil yang diharapkan                                         | Hasil aktual | Status  |
| ----- | ----- | --------------- | -------------------------------------------------------------------- | ------------------------------------------------------------- | ------------ | ------- |
| TC-12 | FR-02 | Invalid         | Kirim laporan tanpa header `Authorization`                           | 401, "Anda harus login terlebih dahulu"                       | 401, "Anda harus login terlebih dahulu" †      | 401, "Anda harus login terlebih dahulu" † |
| TC-13 | FR-02 | Edge (keamanan) | Kirim laporan dengan token akun A dan `idPengguna` akun lain di form | 201, tersimpan atas nama akun A, field `idPengguna` diabaikan | 201, `idPengguna` pada data = 14 (pemilik token); nilai 15 dari form diabaikan †      | 201, `idPengguna` pada data = 14 (pemilik token); nilai 15 dari form diabaikan † |
| TC-14 | FR-02 | Normal          | Kirim laporan dengan token dan tanpa `idPengguna` di form            | 201, `id_pelapor` sama dengan id akun yang login              | 201, `idPengguna` terisi dari token †      | 201, `idPengguna` terisi dari token † |

### 4.4 FR-02 Laporan Barang Hilang dan Daftar Laporan Saya

| ID     | FR    | Jenis                | Langkah                                                                                | Hasil yang diharapkan                                                      | Hasil aktual | Status  |
| ------ | ----- | -------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ------------ | ------- |
| TC-H01 | FR-02 | Normal               | `POST /api/laporan/hilang` dengan token civitas dan data valid                         | 201, status "Dicari"                                                       | 201, "Laporan barang hilang berhasil dibuat" †      | 201, "Laporan barang hilang berhasil dibuat" † |
| TC-H02 | FR-02 | Invalid              | `POST /api/laporan/hilang` tanpa token                                                 | 401, "Anda harus login terlebih dahulu"                                    | 401, "Anda harus login terlebih dahulu" †      | 401, "Anda harus login terlebih dahulu" † |
| TC-H03 | FR-02 | Invalid              | Body kosong `{}`                                                                       | 400, empat pesan: nama barang, kategori, lokasi terakhir, dan kontak wajib | 400, daftar error nama, kategori, lokasi terakhir, dan kontak †      | 400, daftar error nama, kategori, lokasi terakhir, dan kontak † |
| TC-H04 | FR-02 | Invalid              | `kontak` berisi huruf                                                                  | 400, "Nomor kontak wajib diisi (8-15 digit, boleh diawali +)"              | 400, "Nomor kontak wajib diisi (8-15 digit, boleh diawali +)" †      | 400, "Nomor kontak wajib diisi (8-15 digit, boleh diawali +)" † |
| TC-H05 | FR-02 | Invalid              | Token satpam untuk lapor hilang                                                        | 403, "Anda tidak punya akses ke fitur ini"                                 | 403, "Anda tidak punya akses ke fitur ini" †      | 403, "Anda tidak punya akses ke fitur ini" † |
| TC-H06 | FR-02 | Edge (batas)         | `lokasiTerakhir` 151 karakter                                                          | 400, "Lokasi terakhir maksimal 150 karakter"                               | 400, "Lokasi terakhir maksimal 150 karakter" †      | 400, "Lokasi terakhir maksimal 150 karakter" † |
| TC-H07 | FR-02 | Edge (SQL injection) | `namaBarang='; DROP TABLE laporan; --` pada laporan hilang                             | 201, tersimpan sebagai teks biasa, tabel tetap ada                         | 201, teks disimpan apa adanya sebagai data; tabel `laporan` tetap ada †      | 201, teks disimpan apa adanya sebagai data; tabel `laporan` tetap ada † |
| TC-S01 | FR-02 | Normal               | `GET /api/laporan/saya` dengan token akun A, setelah A dan B sama-sama membuat laporan | 200, hanya laporan milik A                                                 | 200, daftar hanya berisi laporan milik akun yang login (`idPengguna` 14) †      | 200, daftar hanya berisi laporan milik akun yang login (`idPengguna` 14) † |
| TC-S02 | FR-02 | Invalid              | `GET /api/laporan/saya` tanpa token                                                    | 401                                                                        | 401, "Anda harus login terlebih dahulu" †      | 401, "Anda harus login terlebih dahulu" † |

### 4.5 FR-07 Verifikasi Laporan Temuan (9 November 2026)

Data uji: laporan temuan id 1 sampai 6 dari pengujian FR-02, loker L-01 sampai L-03, dan akun satpam (id 3).

| ID     | FR    | Jenis                | Langkah                                                                          | Hasil yang diharapkan                                         | Hasil aktual                                                                  | Status  |
| ------ | ----- | -------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------- | ------- |
| TC-V01 | FR-07 | Normal               | `GET /api/laporan/menunggu` dengan token satpam                                  | 200, daftar laporan temuan berstatus "Menunggu Verifikasi"    | 200, 6 laporan, semuanya "Menunggu Verifikasi"                                | Sesuai  |
| TC-V02 | FR-07 | Normal               | Verifikasi laporan 1 ke loker 1                                                  | 200, status "Tersedia"                                        | 200, "Laporan terverifikasi dan barang tersimpan di loker", status "Tersedia" | Sesuai  |
| TC-V03 | FR-07 | Normal               | Tolak laporan 3 dengan alasan "Barang tidak sesuai laporan"                      | 200, status "Ditolak", alasan tersimpan                       | 200, "Laporan ditolak", status "Ditolak", `alasanPenolakan` terisi            | Sesuai  |
| TC-V04 | FR-07 | Normal               | `GET /api/loker/kosong` setelah loker 1 terisi                                   | Hanya L-02 dan L-03                                           | 200, hanya L-02 dan L-03                                                      | Sesuai  |
| TC-V05 | FR-07 | Invalid              | Verifikasi ulang laporan 1                                                       | 409, laporan sudah diproses                                   | 409, "Laporan sudah diproses (status: Tersedia)"                              | Sesuai  |
| TC-V06 | FR-07 | Invalid              | Verifikasi laporan 2 ke loker 1 (sudah terisi)                                   | 409, loker sudah terisi                                       | 409, "Loker sudah terisi. Pilih loker lain"                                   | Sesuai  |
| TC-V07 | FR-07 | Invalid              | ID laporan `abc`                                                                 | 400, "ID laporan tidak valid"                                 | 400, "Validasi gagal", errors: "ID laporan tidak valid"                       | Sesuai  |
| TC-V08 | FR-07 | Invalid              | Verifikasi tanpa `idLoker`                                                       | 400, "ID loker wajib diisi dan berupa bilangan bulat positif" | 400, errors: "ID loker wajib diisi dan berupa bilangan bulat positif"         | Sesuai  |
| TC-V09 | FR-07 | Invalid              | `idLoker` 999 (tidak ada)                                                        | 404, "Loker tidak ditemukan"                                  | 404, "Loker tidak ditemukan"                                                  | Sesuai  |
| TC-V10 | FR-07 | Invalid              | Laporan 9999 (tidak ada)                                                         | 404, "Laporan tidak ditemukan"                                | 404, "Laporan tidak ditemukan"                                                | Sesuai  |
| TC-V11 | FR-07 | Invalid              | Tolak tanpa alasan                                                               | 400, "Alasan penolakan wajib diisi"                           | 400, errors: "Alasan penolakan wajib diisi"                                   | Sesuai  |
| TC-V12 | FR-07 | Invalid              | Tolak laporan 3 yang sudah ditolak                                               | 409, laporan sudah diproses                                   | 409, "Laporan sudah diproses (status: Ditolak)"                               | Sesuai  |
| TC-V13 | FR-07 | Invalid              | `GET /api/laporan/menunggu` tanpa token                                          | 401, "Anda harus login terlebih dahulu"                       | 401, "Anda harus login terlebih dahulu"                                       | Sesuai  |
| TC-V14 | FR-07 | Invalid              | `GET /api/laporan/menunggu` dengan token civitas                                 | 403, "Anda tidak punya akses ke fitur ini"                    | 403, "Anda tidak punya akses ke fitur ini" †                                                                       | 403, "Anda tidak punya akses ke fitur ini" † |
| TC-V15 | FR-07 | Edge (batas)         | Alasan penolakan 256 karakter                                                    | 400, "Alasan penolakan maksimal 255 karakter"                 | 400, "Alasan penolakan maksimal 255 karakter" †                                                                       | 400, "Alasan penolakan maksimal 255 karakter" † |
| TC-V16 | FR-07 | Edge (SQL injection) | Alasan penolakan `'; DROP TABLE laporan; --`                                     | 200, alasan tersimpan sebagai teks biasa, tabel tetap ada     | 200, "Laporan ditolak"; teks disimpan sebagai data, tabel `laporan` tetap ada †                                                                       | 200, "Laporan ditolak"; teks disimpan sebagai data, tabel `laporan` tetap ada † |
| TC-V17 | FR-07 | Edge (konkurensi)    | Dua satpam memverifikasi dua laporan berbeda ke loker yang sama secara bersamaan | Satu 200 dan satu 409, hanya satu baris penempatan            | Belum dijalankan ulang (perlu dua sesi paralel di lingkungan MySQL)                                                                       | Belum dijalankan ulang (perlu dua sesi paralel di lingkungan MySQL) |

### 4.6 FR-03 Katalog dan Pencarian (9 November 2026)

Data uji: laporan temuan id 1 berstatus "Tersedia"; laporan lain masih menunggu verifikasi atau ditolak.

| ID     | FR    | Jenis                  | Langkah                                                  | Hasil yang diharapkan                                                              | Hasil aktual                                                                | Status  |
| ------ | ----- | ---------------------- | -------------------------------------------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ------- |
| TC-K01 | FR-03 | Normal                 | `GET /api/katalog` dengan token                          | 200, hanya barang berstatus "Tersedia", ada `meta`                                 | 200, hanya laporan 1, `meta.total` 1                                        | Sesuai  |
| TC-K02 | FR-03 | Normal                 | `GET /api/katalog?cari=dompet`                           | 200, hanya barang yang namanya atau deskripsinya memuat "dompet"                   | 200, laporan 1                                                              | Sesuai  |
| TC-K03 | FR-03 | Normal                 | `GET /api/katalog?kategori=elektronik&batas=5&halaman=1` | 200, hanya kategori elektronik                                                     | 200, data kosong, `total` 0 (belum ada barang elektronik yang tersedia)     | Sesuai  |
| TC-K04 | FR-03 | Normal                 | `GET /api/katalog/1`                                     | 200, detail barang                                                                 | 200, detail laporan 1 tanpa `idPengguna`                                    | Sesuai  |
| TC-K05 | FR-03 | Normal                 | Paging: `?batas=1&halaman=2` setelah dua barang tersedia | 200, satu barang, `totalHalaman` 2                                                 | 200, `meta`: halaman 2, batas 1, total 17, totalHalaman 17 †                                                                     | 200, `meta`: halaman 2, batas 1, total 17, totalHalaman 17 † |
| TC-K06 | FR-03 | Invalid                | `GET /api/katalog` tanpa token                           | 401, "Anda harus login terlebih dahulu"                                            | 401, "Anda harus login terlebih dahulu"                                     | Sesuai  |
| TC-K07 | FR-03 | Invalid                | `?kategori=senjata`                                      | 400, daftar kategori yang diizinkan                                                | 400, "Kategori harus salah satu dari: ..." †                                                                     | 400, "Kategori harus salah satu dari: ..." † |
| TC-K08 | FR-03 | Invalid                | `?halaman=0&batas=51`                                    | 400, halaman harus positif dan batas 1-50                                          | 400, "Halaman harus berupa bilangan bulat positif" dan "Batas per halaman harus bilangan bulat 1-50" †                                                                     | 400, "Halaman harus berupa bilangan bulat positif" dan "Batas per halaman harus bilangan bulat 1-50" † |
| TC-K09 | FR-03 | Invalid                | `GET /api/katalog/abc`                                   | 400, "ID laporan tidak valid"                                                      | 400, "ID laporan tidak valid" †                                                                     | 400, "ID laporan tidak valid" † |
| TC-K10 | FR-03 | Invalid                | `GET /api/katalog/9999`                                  | 404, "Barang tidak ditemukan di katalog"                                           | 404, "Barang tidak ditemukan di katalog" †                                                                     | 404, "Barang tidak ditemukan di katalog" † |
| TC-K11 | FR-03 | Invalid                | `GET /api/katalog/<id laporan hilang>`                   | 404, laporan hilang tidak ada di katalog                                           | 404, "Barang tidak ditemukan di katalog" †                                                                     | 404, "Barang tidak ditemukan di katalog" † |
| TC-K12 | FR-03 | Invalid                | `GET /api/katalog/<id laporan yang belum diverifikasi>`  | 404, barang belum tampil di katalog                                                | 404, "Barang tidak ditemukan di katalog" †                                                                     | 404, "Barang tidak ditemukan di katalog" † |
| TC-K13 | FR-03 | Edge (SQL injection)   | `?cari=' OR '1'='1`                                      | 200, data kosong, tabel tetap ada, tidak semua barang tampil                       | 200, `data` kosong, `total` 0; tidak ada baris yang bocor †                                                                     | 200, `data` kosong, `total` 0; tidak ada baris yang bocor † |
| TC-K14 | FR-03 | Edge (karakter khusus) | `?cari=%` dan `?cari=_`                                  | 200, hanya barang yang namanya benar-benar memuat karakter itu, bukan semua barang | 200, `data` kosong, `total` 0; `%` dan `_` diperlakukan sebagai teks biasa †                                                                     | 200, `data` kosong, `total` 0; `%` dan `_` diperlakukan sebagai teks biasa † |
| TC-K15 | FR-03 | Edge (batas)           | `cari` 101 karakter                                      | 400, "Kata kunci pencarian maksimal 100 karakter"                                  | 400, "Validasi gagal", errors: "Kata kunci pencarian maksimal 100 karakter" | Sesuai  |
| TC-K16 | FR-03 | Edge                   | `?cari=&kategori=&halaman=&batas=` (semua kosong)        | 200, diperlakukan sebagai tanpa filter                                             | 200, laporan 1, `meta` halaman 1 dan batas 10 (nilai bawaan)                | Sesuai  |

### 4.7 FR-04, FR-05, FR-09 dan fitur tambahan (24 November 2026) †

| ID | FR | Jenis | Langkah | Hasil yang diharapkan | Hasil aktual |
| -- | -- | ----- | ------- | --------------------- | ------------ |
| TC-KL01 | FR-04 | Invalid | `POST /api/klaim` tanpa token | 401 | 401, "Anda harus login terlebih dahulu" |
| TC-KL02 | FR-04 | Invalid | Klaim laporan yang belum diverifikasi | 404 | 404, "Barang tidak ditemukan di katalog" |
| TC-KL03 | FR-04 | Invalid | Klaim barang yang dilaporkan sendiri | 403 | 403, "Anda tidak dapat mengklaim barang yang Anda laporkan sendiri" |
| TC-KL04 | FR-04 | Invalid | Klaim tanpa `ciriKhusus` | 400 | 400, "Ciri khusus barang wajib diisi" |
| TC-KL05 | FR-04 | Invalid | Klaim tanpa `fotoBukti` | 400 | 400, "Foto bukti kepemilikan wajib diunggah" |
| TC-KL06 | FR-04 | Invalid | Klaim dengan token satpam | 403 | 403, "Anda tidak punya akses ke fitur ini" |
| TC-KL07 | FR-04 | Normal | Klaim barang Tersedia milik akun lain dengan data valid | 201, status `Pending` | 201, "Klaim berhasil diajukan dan menunggu validasi Satpam", status `Pending` |
| TC-KL08 | FR-04 | Invalid | Klaim barang yang sama saat klaim pertama masih Pending | 409 | 409, "Anda sudah mengajukan klaim untuk barang ini dan masih menunggu validasi" |
| TC-KL09 | FR-04 | Normal | `GET /api/klaim/saya` | 200, memuat klaim akun | 200, berisi klaim yang baru diajukan |
| TC-KL10 | FR-05 | Invalid | `GET /api/klaim/pending` dengan token civitas | 403 | 403, "Anda tidak punya akses ke fitur ini" |
| TC-KL11 | FR-05 | Normal | `GET /api/klaim/pending` dengan token satpam | 200, daftar klaim Pending | 200, daftar klaim beserta nomor loker |
| TC-KL12 | FR-09 | Invalid | `serahkan` klaim yang masih Pending | 409 | 409, "Klaim belum atau tidak dapat diserahkan (status: Pending)" |
| TC-KL13 | FR-05 | Invalid | Tolak tanpa alasan | 400 | 400, "Alasan penolakan wajib diisi" |
| TC-KL14 | FR-05 | Normal | Setujui klaim Pending | 200, status `Disetujui` | 200, "Klaim disetujui. Barang siap diambil oleh pengaju" |
| TC-KL15 | FR-05 | Invalid | Setujui klaim yang sudah diproses | 409 | 409, "Klaim sudah diproses (status: Disetujui)" |
| TC-KL16 | FR-09 | Normal | `GET /api/klaim/:id/kandidat-hilang` | 200, laporan hilang Dicari milik pengaju | 200, daftar kandidat dengan penanda `kategoriSama` |
| TC-KL17 | FR-09 | Invalid | `serahkan` dengan `idLaporanHilang` milik akun lain | 400, transaksi batal | 400, "Laporan hilang yang dipilih tidak valid"; klaim tetap Disetujui |
| TC-KL18 | FR-09 | Normal | `serahkan` dengan `idLaporanHilang` milik pengaju | 200; klaim, temuan, dan hilang `Selesai`; loker `kosong` | 200, "Barang telah diserahkan kepada pemilik dan loker dikosongkan"; status klaim, temuan, dan hilang `Selesai`, loker `kosong` |
| TC-KL19 | FR-09 | Invalid | `serahkan` ulang klaim yang sudah Selesai | 409 | 409, "Klaim belum atau tidak dapat diserahkan (status: Selesai)" |
| TC-KL20 | Tambahan | Edge (privasi) | `GET /api/katalog/hilang` dan cari `kontak` pada respons | Kontak tidak muncul | Tidak ada field `kontak` pada respons |
| TC-KL21 | Tambahan | Invalid | `POST /api/laporan/:id/ditemukan` pada laporan hilang milik akun lain | 404 | 404, "Laporan tidak ditemukan" |
| TC-KL22 | Tambahan | Normal | `ditemukan` oleh pemilik laporan hilang berstatus Dicari | 200, status `Selesai` | 200, "Laporan ditandai sudah ketemu" |
| TC-KL23 | Tambahan | Invalid | `ditemukan` ulang pada laporan yang sudah Selesai | 409 | 409, "Laporan sudah diproses (status: Selesai)" |

Tanda † berarti kasus dijalankan ulang di Linux dengan MariaDB pada 24 November 2026; TC-V17 (konkurensi) belum dijalankan ulang.

Catatan: query memakai parameter (`?`), sehingga input seperti pada TC-08 diperlakukan sebagai data, bukan perintah SQL. Karakter HTML pada TC-11 disimpan apa adanya; pencegahan XSS dilakukan saat data ditampilkan di antarmuka, di luar cakupan tugas ini.

Riwayat perintah terminal pengerjaan dan pengujian terlampir di LMS sebagai bukti pengerjaan.

## 5. Daftar Kontribusi Anggota

| Anggota                      | Kontribusi |
| ---------------------------- | ---------- |
| Faiz Abyakta Santoso         | models, routes |
| Fandy Ahmad Fahrezy          | controllers, utils, WhatsApp Gateway, pengujian dan|
| Muhammad Ghassan Dzul Hannan | validasi, perbaikan code review, pengujian, frontend (React), fitur klaim, katalog hilang, dan penyerahan barang |
| Yazid Dio Alamgir            | README, desain logo, service |
