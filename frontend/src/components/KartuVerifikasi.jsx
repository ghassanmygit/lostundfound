import { useState } from "react";
import { apiRequest } from "../api/client";
import { formatTanggal, urlFoto } from "../utils/format";
import Alert from "./Alert";

const tanpaError = { message: "", details: [] };

function KartuVerifikasi({ laporan, loker, onSelesai, onSinkron }) {
  const [idLokerDipilih, setIdLokerDipilih] = useState("");
  const [mode, setMode] = useState("verifikasi");
  const [alasan, setAlasan] = useState("");
  const [sibuk, setSibuk] = useState(false);
  const [error, setError] = useState(tanpaError);

  // Loker yang dipilih bisa hilang dari daftar karena dipakai laporan lain.
  const idLoker = loker.some((l) => String(l.idLoker) === idLokerDipilih)
    ? idLokerDipilih
    : "";
  const foto = urlFoto(laporan.fotoBarang);

  const kirim = async (aksi, body, pesanSukses) => {
    setError(tanpaError);
    setSibuk(true);
    try {
      await apiRequest(`/laporan/${laporan.idLaporan}/${aksi}`, {
        method: "POST",
        body,
      });
      onSelesai(pesanSukses);
    } catch (err) {
      setError({ message: err.message, details: err.details });
      if (err.status === 404 || err.status === 409) onSinkron(err);
      setSibuk(false);
    }
  };

  const handleVerifikasi = () =>
    kirim(
      "verifikasi",
      { idLoker: Number(idLoker) },
      `"${laporan.namaBarang}" terverifikasi dan tersedia di katalog`,
    );

  const handleTolak = () =>
    kirim("tolak", { alasan }, `Laporan "${laporan.namaBarang}" ditolak`);

  return (
    <article className="verif">
      <div className="verif-foto">
        {foto ? (
          <img src={foto} alt={laporan.namaBarang} loading="lazy" />
        ) : (
          <span className="kartu-kosong">Tanpa foto</span>
        )}
      </div>

      <div className="verif-isi">
        <span className="badge badge-biru">{laporan.kategori}</span>
        <h3>{laporan.namaBarang}</h3>
        <p className="deskripsi">{laporan.deskripsi}</p>
        <dl>
          <dt>Lokasi penitipan</dt>
          <dd>{laporan.lokasiPenitipan}</dd>
          <dt>Tanggal lapor</dt>
          <dd>{formatTanggal(laporan.tanggal)}</dd>
          {laporan.kontak && (
            <>
              <dt>Kontak pelapor</dt>
              <dd>{laporan.kontak}</dd>
            </>
          )}
        </dl>

        <Alert message={error.message} details={error.details} />

        {mode === "verifikasi" ? (
          <div className="verif-aksi">
            <select
              value={idLoker}
              onChange={(e) => setIdLokerDipilih(e.target.value)}
              aria-label="Pilih loker"
              disabled={sibuk || loker.length === 0}
            >
              <option value="">
                {loker.length === 0 ? "Tidak ada loker kosong" : "Pilih loker"}
              </option>
              {loker.map((l) => (
                <option key={l.idLoker} value={l.idLoker}>
                  Loker {l.nomorLoker}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="btn"
              disabled={!idLoker || sibuk}
              onClick={handleVerifikasi}
            >
              {sibuk ? "Memproses..." : "Verifikasi"}
            </button>
            <button
              type="button"
              className="btn-teks"
              disabled={sibuk}
              onClick={() => setMode("tolak")}
            >
              Tolak
            </button>
          </div>
        ) : (
          <div className="verif-aksi verif-tolak">
            <textarea
              rows={3}
              maxLength={255}
              placeholder="Alasan penolakan"
              value={alasan}
              onChange={(e) => setAlasan(e.target.value)}
              disabled={sibuk}
            />
            <button
              type="button"
              className="btn btn-bahaya"
              disabled={!alasan.trim() || sibuk}
              onClick={handleTolak}
            >
              {sibuk ? "Memproses..." : "Tolak laporan"}
            </button>
            <button
              type="button"
              className="btn-teks"
              disabled={sibuk}
              onClick={() => setMode("verifikasi")}
            >
              Batal
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

export default KartuVerifikasi;
