import { NavLink, useNavigate } from "react-router-dom";
import { clearToken } from "../api/client";

function Navbar() {
  const navigate = useNavigate();

  const handleKeluar = () => {
    clearToken();
    navigate("/login");
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <span className="navbar-brand">Lost &amp; Found</span>
        <nav className="navbar-menu">
          <NavLink to="/katalog">Katalog</NavLink>
        </nav>
        <button type="button" className="navbar-keluar" onClick={handleKeluar}>
          Keluar
        </button>
      </div>
    </header>
  );
}

export default Navbar;
