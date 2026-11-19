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

function FormLaporHilang({ onBerhasil }) {
  const [form, setForm] = useState({
    namaBarang: "",
    kategori: "",
    deskripsi: "",
    lokasiTerakhir: "",
    kontak: "",
  });
  const [foto, setFoto] = useState(null);
  const [error, setError] = useState(tanpaError);
  const [loading, setLoading] = useState(false);

  const setField = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(tanpaError);

    // Foto bersifat opsional: tidak semua pemilik punya foto barangnya.
    const pesanFoto = foto ? cekFoto(foto) : "";
    if (pesanFoto) {
      setError({ message: pesanFoto, details: [] });
      return;
    }

    const body = new FormData();
    Object.entries(form).forEach(([key, value]) => body.append(key, value));
    if (foto) body.append("fotoBarang", foto);

    setLoading(true);
    try {
      await apiRequest("/laporan/hilang", {
        method: "POST",
        body,
        isForm: true,
      });
      onBerhasil("Laporan barang hilang berhasil dibuat.");
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
        placeholder="Contoh: Tas ransel biru"
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
        label="Ciri-ciri Barang (opsional)"
        rows={3}
        maxLength={500}
        placeholder="Warna, merek, tanda khusus"
        value={form.deskripsi}
        onChange={setField("deskripsi")}
      />
      <FormField
        id="lokasiTerakhir"
        label="Lokasi Terakhir Dilihat"
        icon="pin"
        maxLength={150}
        placeholder="Contoh: Perpustakaan lantai 2"
        value={form.lokasiTerakhir}
        onChange={setField("lokasiTerakhir")}
        required
      />
      <FormField
        id="kontak"
        label="Nomor WhatsApp"
        icon="phone"
        type="tel"
        autoComplete="tel"
        placeholder="08123456789"
        hint="8-15 digit, boleh diawali +"
        value={form.kontak}
        onChange={setField("kontak")}
        required
      />
      <FotoField
        id="fotoBarang"
        label="Foto Barang (opsional)"
        file={foto}
        onChange={setFoto}
      />

      <button className="btn" type="submit" disabled={loading}>
        {loading ? "Mengirim..." : "Kirim Laporan Kehilangan"}
      </button>
    </form>
  );
}

export default FormLaporHilang;
