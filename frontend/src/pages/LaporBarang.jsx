import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FormLaporHilang from "../components/FormLaporHilang";
import FormLaporTemuan from "../components/FormLaporTemuan";
import { getSession } from "../utils/auth";
import "./LaporBarang.css";

function LaporBarang() {
  const navigate = useNavigate();
  const bolehLaporHilang = getSession()?.role === "civitas";
  const [jenis, setJenis] = useState("temuan");

  const handleBerhasil = (pesan) => {
    navigate("/laporan-saya", { state: { pesan } });
  };

  return (
    <section className="lapor">
      <h1 className="judul">Lapor Barang</h1>
      <p className="judul-sub">
        {jenis === "temuan"
          ? "Titipkan barang temuan ke pos satpam, lalu laporkan di sini."
          : "Catat barang yang hilang agar mudah dicocokkan dengan barang temuan."}
      </p>

      {bolehLaporHilang && (
        <div className="tab" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={jenis === "temuan"}
            className={jenis === "temuan" ? "aktif" : ""}
            onClick={() => setJenis("temuan")}
          >
            Barang Temuan
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={jenis === "hilang"}
            className={jenis === "hilang" ? "aktif" : ""}
            onClick={() => setJenis("hilang")}
          >
            Barang Hilang
          </button>
        </div>
      )}

      <div className="lapor-kartu">
        {jenis === "temuan" ? (
          <FormLaporTemuan onBerhasil={handleBerhasil} />
        ) : (
          <FormLaporHilang onBerhasil={handleBerhasil} />
        )}
      </div>
    </section>
  );
}

export default LaporBarang;
