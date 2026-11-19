import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { apiRequest, clearToken } from "../api/client";
import Alert from "../components/Alert";
import { formatTanggal, urlFoto } from "../utils/format";
import "./Katalog.css";
import "./LaporanSaya.css";

const slugStatus = (status) => status.toLowerCase().replace(/\s+/g, "-");

function LaporanSaya() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [daftar, setDaftar] = useState(null);
  const [error, setError] = useState("");

  // Pesan sukses hanya tampil sekali, tidak muncul lagi setelah refresh.
  useEffect(() => {
    window.history.replaceState({}, "");
  }, []);

  useEffect(() => {
    let batal = false;
    apiRequest("/laporan/saya")
      .then((res) => {
        if (!batal) setDaftar(res.data);
      })
      .catch((err) => {
        if (batal) return;
        if (err.status === 401) {
          clearToken();
          navigate("/login");
          return;
        }
        setError(err.message);
      });
    return () => {
      batal = true;
    };
  }, [navigate]);

  return (
    <section>
      <h1 className="judul">Laporan Saya</h1>
      <p className="judul-sub">
        {daftar ? `${daftar.length} laporan` : "Memuat..."}
      </p>

      <Alert type="ok" message={state?.pesan} />
      <Alert message={error} />

      {daftar && daftar.length === 0 && (
        <p className="kosong">
          Belum ada laporan. <Link to="/lapor">Buat laporan pertama</Link>
        </p>
      )}

      <div className="lap-daftar">
        {daftar?.map((item) => {
          const foto = urlFoto(item.fotoBarang);
          return (
            <article className="lap" key={item.idLaporan}>
              <div className="lap-foto">
                {foto ? (
                  <img src={foto} alt={item.namaBarang} loading="lazy" />
                ) : (
                  <span>Tanpa foto</span>
                )}
              </div>
              <div className="lap-isi">
                <div className="lap-baris">
                  <span className="jenis">
                    {item.jenisLaporan === "temuan" ? "Temuan" : "Hilang"}
                  </span>
                  <span className={`status status-${slugStatus(item.status)}`}>
                    {item.status}
                  </span>
                </div>
                <h3>{item.namaBarang}</h3>
                <p className="lap-meta">
                  {item.jenisLaporan === "temuan"
                    ? `Dititipkan di ${item.lokasiPenitipan}`
                    : `Terakhir dilihat di ${item.lokasiTerakhir}`}
                </p>
                <small>{formatTanggal(item.tanggal)}</small>
                {item.status === "Ditolak" && item.alasanPenolakan && (
                  <p className="lap-tolak">Alasan: {item.alasanPenolakan}</p>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default LaporanSaya;
