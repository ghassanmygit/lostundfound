import { useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api/client";
import Alert from "../components/Alert";
import AuthLayout from "../components/AuthLayout";
import FormField from "../components/FormField";

function Registrasi() {
  const [form, setForm] = useState({
    nama: "",
    email: "",
    noWa: "",
    password: "",
    konfirmasi: "",
  });
  const [error, setError] = useState({ message: "", details: [] });
  const [loading, setLoading] = useState(false);
  const [berhasil, setBerhasil] = useState(false);

  const setField = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError({ message: "", details: [] });

    if (form.password !== form.konfirmasi) {
      setError({ message: "Konfirmasi kata sandi tidak sama", details: [] });
      return;
    }

    setLoading(true);
    try {
      const body = {
        nama: form.nama,
        email: form.email,
        password: form.password,
      };
      if (form.noWa.trim()) body.noWa = form.noWa;
      await apiRequest("/auth/registrasi", { method: "POST", body });
      setBerhasil(true);
    } catch (err) {
      setError({ message: err.message, details: err.details });
    } finally {
      setLoading(false);
    }
  };

  if (berhasil) {
    return (
      <AuthLayout title="Cek Email" subtitle="Satu langkah lagi">
        <Alert
          type="ok"
          message={`Registrasi berhasil. Kami mengirim tautan verifikasi ke ${form.email}. Aktifkan akun lewat tautan itu sebelum masuk.`}
        />
        <Link className="btn btn-link" to="/login">
          Ke halaman masuk
        </Link>
        <p className="auth-links">
          <Link to="/kirim-ulang-verifikasi">
            Tautan belum sampai? Kirim ulang
          </Link>
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Daftar"
      subtitle="Untuk mahasiswa, dosen, dan staf UIN Jakarta"
    >
      <form onSubmit={handleSubmit} noValidate>
        <Alert message={error.message} details={error.details} />

        <FormField
          id="nama"
          label="Nama Lengkap"
          icon="user"
          autoComplete="name"
          placeholder="Nama lengkap"
          value={form.nama}
          onChange={setField("nama")}
          required
        />
        <FormField
          id="email"
          label="Email Kampus"
          icon="mail"
          type="email"
          autoComplete="email"
          placeholder="Email resmi kampus"
          hint="Mahasiswa: @mhs.uinjkt.ac.id. Dosen dan staf: @uinjkt.ac.id"
          value={form.email}
          onChange={setField("email")}
          required
        />
        <FormField
          id="noWa"
          label="Nomor WhatsApp (opsional)"
          icon="phone"
          type="tel"
          autoComplete="tel"
          placeholder="08123456789"
          hint="Untuk pemberitahuan status klaim"
          value={form.noWa}
          onChange={setField("noWa")}
        />
        <FormField
          id="password"
          label="Kata Sandi"
          icon="lock"
          type="password"
          autoComplete="new-password"
          placeholder="8-72 karakter"
          value={form.password}
          onChange={setField("password")}
          required
        />
        <FormField
          id="konfirmasi"
          label="Ulangi Kata Sandi"
          icon="lock"
          type="password"
          autoComplete="new-password"
          placeholder="Ulangi kata sandi"
          value={form.konfirmasi}
          onChange={setField("konfirmasi")}
          required
        />

        <button className="btn" type="submit" disabled={loading}>
          {loading ? "Memproses..." : "Daftar"}
        </button>
      </form>

      <p className="auth-switch">
        Sudah punya akun? <Link to="/login">Masuk</Link>
      </p>
    </AuthLayout>
  );
}

export default Registrasi;
