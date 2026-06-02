import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";

import Dashboard from "./pages/Dashboard";
import RoutesPage from "./pages/Routes";
import Feedback from "./pages/Feedback";
import SetDayPlans from "./pages/SetDayPlans";
import HoldInventory from "./pages/HoldInventory";
import Team from "./pages/Team";
import Settings from "./pages/Settings";

import "./styles/global.css";

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/routes" element={<RoutesPage />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/plans" element={<SetDayPlans />} />
          <Route path="/holds" element={<HoldInventory />} />
          <Route path="/team" element={<Team />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}