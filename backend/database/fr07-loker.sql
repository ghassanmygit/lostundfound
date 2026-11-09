-- FR-07 (verifikasi laporan temuan) dan FR-06 (loker). Jalankan sekali.
USE lostundfound;

CREATE TABLE loker (
  id_loker INT AUTO_INCREMENT PRIMARY KEY,
  nomor_loker VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'kosong',
  UNIQUE KEY uq_loker_nomor (nomor_loker)
);

CREATE TABLE penempatan_loker (
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

ALTER TABLE laporan
  ADD COLUMN alasan_penolakan VARCHAR(255) NULL AFTER status;

INSERT INTO loker (nomor_loker) VALUES ('L-01'), ('L-02'), ('L-03');
