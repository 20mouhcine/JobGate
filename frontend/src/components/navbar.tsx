import { useState, useRef, useEffect } from "react";
import Logo from "../../public/logo.svg";
import { User, Menu, X, LogOut } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";

const NavBar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setDropdownOpen(false);
    setMenuOpen(false);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // Function to get the avatar URL with proper formatting
  const getAvatarUrl = (avatarPath: string | undefined) => {
    if (!avatarPath) return null;
    
    // If it's already a full URL, return as is
    if (avatarPath.startsWith('http')) return avatarPath;
    
    // Otherwise, prepend the server URL
    return `http://localhost:8000${avatarPath}`;
  };

  // Check if a path is active
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="fixed top-0 left-0 w-full flex justify-between items-center p-4 shadow-lg z-50 bg-white">
      <div className="flex items-center space-x-4">
        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 hover:bg-gray-100 rounded-md"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <img src={Logo} alt="Logo" className="h-8" />

        {/* Desktop Nav */}
        <nav className="hidden md:flex ml-4">
          <ul className="flex space-x-4">
            <li>
              <Link
                to="/events"
                className={`text-blue-700 hover:text-blue-500 p-2 rounded transition-colors ${
                  isActive("/events") ? "underline-dot" : ""
                }`}
              >
                Événements
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* User Icon with Dropdown */}
      <div className="flex items-center relative" ref={dropdownRef}>
        <button
          onClick={toggleDropdown}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors overflow-hidden"
        >
          {user?.avatar ? (
            <img
              src={getAvatarUrl(user.avatar)}
              alt={`${user.first_name} ${user.last_name}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                // If image fails to load, show initials instead
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : null}
          
          {(!user?.avatar || !user.avatar) && user?.first_name && user?.last_name ? (
            <span className="font-semibold">
              {getInitials(user.first_name, user.last_name)}
            </span>
          ) : (
            <User className="w-5 h-5" />
          )}
        </button>

        {/* Dropdown Menu */}
        {dropdownOpen && (
          <div className="absolute top-12 right-0 w-48 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-200">
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
            
            <Link
              to="/profile"
              className={`flex items-center px-4 py-2 text-sm ${
                isActive("/profile") 
                  ? "bg-blue-100 text-blue-700" 
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => setDropdownOpen(false)}
            >
              <User className="w-4 h-4 mr-2" />
              Mon Profil
            </Link>
            
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Déconnexion
            </button>
          </div>
        )}
      </div>

      {/* Mobile Sidebar */}
      {menuOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setMenuOpen(false)}
          ></div>

          {/* Sidebar */}
          <div className="fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-50 md:hidden transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col h-full">
              {/* Sidebar Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <img src={Logo} alt="Logo" className="h-8" />
                <button
                  onClick={() => setMenuOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-md"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Profile Section */}
              <div className="flex items-center p-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden bg-blue-100 text-blue-700">
                    {user?.avatar ? (
                      <img
                        src={getAvatarUrl(user.avatar)}
                        alt={`${user.first_name} ${user.last_name}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : null}
                    
                    {(!user?.avatar || !user.avatar) && user?.first_name && user?.last_name ? (
                      <span className="font-semibold">
                        {getInitials(user.first_name, user.last_name)}
                      </span>
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {user?.first_name} {user?.last_name}
                    </p>
                    <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 py-4">
                <ul className="space-y-1">
                  <li>
                    <Link
                      to="/dashboard"
                      className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                        isActive("/dashboard")
                          ? "bg-blue-100 text-blue-700"
                          : "text-gray-700 hover:text-blue-500 hover:bg-blue-50"
                      }`}
                      onClick={() => setMenuOpen(false)}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 5a2 2 0 012-2h4a2 2 0 012 2v10a2 2 0 01-2 2H10a2 2 0 01-2-2V5z"
                        />
                      </svg>
                      <span>Tableau de bord</span>
                    </Link>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="flex items-center space-x-3 text-gray-700 hover:text-blue-500 hover:bg-blue-50 p-3 rounded-lg transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      <span>Créer une offre</span>
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="flex items-center space-x-3 text-gray-700 hover:text-blue-500 hover:bg-blue-50 p-3 rounded-lg transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 极速3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 极速00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.极速a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span>Gérer une offre</span>
                    </a>
                  </li>
                  <li>
                    <Link
                      to="/events"
                      className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                        isActive("/events")
                          ? "bg-blue-100 text-blue-700"
                          : "text-gray-700 hover:text-blue-500 hover:bg-blue-50"
                      }`}
                      onClick={() => setMenuOpen(false)}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="极速 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4M8 7v8a2 2 0 002 2h4a2 2 0 002-2V7M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-2"
                        />
                      </svg>
                      <span>Événements</span>
                    </Link>
                  </li>
                </ul>
              </nav>

              {/* Sidebar Footer */}
              <div className="p-4 border-t border-gray-200">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-2 text-gray-600 hover:text-red-500 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Déconnexion</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Add CSS for the underline-dot effect */}
      <style>
        {`
          .underline-dot {
            position: relative;
          }
          
          .underline-dot::after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 50%;
            transform: translateX(-50%);
            width: 6px;
            height: 6px;
            background-color: #3b82f6;
            border-radius: 50%;
          }
          
          .underline-dot:hover::after {
            background-color: #60a5fa;
          }
        `}
      </style>
    </div>
  );
};

export default NavBar;