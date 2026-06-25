import { Navigate, Route, Routes } from "react-router-dom";
import { Home as CloudVmsHome } from "./cloud-vms/pages/Home";
import CloudVmsApp from "./cloud-vms/CalculatorApp";
import { useReportHeight } from "./lib/embed";

/* ───────────── Calculadora Cloud VMS — app dedicado (seg.adentro.com.br) ─────────────
   A raiz "/" abre direto a calculadora (cadastro → ferramenta). A landing fica
   preservada, porém oculta, em /apresentacao (sem links apontando para ela). */
export default function App() {
  useReportHeight(); // auto-resize quando embedada via iframe
  return (
    <Routes>
      <Route path="/" element={<CloudVmsApp />} />
      <Route path="/calcular" element={<CloudVmsApp />} />

      {/* landing preservada, porém oculta (sem links) */}
      <Route path="/apresentacao" element={<CloudVmsHome />} />

      {/* aliases dos caminhos antigos do monorepo */}
      <Route path="/cloud-vms" element={<Navigate to="/" replace />} />
      <Route path="/cloud-vms/calcular" element={<Navigate to="/" replace />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
