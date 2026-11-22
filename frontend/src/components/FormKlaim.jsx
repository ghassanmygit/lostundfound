import { useEffect, useState } from "react";
import { apiRequest } from "../api/client";
import { cekFoto } from "../utils/foto";
import Alert from "./Alert";
import FotoField from "./FotoField";
import SelectField from "./SelectField";
import TextareaField from "./TextareaField";

const tanpaError = { message: "", details: [] };

function FormKlaim({ idLaporan, onBerhasil, onSessionHabis }) {
  const [terbuka, setTerbuka] = useState(false);
  const [ciriKhusus, setCiriKhusus] = useState("");
  const [foto, setFoto] = useState(null);
  const [idHilang, setIdHilang] = useState("");
  const [laporanHilang, setLaporanHilang] = useState([]);
  const [error, setError] = useState(tanpaError);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!terbuka) return;
    let batal = false;
    apiRequest("/laporan/saya")
      .then((res) => {
        if (batal) return;
        setLaporanHilang(
          res.data.filter(
            (l) => l.jenisLaporan === "hilang" && l.status === "Dicari",
          ),
        );
      })
      .catch(() => {});
    return () => {
      batal = true;
    };
  }, [terbuka]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(tanpaError);

    if (!ciriKhusus.trim()) {
      setError({ message: "Ciri khusus barang wajib diisi", details: [] });
      return;
    }
    if (!foto) {
      setError({
        message: "Foto bukti kepemilikan wajib diunggah",
        details: [],
      });
      return;
    }
    const pesanFoto = cekFoto(foto);
    if (pesanFoto) {
      setError({ message: pesanFoto, details: [] });
      return;
    }

    const body = new FormData();
    body.append("idLaporan", idLaporan);
    body.append("ciriKhusus", ciriKhusus.trim());
    body.append("fotoBukti", foto);
    if (idHilang) body.append("idLaporanHilang", idHilang);

    setLoading(true);
    try {
      await apiRequest("/klaim", { method: "POST", body, isForm: true });
      onBerhasil("Klaim terkirim. Tunggu validasi dari satpam.");
    } catch (err) {
      if (err.status === 401) {
        onSessionHabis();
        return;
      }
      setError({ message: err.message, details: err.details });
      setLoading(false);
    }
  };

  if (!terbuka) {
    return (
      <div className="klaim-form">
        <p className="klaim-tanya">Ini barang kamu?</p>
        <button type="button" className="btn" onClick={() => setTerbuka(true)}>
          Ajukan klaim
        </button>
      </div>
    );
  }

  return (
    <form className="klaim-form" onSubmit={handleSubmit} noValidate>
      <p className="klaim-tanya">Ajukan klaim</p>
      <Alert message={error.message} details={error.details} />

      <TextareaField
        id="ciriKhusus"
        label="Ciri Khusus Barang"
        rows={3}
        maxLength={500}
        placeholder="Sebutkan ciri yang hanya diketahui pemilik, mis. isi dompet, stiker, goresan"
        value={ciriKhusus}
        onChange={(e) => setCiriKhusus(e.target.value)}
        required
      />
      <FotoField
        id="fotoBukti"
        label="Foto Bukti Kepemilikan"
        file={foto}
        onChange={setFoto}
      />

      {laporanHilang.length > 0 && (
        <SelectField
          id="idLaporanHilang"
          label="Tautkan ke Laporan Kehilangan Saya (opsional)"
          value={idHilang}
          onChange={(e) => setIdHilang(e.target.value)}
        >
          <option value="">Tidak ditautkan</option>
          {laporanHilang.map((l) => (
            <option key={l.idLaporan} value={l.idLaporan}>
              {l.namaBarang}
            </option>
          ))}
        </SelectField>
      )}
      {laporanHilang.length > 0 && (
        <small className="field-hint">
          Laporan hilang yang dipilih otomatis ditutup saat barang diserahkan.
        </small>
      )}

      <button className="btn" type="submit" disabled={loading}>
        {loading ? "Mengirim..." : "Kirim Klaim"}
      </button>
      <button
        type="button"
        className="btn-teks"
        disabled={loading}
        onClick={() => setTerbuka(false)}
      >
        Batal
      </button>
    </form>
  );
}

export default FormKlaim;
