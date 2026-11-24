import { Link } from "react-router-dom";
import { formatTanggal, urlFoto } from "../utils/format";

function KartuBarang({ barang, jenis = "temuan" }) {
  const foto = urlFoto(barang.fotoBarang);
  const hilang = jenis === "hilang";

  return (
    <Link
      to={`${hilang ? "/hilang" : "/katalog"}/${barang.idLaporan}`}
      className="kartu"
    >
      <div className="kartu-foto">
        {foto ? (
          <img src={foto} alt={barang.namaBarang} loading="lazy" />
        ) : (
          <span className="kartu-kosong">Tanpa foto</span>
        )}
        <span className="badge">{barang.kategori}</span>
      </div>
      <div className="kartu-isi">
        <h3>{barang.namaBarang}</h3>
        <p>{hilang ? barang.lokasiTerakhir : barang.lokasiPenitipan}</p>
        <small>{formatTanggal(barang.tanggal)}</small>
      </div>
    </Link>
  );
}

export default KartuBarang;
