import { Link } from "react-router-dom";
import { Home, User, GalleryHorizontalEnd, Library, Menu, X, Zap, ShoppingBag, Flag } from "lucide-react";
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
              className="h-12 w-12 object-contain"
            />
            <span className="text-2xl sm:text-3xl font-semibold tracking-tight text-nzgreen-600 hover:text-nzgreen-500 transition-colors duration-200">
              New Zealection
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className="flex items-center space-x-1.5 px-3 py-2 rounded-md text-stone-600 hover:text-nzgreen-500 font-medium tracking-wide transition-all duration-200 hover:bg-nzgreen-50"
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>
            
            <Link
              to="/cards"
              className="flex items-center space-x-1.5 px-3 py-2 rounded-md text-stone-600 hover:text-nzgreen-500 font-medium tracking-wide transition-all duration-200 hover:bg-nzgreen-50"
            >
              <GalleryHorizontalEnd className="w-4 h-4" />
              <span>Cards</span>
            </Link>

            <Link
              to="/summon"
              className="flex items-center space-x-1.5 px-3 py-2 rounded-md text-stone-600 hover:text-nzgreen-500 font-medium tracking-wide transition-all duration-200 hover:bg-nzgreen-50"
            >
              <Zap className="w-4 h-4" />
              <span>Summon</span>
            </Link>
            
            <Link
              to="/collection"
              className="flex items-center space-x-1.5 px-3 py-2 rounded-md text-stone-600 hover:text-nzgreen-500 font-medium tracking-wide transition-all duration-200 hover:bg-nzgreen-50"
            >
              <Library className="w-4 h-4" />
              <span>Collection</span>
            </Link>

            <Link
              to="/marketplace"
              className="flex items-center space-x-1.5 px-3 py-2 rounded-md text-stone-600 hover:text-nzgreen-500 font-medium tracking-wide transition-all duration-200 hover:bg-nzgreen-50"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Marketplace</span>
            </Link>

            <Link
              to="/battlefield"
              className="flex items-center space-x-1.5 px-3 py-2 rounded-md text-stone-600 hover:text-nzgreen-500 font-medium tracking-wide transition-all duration-200 hover:bg-nzgreen-50"
            >
              <Flag className="w-4 h-4" />
              <span>Battlefield</span>
            </Link>
            
            <Link
              to="/account"
              className="flex items-center space-x-1.5 px-3 py-2 rounded-md text-stone-600 hover:text-nzgreen-500 font-medium tracking-wide transition-all duration-200 hover:bg-nzgreen-50"
            >
              <User className="w-4 h-4" />
              <span>Account</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-md text-stone-600 hover:text-nzgreen-500 hover:bg-nzgreen-50 transition-all duration-200"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-2">
            <Link
              to="/"
              className="flex items-center space-x-2 px-3 py-2.5 rounded-md text-stone-600 hover:text-nzgreen-500 font-medium tracking-wide transition-all duration-200 hover:bg-nzgreen-50"
              onClick={() => setIsMenuOpen(false)}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>
            
            <Link
              to="/cards"
              className="flex items-center space-x-2 px-3 py-2.5 rounded-md text-stone-600 hover:text-nzgreen-500 font-medium tracking-wide transition-all duration-200 hover:bg-nzgreen-50"
              onClick={() => setIsMenuOpen(false)}
            >
              <GalleryHorizontalEnd className="w-4 h-4" />
              <span>Cards</span>
            </Link>

            <Link
              to="/summon"
              className="flex items-center space-x-2 px-3 py-2.5 rounded-md text-stone-600 hover:text-nzgreen-500 font-medium tracking-wide transition-all duration-200 hover:bg-nzgreen-50"
              onClick={() => setIsMenuOpen(false)}
            >
              <Zap className="w-4 h-4" />
              <span>Summon</span>
            </Link>
            
            <Link
              to="/collection"
              className="flex items-center space-x-2 px-3 py-2.5 rounded-md text-stone-600 hover:text-nzgreen-500 font-medium tracking-wide transition-all duration-200 hover:bg-nzgreen-50"
              onClick={() => setIsMenuOpen(false)}
            >
              <Library className="w-4 h-4" />
              <span>Collection</span>
            </Link>

            <Link
              to="/marketplace"
              className="flex items-center space-x-2 px-3 py-2.5 rounded-md text-stone-600 hover:text-nzgreen-500 font-medium tracking-wide transition-all duration-200 hover:bg-nzgreen-50"
              onClick={() => setIsMenuOpen(false)}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Marketplace</span>
            </Link>

            <Link
              to="/battlefield"
              className="flex items-center space-x-2 px-3 py-2.5 rounded-md text-stone-600 hover:text-nzgreen-500 font-medium tracking-wide transition-all duration-200 hover:bg-nzgreen-50"
              onClick={() => setIsMenuOpen(false)}
            >
              <Flag className="w-4 h-4" />
              <span>Battlefield</span>
            </Link>
            
            <Link
              to="/account"
              className="flex items-center space-x-2 px-3 py-2.5 rounded-md text-stone-600 hover:text-nzgreen-500 font-medium tracking-wide transition-all duration-200 hover:bg-nzgreen-50"
              onClick={() => setIsMenuOpen(false)}
            >
              <User className="w-4 h-4" />
              <span>Account</span>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};