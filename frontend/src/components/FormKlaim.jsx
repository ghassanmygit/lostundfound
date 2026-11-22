import { useState } from "react";
import { apiRequest } from "../api/client";
import { cekFoto } from "../utils/foto";
import Alert from "./Alert";
import FotoField from "./FotoField";
import TextareaField from "./TextareaField";

const tanpaError = { message: "", details: [] };

function FormKlaim({ idLaporan, onBerhasil, onSessionHabis }) {
  const [terbuka, setTerbuka] = useState(false);
  const [ciriKhusus, setCiriKhusus] = useState("");
  const [foto, setFoto] = useState(null);
  const [error, setError] = useState(tanpaError);
  const [loading, setLoading] = useState(false);

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
