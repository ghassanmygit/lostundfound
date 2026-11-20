import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";
import DashboardSatpam from "./pages/DashboardSatpam";
import DetailBarang from "./pages/DetailBarang";
import KirimUlangVerifikasi from "./pages/KirimUlangVerifikasi";
import Katalog from "./pages/Katalog";
import LaporBarang from "./pages/LaporBarang";
import LaporanSaya from "./pages/LaporanSaya";
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

        <Route element={<ProtectedRoute />}>
          <Route path="/katalog" element={<Katalog key="temuan" />} />
          <Route path="/katalog/:id" element={<DetailBarang />} />
          <Route
            path="/hilang"
            element={<Katalog key="hilang" jenis="hilang" />}
          />
          <Route
            path="/hilang/:id"
            element={<DetailBarang key="hilang" jenis="hilang" />}
          />
          <Route path="/lapor" element={<LaporBarang />} />
          <Route path="/laporan-saya" element={<LaporanSaya />} />

          <Route element={<RoleRoute role="satpam" />}>
            <Route path="/satpam" element={<DashboardSatpam />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
