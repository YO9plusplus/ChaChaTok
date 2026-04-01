import { BrowserRouter, Routes, Route } from "react-router-dom";
import OrderPage from './pages/OrderPage.jsx'
import KitchenPage from './pages/KitchenPage.jsx'
import AnalyticsPage from "./pages/AnalyticsPage.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<OrderPage />} />
        <Route path="/kitchen" element={<KitchenPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
      </Routes>
    </BrowserRouter>
  )
}

