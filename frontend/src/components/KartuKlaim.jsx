import { useEffect, useState } from "react";
import { apiRequest } from "../api/client";
import { formatTanggal, urlFoto } from "../utils/format";
import Alert from "./Alert";

const tanpaError = { message: "", details: [] };

// mode "pending": satpam menyetujui/menolak. mode "disetujui": satpam
// menyerahkan barang ke pemilik dan loker dikosongkan.
function KartuKlaim({ klaim, mode, onSelesai, onSinkron }) {
  const [tolak, setTolak] = useState(false);
  const [alasan, setAlasan] = useState("");
  const [sibuk, setSibuk] = useState(false);
  const [kandidat, setKandidat] = useState([]);
  const [pilihan, setPilihan] = useState("");
  const [error, setError] = useState(tanpaError);

  const fotoBarang = urlFoto(klaim.fotoBarang);
  const fotoBukti = urlFoto(klaim.fotoBukti);

  useEffect(() => {
    if (mode !== "disetujui") return;
    let batal = false;
    apiRequest(`/klaim/${klaim.idKlaim}/kandidat-hilang`)
      .then((res) => {
        if (batal) return;
        setKandidat(res.data);
        const tertaut = res.data.find(
          (k) => k.idLaporan === klaim.idLaporanHilang,
        );
        const sama = res.data.find((k) => k.kategoriSama);
        const awal = tertaut ?? sama;
        setPilihan(awal ? String(awal.idLaporan) : "");
      })
      .catch(() => {
        // Daftar gagal dimuat: penyerahan tetap bisa, tanpa menutup laporan hilang.
      });
    return () => {
      batal = true;
    };
  }, [mode, klaim.idKlaim, klaim.idLaporanHilang]);

  const kirim = async (aksi, body, pesanSukses) => {
    setError(tanpaError);
    setSibuk(true);
    try {
      await apiRequest(`/klaim/${klaim.idKlaim}/${aksi}`, {
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

  const handleSetujui = () =>
    kirim("setujui", undefined, `Klaim atas "${klaim.namaBarang}" disetujui`);

  const handleTolak = () =>
    kirim("tolak", { alasan }, `Klaim atas "${klaim.namaBarang}" ditolak`);

  const handleSerahkan = () => {
    const dipilih = kandidat.find((k) => String(k.idLaporan) === pilihan);
    const yakin = window.confirm(
      `Serahkan "${klaim.namaBarang}" kepada ${klaim.namaPengklaim}? Loker ${klaim.nomorLoker ?? ""} akan dikosongkan.${dipilih ? ` Laporan hilang "${dipilih.namaBarang}" ikut ditutup.` : ""}`,
    );
    if (!yakin) return;
    kirim(
      "serahkan",
      { idLaporanHilang: pilihan ? Number(pilihan) : null },
      `"${klaim.namaBarang}" diserahkan. Loker dikosongkan`,
    );
  };

  return (
    <article className="verif klaim-kartu">
      <div className="klaim-fotos">
        <figure>
          {fotoBarang ? (
            <img src={fotoBarang} alt="Foto barang di loker" loading="lazy" />
          ) : (
            <span className="kartu-kosong">Tanpa foto</span>
          )}
          <figcaption>Foto barang</figcaption>
        </figure>
        <figure>
          {fotoBukti ? (
            <img src={fotoBukti} alt="Foto bukti klaim" loading="lazy" />
          ) : (
            <span className="kartu-kosong">Tanpa foto</span>
          )}
          <figcaption>Foto bukti</figcaption>
        </figure>
      </div>

      <div className="verif-isi">
        <span className="badge badge-biru">
          Loker {klaim.nomorLoker ?? "-"}
        </span>
        <h3>{klaim.namaBarang}</h3>
        <dl>
          <dt>Ciri barang menurut pelapor</dt>
          <dd>{klaim.deskripsiBarang || "-"}</dd>
          <dt>Ciri khusus menurut pengklaim</dt>
          <dd>{klaim.ciriKhusus}</dd>
          {klaim.namaBarangHilang && (
            <>
              <dt>Tertaut ke laporan kehilangan</dt>
              <dd>
                {klaim.namaBarangHilang} · terakhir dilihat di{" "}
                {klaim.lokasiTerakhirHilang}
              </dd>
            </>
          )}
          <dt>Pengklaim</dt>
          <dd>
            {klaim.namaPengklaim}
            {klaim.noWaPengklaim ? ` · ${klaim.noWaPengklaim}` : ""}
          </dd>
          <dt>Tanggal klaim</dt>
          <dd>{formatTanggal(klaim.tanggal)}</dd>
        </dl>

        <Alert message={error.message} details={error.details} />

        {mode === "disetujui" ? (
          <div className="verif-aksi verif-serah">
            {kandidat.length > 0 && (
              <label className="serah-pilih">
                <span>Tutup laporan kehilangan pemilik</span>
                <select
                  value={pilihan}
                  onChange={(e) => setPilihan(e.target.value)}
                  disabled={sibuk}
                >
                  {kandidat.map((c) => (
                    <option key={c.idLaporan} value={c.idLaporan}>
                      {c.namaBarang}
                      {c.kategoriSama ? " (kategori sama)" : ""}
                    </option>
                  ))}
                  <option value="">Tidak ada yang ditutup</option>
                </select>
              </label>
            )}
            <button
              type="button"
              className="btn"
              disabled={sibuk}
              onClick={handleSerahkan}
            >
              {sibuk ? "Memproses..." : "Serahkan barang"}
            </button>
          </div>
        ) : !tolak ? (
          <div className="verif-aksi">
            <button
              type="button"
              className="btn"
              disabled={sibuk}
              onClick={handleSetujui}
            >
              {sibuk ? "Memproses..." : "Setujui"}
            </button>
            <button
              type="button"
              className="btn-teks"
              disabled={sibuk}
              onClick={() => setTolak(true)}
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
              {sibuk ? "Memproses..." : "Tolak klaim"}
            </button>
            <button
              type="button"
              className="btn-teks"
              disabled={sibuk}
              onClick={() => setTolak(false)}
            >
              Batal
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

export default KartuKlaim;
