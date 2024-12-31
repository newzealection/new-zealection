import { Home, User } from "lucide-react";
import { Link } from "react-router-dom";

export const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-3 bg-black/10 backdrop-blur-sm border-b border-white/10">
      <div className="container mx-auto flex items-center justify-between">
        <Link 
          to="/" 
          className="text-2xl font-bold text-white hover:text-white/80 transition-colors"
        >
          Kiwi Gacha
        </Link>
        
        <div className="flex items-center gap-6">
          <Link 
            to="/" 
            className="flex items-center gap-2 text-white/90 hover:text-white transition-colors"
          >
            <Home className="w-5 h-5" />
            <span>Home</span>
          </Link>
          
          <Link 
            to="/account" 
            className="flex items-center gap-2 text-white/90 hover:text-white transition-colors"
          >
            <User className="w-5 h-5" />
            <span>Account</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};