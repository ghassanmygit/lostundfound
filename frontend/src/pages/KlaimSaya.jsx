import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { apiRequest, clearToken } from "../api/client";
import Alert from "../components/Alert";
import { formatTanggal, urlFoto } from "../utils/format";
import "./Katalog.css";
import "./LaporanSaya.css";
import "./KlaimSaya.css";

const keterangan = {
  Pending: "Menunggu validasi satpam.",
  Disetujui: "Klaim disetujui. Temui satpam untuk mengambil barang.",
  Selesai: "Barang sudah diserahkan.",
};

function KlaimSaya() {
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
    apiRequest("/klaim/saya")
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
      <h1 className="judul">Klaim Saya</h1>
      <p className="judul-sub">
        {daftar ? `${daftar.length} klaim` : "Memuat..."}
      </p>

      <Alert type="ok" message={state?.pesan} />
      <Alert message={error} />

      {daftar && daftar.length === 0 && (
        <p className="kosong">
          Belum ada klaim. Cari barangmu di{" "}
          <Link to="/katalog">katalog temuan</Link>.
        </p>
      )}

      <div className="lap-daftar">
        {daftar?.map((item) => {
          const foto = urlFoto(item.fotoBukti);
          return (
            <article className="lap" key={item.idKlaim}>
              <div className="lap-foto">
                {foto ? (
                  <img src={foto} alt="Foto bukti klaim" loading="lazy" />
                ) : (
                  <span>Tanpa foto</span>
                )}
              </div>
              <div className="lap-isi">
                <div className="lap-baris">
                  <span className="jenis">Klaim</span>
                  <span
                    className={`status status-${item.status.toLowerCase()}`}
                  >
                    {item.status}
                  </span>
                </div>
                <h3>{item.namaBarang}</h3>
                <p className="lap-meta">Ciri khusus: {item.ciriKhusus}</p>
                <small>{formatTanggal(item.tanggal)}</small>
                {keterangan[item.status] && (
                  <p className="klaim-ket">{keterangan[item.status]}</p>
                )}
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

export default KlaimSaya;
