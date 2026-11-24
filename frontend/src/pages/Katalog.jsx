import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiRequest, clearToken } from "../api/client";
import Alert from "../components/Alert";
import KartuBarang from "../components/KartuBarang";
import { kategoriList } from "../utils/format";
import "./Katalog.css";

const teks = {
  temuan: {
    api: "/katalog",
    judul: "Barang Temuan",
    sub: (n) => `${n} barang menunggu pemiliknya`,
  },
  hilang: {
    api: "/katalog/hilang",
    judul: "Barang Hilang",
    sub: (n) => `${n} barang sedang dicari pemiliknya`,
  },
};

function Katalog({ jenis = "temuan" }) {
  const t = teks[jenis];
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const cari = params.get("cari") ?? "";
  const kategori = params.get("kategori") ?? "";
  const halaman = Number(params.get("halaman")) || 1;

  const [kataKunci, setKataKunci] = useState(cari);
  const [hasil, setHasil] = useState({ data: [], meta: null });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let batal = false;
    const query = new URLSearchParams({ halaman, batas: 12 });
    if (cari) query.set("cari", cari);
    if (kategori) query.set("kategori", kategori);

    setLoading(true);
    setError("");
    apiRequest(`${t.api}?${query}`)
      .then((res) => {
        if (!batal) setHasil({ data: res.data, meta: res.meta });
      })
      .catch((err) => {
        if (batal) return;
        if (err.status === 401) {
          clearToken();
          navigate("/login");
          return;
        }
        setError(err.message);
      })
      .finally(() => {
        if (!batal) setLoading(false);
      });

    return () => {
      batal = true;
    };
  }, [t.api, cari, kategori, halaman, navigate]);

  const ubahFilter = (perubahan) => {
    const next = new URLSearchParams(params);
    Object.entries({ halaman: "", ...perubahan }).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    setParams(next);
  };

  const handleCari = (e) => {
    e.preventDefault();
    ubahFilter({ cari: kataKunci.trim() });
  };

  const { data, meta } = hasil;

  return (
    <section>
      <h1 className="judul">{t.judul}</h1>
      <p className="judul-sub">{meta ? t.sub(meta.total) : "Memuat..."}</p>

      <form className="filter" onSubmit={handleCari}>
        <input
          type="search"
          placeholder="Cari nama atau ciri barang"
          maxLength={100}
          value={kataKunci}
          onChange={(e) => setKataKunci(e.target.value)}
        />
        <select
          value={kategori}
          onChange={(e) => ubahFilter({ cari, kategori: e.target.value })}
          aria-label="Kategori"
        >
          <option value="">Semua kategori</option>
          {kategoriList.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
        <button type="submit" className="btn">
          Cari
        </button>
      </form>

      <Alert message={error} />

      {!loading && !error && data.length === 0 && (
        <p className="kosong">Tidak ada barang yang cocok.</p>
      )}

      <div className={`grid ${loading ? "memuat" : ""}`}>
        {data.map((barang) => (
          <KartuBarang key={barang.idLaporan} barang={barang} jenis={jenis} />
        ))}
      </div>

      {meta && meta.totalHalaman > 1 && (
        <nav className="paging" aria-label="Halaman">
          <button
            type="button"
            disabled={halaman <= 1}
            onClick={() => ubahFilter({ cari, kategori, halaman: halaman - 1 })}
          >
            Sebelumnya
          </button>
          <span>
            Halaman {meta.halaman} dari {meta.totalHalaman}
          </span>
          <button
            type="button"
            disabled={halaman >= meta.totalHalaman}
            onClick={() => ubahFilter({ cari, kategori, halaman: halaman + 1 })}
          >
            Berikutnya
          </button>
        </nav>
      )}
    </section>
  );
}

export default Katalog;
