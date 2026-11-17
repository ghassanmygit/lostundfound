import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest, clearToken } from "../api/client";
import Alert from "../components/Alert";
import KartuVerifikasi from "../components/KartuVerifikasi";
import "./DashboardSatpam.css";
import "./Katalog.css";

const tanpaNotice = { type: "ok", message: "", details: [] };

function DashboardSatpam() {
  const navigate = useNavigate();
  const [laporan, setLaporan] = useState([]);
  const [loker, setLoker] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(tanpaNotice);

  const muat = useCallback(async () => {
    try {
      const [daftarLaporan, daftarLoker] = await Promise.all([
        apiRequest("/laporan/menunggu"),
        apiRequest("/loker/kosong"),
      ]);
      setLaporan(daftarLaporan.data);
      setLoker(daftarLoker.data);
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

  // Laporan atau loker sudah diproses pihak lain: tampilkan pesan, muat ulang.
  const handleSinkron = (err) => {
    setNotice({ type: "error", message: err.message, details: err.details });
    muat();
  };

  return (
    <section>
      <h1 className="judul">Verifikasi Laporan</h1>
      <p className="judul-sub">
        {loading
          ? "Memuat..."
          : `${laporan.length} laporan menunggu · ${loker.length} loker kosong`}
      </p>

      <div className="notice">
        <Alert {...notice} />
      </div>

      {!loading && laporan.length === 0 && (
        <p className="kosong">Tidak ada laporan yang menunggu verifikasi.</p>
      )}

      <div className="verif-daftar">
        {laporan.map((item) => (
          <KartuVerifikasi
            key={item.idLaporan}
            laporan={item}
            loker={loker}
            onSelesai={handleSelesai}
            onSinkron={handleSinkron}
          />
        ))}
      </div>
    </section>
  );
}

export default DashboardSatpam;
