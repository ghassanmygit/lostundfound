import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiRequest, clearToken } from "../api/client";
import Alert from "../components/Alert";
import { formatTanggal, urlFoto } from "../utils/format";
import "./Katalog.css";

function DetailBarang() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [barang, setBarang] = useState(null);
  const [error, setError] = useState({ message: "", details: [] });

  useEffect(() => {
    let batal = false;
    setBarang(null);
    setError({ message: "", details: [] });
    apiRequest(`/katalog/${id}`)
      .then((res) => {
        if (!batal) setBarang(res.data);
      })
      .catch((err) => {
        if (batal) return;
        if (err.status === 401) {
          clearToken();
          navigate("/login");
          return;
        }
        setError({ message: err.message, details: err.details });
      });
    return () => {
      batal = true;
    };
  }, [id, navigate]);

  const foto = barang && urlFoto(barang.fotoBarang);

  return (
    <section>
      <Link to="/katalog" className="kembali">
        &larr; Kembali ke katalog
      </Link>

      <Alert message={error.message} details={error.details} />
      {!barang && !error.message && <p className="kosong">Memuat...</p>}

      {barang && (
        <article className="detail">
          <div className="detail-foto">
            {foto ? (
              <img src={foto} alt={barang.namaBarang} />
            ) : (
              <span className="kartu-kosong">Tanpa foto</span>
            )}
          </div>
          <div className="detail-isi">
            <span className="badge badge-biru">{barang.kategori}</span>
            <h1>{barang.namaBarang}</h1>
            <p className="deskripsi">{barang.deskripsi}</p>
            <dl>
              <dt>Lokasi penitipan</dt>
              <dd>{barang.lokasiPenitipan}</dd>
              <dt>Tanggal ditemukan</dt>
              <dd>{formatTanggal(barang.tanggal)}</dd>
            </dl>
          </div>
        </article>
      )}
    </section>
  );
}

export default DetailBarang;
