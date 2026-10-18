import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Screener from "./pages/Screener";
import Stock from "./pages/Stock";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/acao/:ticker" element={<Stock />} />
        <Route path="/screener" element={<Screener />} />
      </Route>
    </Routes>
  );
}
