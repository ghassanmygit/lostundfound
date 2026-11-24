import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest, clearToken, saveToken } from "../api/client";
import Alert from "../components/Alert";
import AuthLayout from "../components/AuthLayout";
import FormField from "../components/FormField";

function LoginPetugas() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await apiRequest("/auth/login", {
        method: "POST",
        body: { email, password },
      });
      saveToken(res.data.token);
      if (res.data.pengguna.role !== "satpam") {
        // Halaman ini hanya tampilan; hak akses tetap dijaga backend.
        clearToken();
        setError("Akun ini bukan akun petugas. Gunakan halaman masuk biasa.");
        return;
      }
      navigate("/satpam");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout lipat title="Masuk Petugas" subtitle="Satpam Lost & Found">
      <form onSubmit={handleSubmit} noValidate>
        <Alert message={error} />

        <FormField
          id="email"
          label="Email Petugas"
          icon="mail"
          type="email"
          autoComplete="email"
          placeholder="nama@uinjkt.ac.id"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <FormField
          id="password"
          label="Kata Sandi"
          icon="lock"
          type="password"
          autoComplete="current-password"
          placeholder="Masukkan kata sandi"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="btn" type="submit" disabled={loading}>
          {loading ? "Memproses..." : "Masuk"}
        </button>
      </form>

      <p className="auth-switch">
        Bukan petugas?{" "}
        <Link className="link-gelap" to="/login">
          Masuk sebagai civitas
        </Link>
      </p>
    </AuthLayout>
  );
}

export default LoginPetugas;
