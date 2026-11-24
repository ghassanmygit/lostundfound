import { useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api/client";
import Alert from "../components/Alert";
import AuthLayout from "../components/AuthLayout";
import FormField from "../components/FormField";

function KirimUlangVerifikasi() {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState({
    type: "ok",
    message: "",
    details: [],
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResult({ type: "ok", message: "", details: [] });
    setLoading(true);
    try {
      const res = await apiRequest("/auth/kirim-ulang-verifikasi", {
        method: "POST",
        body: { email },
      });
      setResult({ type: "ok", message: res.message, details: [] });
    } catch (err) {
      setResult({ type: "error", message: err.message, details: err.details });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Kirim Ulang" subtitle="Tautan verifikasi akun">
      <form onSubmit={handleSubmit} noValidate>
        <Alert {...result} />

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

        <button className="btn" type="submit" disabled={loading}>
          {loading ? "Memproses..." : "Kirim"}
        </button>
      </form>

      <p className="auth-switch">
        Kembali ke <Link to="/login">Masuk</Link>
      </p>
    </AuthLayout>
  );
}

export default KirimUlangVerifikasi;
