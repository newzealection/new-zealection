import { Link } from "react-router-dom";
import { Home, User, Cards, Collection } from "lucide-react";

export const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-bold text-nzgreen-500">
            New Zealection
          </Link>
          
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="flex items-center space-x-1 px-3 py-2 rounded-md text-gray-600 hover:text-nzgreen-500 hover:bg-gray-100 transition-colors"
            >
              <Home className="w-5 h-5" />
              <span>Home</span>
            </Link>
            
            <Link
              to="/cards"
              className="flex items-center space-x-1 px-3 py-2 rounded-md text-gray-600 hover:text-nzgreen-500 hover:bg-gray-100 transition-colors"
            >
              <Cards className="w-5 h-5" />
              <span>Cards</span>
            </Link>
            
            <Link
              to="/collection"
              className="flex items-center space-x-1 px-3 py-2 rounded-md text-gray-600 hover:text-nzgreen-500 hover:bg-gray-100 transition-colors"
            >
              <Collection className="w-5 h-5" />
              <span>Collection</span>
            </Link>
            
            <Link
              to="/account"
              className="flex items-center space-x-1 px-3 py-2 rounded-md text-gray-600 hover:text-nzgreen-500 hover:bg-gray-100 transition-colors"
            >
              <User className="w-5 h-5" />
              <span>Account</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};