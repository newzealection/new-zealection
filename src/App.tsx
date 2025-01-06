import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Cards from "./pages/Cards";
import Collection from "./pages/Collection";
import Summon from "./pages/Summon";
import Marketplace from "./pages/Marketplace";
import Battlefield from "./pages/Battlefield";
import Account from "./pages/Account";
import Login from "./pages/auth/Login";
import Callback from "./pages/auth/Callback";
import { AuthGuard } from "./components/AuthGuard";
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/callback" element={<Callback />} />
        <Route path="/cards" element={<AuthGuard><Cards /></AuthGuard>} />
        <Route path="/collection" element={<AuthGuard><Collection /></AuthGuard>} />
        <Route path="/summon" element={<AuthGuard><Summon /></AuthGuard>} />
        <Route path="/marketplace" element={<AuthGuard><Marketplace /></AuthGuard>} />
        <Route path="/battlefield" element={<AuthGuard><Battlefield /></AuthGuard>} />
        <Route path="/account" element={<AuthGuard><Account /></AuthGuard>} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;