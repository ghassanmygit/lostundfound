import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest, saveToken } from "../api/client";
import Alert from "../components/Alert";
import AuthLayout from "../components/AuthLayout";
import FormField from "../components/FormField";

function Login() {
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
      navigate(res.data.pengguna.role === "satpam" ? "/satpam" : "/katalog");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Masuk" subtitle="Lost & Found UIN Jakarta">
      <form onSubmit={handleSubmit} noValidate>
        <Alert message={error}>
          {error.includes("belum aktif") && (
            <Link to="/kirim-ulang-verifikasi">Kirim ulang tautan</Link>
          )}
        </Alert>

        <FormField
          id="email"
          label="Email Kampus"
          icon="mail"
          type="email"
          autoComplete="email"
          placeholder="Email resmi kampus"
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

      <p className="auth-links">
        <Link to="/kirim-ulang-verifikasi">Kirim ulang tautan verifikasi</Link>
      </p>
      <p className="auth-switch">
        Belum punya akun? <Link to="/registrasi">Daftar</Link>
      </p>
    </AuthLayout>
  );
}

export default Login;
