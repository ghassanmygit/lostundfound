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

CREATE TABLE IF NOT EXISTS klaim (
  id_klaim INT AUTO_INCREMENT PRIMARY KEY,
  id_laporan INT NOT NULL,
  id_pengklaim INT NOT NULL,
  id_validator INT NULL,
  foto_bukti VARCHAR(255) NOT NULL,
  ciri_khusus VARCHAR(500) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'Pending',
  alasan_penolakan VARCHAR(255) NULL,
  tanggal DATETIME NOT NULL,
  FOREIGN KEY (id_laporan) REFERENCES laporan(id_laporan),
  FOREIGN KEY (id_pengklaim) REFERENCES pengguna(id_pengguna),
  FOREIGN KEY (id_validator) REFERENCES pengguna(id_pengguna)
);

INSERT IGNORE INTO loker (nomor_loker) VALUES ('L-01'), ('L-02'), ('L-03');