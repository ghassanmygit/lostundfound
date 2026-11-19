import { useState } from "react";
import { apiRequest } from "../api/client";
import { kategoriList } from "../utils/format";
import { cekFoto } from "../utils/foto";
import Alert from "./Alert";
import FormField from "./FormField";
import FotoField from "./FotoField";
import SelectField from "./SelectField";
import TextareaField from "./TextareaField";

const tanpaError = { message: "", details: [] };

function FormLaporTemuan({ onBerhasil }) {
  const [form, setForm] = useState({
    namaBarang: "",
    kategori: "",
    deskripsi: "",
    lokasiPenitipan: "",
  });
  const [foto, setFoto] = useState(null);
  const [error, setError] = useState(tanpaError);
  const [loading, setLoading] = useState(false);

  const setField = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(tanpaError);

    if (!foto) {
      setError({ message: "Foto barang wajib diunggah", details: [] });
      return;
    }
    const pesanFoto = cekFoto(foto);
    if (pesanFoto) {
      setError({ message: pesanFoto, details: [] });
      return;
    }

    const body = new FormData();
    Object.entries(form).forEach(([key, value]) => body.append(key, value));
    body.append("fotoBarang", foto);

    setLoading(true);
    try {
      await apiRequest("/laporan/temuan", {
        method: "POST",
        body,
        isForm: true,
      });
      onBerhasil(
        "Laporan temuan terkirim. Barang akan tampil di katalog setelah diverifikasi satpam.",
      );
    } catch (err) {
      setError({ message: err.message, details: err.details });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Alert message={error.message} details={error.details} />

      <FormField
        id="namaBarang"
        label="Nama Barang"
        icon="tag"
        maxLength={100}
        placeholder="Contoh: Dompet kulit hitam"
        value={form.namaBarang}
        onChange={setField("namaBarang")}
        required
      />
      <SelectField
        id="kategori"
        label="Kategori"
        value={form.kategori}
        onChange={setField("kategori")}
        required
      >
        <option value="">Pilih kategori</option>
        {kategoriList.map((k) => (
          <option key={k} value={k}>
            {k}
          </option>
        ))}
      </SelectField>
      <TextareaField
        id="deskripsi"
        label="Deskripsi (opsional)"
        rows={3}
        maxLength={500}
        placeholder="Ciri-ciri barang, tanpa membuka isi atau identitas pemilik"
        value={form.deskripsi}
        onChange={setField("deskripsi")}
      />
      <FormField
        id="lokasiPenitipan"
        label="Dititipkan di Pos Satpam"
        icon="pin"
        maxLength={150}
        placeholder="Contoh: Pos Satpam Gerbang Utama"
        value={form.lokasiPenitipan}
        onChange={setField("lokasiPenitipan")}
        required
      />
      <FotoField
        id="fotoBarang"
        label="Foto Barang"
        file={foto}
        onChange={setFoto}
      />

      <button className="btn" type="submit" disabled={loading}>
        {loading ? "Mengirim..." : "Kirim Laporan Temuan"}
      </button>
    </form>
  );
}

export default FormLaporTemuan;
