import Footer from "./Footer";
import "./AuthLayout.css";

function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="auth">
      <div className="auth-body">
        <aside className="auth-brand">
          <svg
            viewBox="0 0 120 120"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="52" cy="52" r="30" />
            <path d="M74 74l26 26" />
            <path d="M38 52h28M52 38v28" stroke="var(--kuning)" />
          </svg>
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
            <h1>{title}</h1>
            <p className="sub">{subtitle}</p>
            {children}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default AuthLayout;
