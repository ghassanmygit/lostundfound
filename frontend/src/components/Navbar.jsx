import { NavLink, useNavigate } from "react-router-dom";
import { clearToken } from "../api/client";
import { getSession } from "../utils/auth";

function Navbar() {
  const navigate = useNavigate();
  const session = getSession();

  const handleKeluar = () => {
    clearToken();
    navigate("/login");
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <span className="navbar-brand">
          <img className="navbar-logo" src="/logo.png" alt="" />
          Lost &amp; Found
        </span>
        <nav className="navbar-menu">
          {session?.role === "satpam" && (
            <NavLink to="/satpam">Verifikasi</NavLink>
          )}
          <NavLink to="/katalog">Temuan</NavLink>
          <NavLink to="/hilang">Hilang</NavLink>
          <NavLink to="/lapor">Lapor</NavLink>
          <NavLink to="/laporan-saya">Laporan Saya</NavLink>
        </nav>
        <button type="button" className="navbar-keluar" onClick={handleKeluar}>
          Keluar
        </button>
      </div>
    </header>
  );
}

export default Navbar;
