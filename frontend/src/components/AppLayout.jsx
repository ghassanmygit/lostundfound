import Footer from "./Footer";
import Navbar from "./Navbar";
import "./AppLayout.css";

function AppLayout({ children }) {
  return (
    <div className="app">
      <Navbar />
      <main className="app-main">{children}</main>
      <Footer />
    </div>
  );
}

export default AppLayout;
