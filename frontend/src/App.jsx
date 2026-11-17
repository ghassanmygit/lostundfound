import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import KirimUlangVerifikasi from "./pages/KirimUlangVerifikasi";
import Login from "./pages/Login";
import Registrasi from "./pages/Registrasi";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registrasi" element={<Registrasi />} />
        <Route
          path="/kirim-ulang-verifikasi"
          element={<KirimUlangVerifikasi />}
        />
        <Route path="/katalog" element={<p>Katalog (segera dibuat)</p>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
