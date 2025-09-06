import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/navbar";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("authToken");
      
      // Get current path to check if it's a public route
      const currentPath = window.location.pathname;
      const publicRoutes = ["/login", "/signup"];
      
      // If no token and not on a public route, redirect to login
      if (!token && !publicRoutes.includes(currentPath)) {
        navigate("/login", { replace: true });
        return;
      }
      
      // If token exists and user is on login/signup, redirect to home
      if (token && publicRoutes.includes(currentPath)) {
        navigate("/events", { replace: true });
        return;
      }
      
      setIsCheckingAuth(false);
    };

    checkAuth();
  }, [navigate]);

  // Show loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col min-h-screen">
      <Navbar />
      <main className="container mx-auto max-w-full flex-grow pt-20">
        {children}
      </main>
    </div>
  );
}