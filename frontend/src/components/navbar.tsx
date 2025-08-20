import { useState } from "react";
import Logo from "../../public/logo.svg";
import { User, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";

const NavBar = () => {
  const [menuOpen, setMenuOpen] = useState(false);


  return (
    <div className="fixed top-0 left-0 w-full flex justify-between items-center p-6 shadow-lg z-50 bg-white overflow-hidden">
      <div className="flex items-center space-x-6">
        {/* Mobile Menu Button - Left of Logo */}
        <button
          className="md:hidden p-2 hover:bg-gray-100 rounded-md"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        <img src={Logo} alt="Logo" className="h-auto" />

        {/* Desktop Nav */}
        <nav className="hidden md:flex ml-6">
          <ul className="flex space-x-4">
            <li>
              <Link to={'/'} className="text-gray-700 hover:text-blue-500">
                Tableau de bord
              </Link>
            </li>
            <li>
              <a href="#" className="text-gray-700 hover:text-blue-500">
                Créer une offre
              </a>
            </li>
            <li>
              <a href="#" className="text-gray-700 hover:text-blue-500">
                Gérer une offre
              </a>
            </li>
            <li>
              <Link
                to="/events"
                className="text-blue-700 hover:text-blue-500 p-2 rounded transition-colors underline-dot"
              >
                Événements
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* User Icon */}
      <div className="hidden sm:flex sm:items-center">
        <User className="cursor-pointer hover:text-blue-500 bg-gray-100 rounded-full" />
        
      </div>

      {/* Mobile Sidebar */}
      {menuOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-opacity-50 z-40 md:hidden"
            onClick={() => setMenuOpen(false)}
          ></div>

          {/* Sidebar */}
          <div className="fixed top-0 left-0 h-full  bg-white shadow-xl z-50 md:hidden transform transition-transform duration-300 ease-in-out w-auto">
            <div className="flex flex-col h-full">
              {/* Sidebar Header */}
              <div className="flex items-center justify-end">
                <button
                  onClick={() => setMenuOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-md"
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* User Profile Section */}
              <div className="flex items-center p-2 bg-gray-50">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <User className=" w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Utilisateur</p>
                    <p className="text-sm text-gray-500">user@example.com</p>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 py-5  w-full">
                <ul className="space-y-1 ">
                  <li>
                    <a
                      href="#"
                      className="w-full flex items-center justify-start space-x-3 text-gray-700 hover:text-blue-500 hover:bg-blue-50 p-3 rounded-lg transition-colors"
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
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
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
                          d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4M8 7v8a2 2 0 002 2h4a2 2 0 002-2V7M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-2"
                        />
                      </svg>
                      <span>événement</span>
                    </Link>
                  </li>
                </ul>
              </nav>

              {/* Sidebar Footer */}
              <div className="p-2">
                <button className="w-full flex items-center justify-start space-x-2 text-gray-600 hover:text-red-500 p-2 rounded-lg hover:bg-gray-50 transition-colors">
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
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  <span>Déconnexion</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NavBar;
