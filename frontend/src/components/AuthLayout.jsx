import Footer from "./Footer";
import "./AuthLayout.css";

function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="auth">
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
