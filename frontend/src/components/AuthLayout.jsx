import { useState } from "react";
import Footer from "./Footer";
import "./AuthLayout.css";

// lipat: di layar kecil, kartu awalnya tertutup dan terbuka saat diketuk.
function AuthLayout({ title, subtitle, lipat = false, children }) {
  const [terbuka, setTerbuka] = useState(!lipat);
  const kelas = ["auth", lipat && "auth--lipat", terbuka && "is-open"]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={kelas}>
      <div className="auth-body">
        <aside className="auth-brand">
          <img
            className="auth-logo"
            src="/logo.png"
            alt="Logo Lost &amp; Found"
          />
          <h2>Lost &amp; Found</h2>
          <p className="auth-univ">UIN Syarif Hidayatullah Jakarta</p>
          <ul>
            <li>Laporkan barang temuan ke satpam</li>
            <li>Cari barang yang hilang di katalog</li>
            <li>Untuk seluruh civitas akademika: mahasiswa, dosen, dan staf</li>
          </ul>
        </aside>

        <main className="auth-panel">
          <div className="auth-form">
            <div className="auth-head">
              <h1>{title}</h1>
              <p className="sub">{subtitle}</p>
              {lipat && (
                <button
                  type="button"
                  className="auth-toggle"
                  aria-expanded={terbuka}
                  aria-controls="auth-isi"
                  aria-label={terbuka ? "Tutup form" : "Buka form"}
                  onClick={() => setTerbuka(!terbuka)}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M6 15l6-6 6 6" />
                  </svg>
                </button>
              )}
            </div>
            <div className="auth-isi" id="auth-isi">
              <div className="auth-isi-inner">{children}</div>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default AuthLayout;
