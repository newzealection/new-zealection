import { Link } from "react-router-dom";
import { Home, User, GalleryHorizontalEnd, Library, Menu, X } from "lucide-react";
import { useState } from "react";

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/50 backdrop-blur-sm border-b border-gray-200/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src="https://i.imghippo.com/files/vrF1570ATw.png" 
              alt="New Zealection Logo" 
              className="h-8 w-auto"
            />
            <span className="text-xl font-bold text-nzgreen-500">New Zealection</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/"
              className="flex items-center space-x-1 px-3 py-2 rounded-md text-gray-600 hover:text-nzgreen-500 hover:bg-white/80 transition-colors"
            >
              <Home className="w-5 h-5" />
              <span>Home</span>
            </Link>
            
            <Link
              to="/cards"
              className="flex items-center space-x-1 px-3 py-2 rounded-md text-gray-600 hover:text-nzgreen-500 hover:bg-white/80 transition-colors"
            >
              <GalleryHorizontalEnd className="w-5 h-5" />
              <span>Cards</span>
            </Link>
            
            <Link
              to="/collection"
              className="flex items-center space-x-1 px-3 py-2 rounded-md text-gray-600 hover:text-nzgreen-500 hover:bg-white/80 transition-colors"
            >
              <Library className="w-5 h-5" />
              <span>Collection</span>
            </Link>
            
            <Link
              to="/account"
              className="flex items-center space-x-1 px-3 py-2 rounded-md text-gray-600 hover:text-nzgreen-500 hover:bg-white/80 transition-colors"
            >
              <User className="w-5 h-5" />
              <span>Account</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-nzgreen-500 hover:bg-white/80 transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-2">
            <Link
              to="/"
              className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-600 hover:text-nzgreen-500 hover:bg-white/80 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <Home className="w-5 h-5" />
              <span>Home</span>
            </Link>
            
            <Link
              to="/cards"
              className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-600 hover:text-nzgreen-500 hover:bg-white/80 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <GalleryHorizontalEnd className="w-5 h-5" />
              <span>Cards</span>
            </Link>
            
            <Link
              to="/collection"
              className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-600 hover:text-nzgreen-500 hover:bg-white/80 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <Library className="w-5 h-5" />
              <span>Collection</span>
            </Link>
            
            <Link
              to="/account"
              className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-600 hover:text-nzgreen-500 hover:bg-white/80 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <User className="w-5 h-5" />
              <span>Account</span>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};