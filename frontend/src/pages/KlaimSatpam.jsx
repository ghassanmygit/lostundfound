import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest, clearToken } from "../api/client";
import Alert from "../components/Alert";
import KartuKlaim from "../components/KartuKlaim";
import "./DashboardSatpam.css";
import "./Katalog.css";
import "./KlaimSatpam.css";

const tanpaNotice = { type: "ok", message: "", details: [] };

function KlaimSatpam() {
  const navigate = useNavigate();
  const [pending, setPending] = useState([]);
  const [disetujui, setDisetujui] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(tanpaNotice);

  const muat = useCallback(async () => {
    try {
      const [p, d] = await Promise.all([
        apiRequest("/klaim/pending"),
        apiRequest("/klaim/disetujui"),
      ]);
      setPending(p.data);
      setDisetujui(d.data);
    } catch (err) {
      if (err.status === 401) {
        clearToken();
        navigate("/login");
        return;
      }
      setNotice({ type: "error", message: err.message, details: err.details });
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    muat();
  }, [muat]);

  const handleSelesai = (pesan) => {
    setNotice({ type: "ok", message: pesan, details: [] });
    muat();
  };

  // Klaim sudah diproses pihak lain: tampilkan pesan, muat ulang.
  const handleSinkron = (err) => {
    setNotice({ type: "error", message: err.message, details: err.details });
    muat();
  };

  return (
    <section>
      <h1 className="judul">Klaim Barang</h1>
      <p className="judul-sub">
        {loading
          ? "Memuat..."
          : `${pending.length} menunggu validasi · ${disetujui.length} menunggu diambil`}
      </p>

      <div className="notice">
        <Alert {...notice} />
      </div>

      <h2 className="sub-judul">Menunggu validasi</h2>
      {!loading && pending.length === 0 && (
        <p className="kosong">Tidak ada klaim yang menunggu validasi.</p>
      )}
      <div className="verif-daftar">
        {pending.map((k) => (
          <KartuKlaim
            key={k.idKlaim}
            klaim={k}
            mode="pending"
            onSelesai={handleSelesai}
            onSinkron={handleSinkron}
          />
        ))}
      </div>

      <h2 className="sub-judul">Menunggu diambil pemilik</h2>
      {!loading && disetujui.length === 0 && (
        <p className="kosong">Tidak ada barang yang menunggu diambil.</p>
      )}
      <div className="verif-daftar">
        {disetujui.map((k) => (
          <KartuKlaim
            key={k.idKlaim}
            klaim={k}
            mode="disetujui"
            onSelesai={handleSelesai}
            onSinkron={handleSinkron}
          />
        ))}
      </div>
    </section>
  );
}

export default KlaimSatpam;
