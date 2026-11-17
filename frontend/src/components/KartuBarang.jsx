import { Link } from "react-router-dom";
import { formatTanggal, urlFoto } from "../utils/format";

function KartuBarang({ barang }) {
  const foto = urlFoto(barang.fotoBarang);

  return (
    <Link to={`/katalog/${barang.idLaporan}`} className="kartu">
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
        <p>{barang.lokasiPenitipan}</p>
        <small>{formatTanggal(barang.tanggal)}</small>
      </div>
    </Link>
  );
}

export default KartuBarang;
