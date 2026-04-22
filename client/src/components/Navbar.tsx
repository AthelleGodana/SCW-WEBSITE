import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { ShoppingCart, Menu, X, LogOut } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/">
          <a className="flex items-center gap-2 font-bold text-2xl text-blue-600 hover:text-blue-700">
            <span>SCW</span>
          </a>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/">
            <a className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Home
            </a>
          </Link>
          <Link href="/shop">
            <a className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Shop
            </a>
          </Link>
          {user?.role === "admin" && (
            <Link href="/admin">
              <a className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Admin
              </a>
            </Link>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          {/* Cart Icon */}
          <Link href="/cart">
            <a className="relative p-2 text-gray-700 hover:text-blue-600 transition-colors">
              <ShoppingCart size={24} />
            </a>
          </Link>

          {/* Auth */}
          {isAuthenticated ? (
            <div className="hidden md:flex items-center gap-4">
              <span className="text-sm text-gray-600">{user?.name}</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          ) : (
            <a
              href={getLoginUrl()}
              className="hidden md:inline-block px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Login
            </a>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
            <Link href="/">
              <a className="text-gray-700 hover:text-blue-600 font-medium" onClick={() => setIsOpen(false)}>
                Home
              </a>
            </Link>
            <Link href="/shop">
              <a className="text-gray-700 hover:text-blue-600 font-medium" onClick={() => setIsOpen(false)}>
                Shop
              </a>
            </Link>
            {user?.role === "admin" && (
              <Link href="/admin">
                <a className="text-gray-700 hover:text-blue-600 font-medium" onClick={() => setIsOpen(false)}>
                  Admin
                </a>
              </Link>
            )}
            <div className="border-t border-gray-200 pt-4">
              {isAuthenticated ? (
                <>
                  <p className="text-sm text-gray-600 mb-4">{user?.name}</p>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </>
              ) : (
                <a
                  href={getLoginUrl()}
                  className="block w-full text-center px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Login
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
