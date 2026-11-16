import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest, saveToken } from "../api/client";
import "./Login.css";

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
      navigate("/katalog");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login">
      <div className="login-hero" aria-hidden="true">
        <svg
          viewBox="0 0 120 120"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="52" cy="52" r="30" />
          <path d="M74 74l26 26" />
          <path d="M38 52h28M52 38v28" stroke="var(--kuning)" />
        </svg>
      </div>

      <section className="login-card">
        <h1>Masuk</h1>
        <p className="sub">Lost &amp; Found UIN Jakarta</p>

        <form onSubmit={handleSubmit} noValidate>
          {error && (
            <p className="alert-error" role="alert">
              {error}{" "}
              {error.includes("belum aktif") && (
                <Link to="/kirim-ulang-verifikasi">Kirim ulang tautan</Link>
              )}
            </p>
          )}

          <div className="field">
            <label htmlFor="email">Email Kampus</label>
            <div className="input-wrap">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="5" width="18" height="14" rx="3" />
                <path d="M4 8l8 6 8-6" />
              </svg>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="nama@mhs.uinjkt.ac.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="password">Kata Sandi</label>
            <div className="input-wrap">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="5" y="11" width="14" height="9" rx="3" />
                <path d="M8 11V8a4 4 0 018 0v3" />
              </svg>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="Masukkan kata sandi"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <p className="login-links">
          <Link to="/kirim-ulang-verifikasi">
            Kirim ulang tautan verifikasi
          </Link>
        </p>
        <p className="login-daftar">
          Belum punya akun? <Link to="/registrasi">Daftar</Link>
        </p>
      </section>
    </main>
  );
}

export default Login;
