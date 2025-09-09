import { createContext, useContext, useState, useEffect } from 'react';
import { User, UserContextType, UserProviderProps } from '@/types';

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check if user is authenticated on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      // Validate token with backend and get user data
      fetchUserData(token);
    } else {
      setIsLoading(false);
    }
  }, []);

const fetchUserData = async (token: string) => {
  try {
    const response = await fetch('http://localhost:8000/api/auth/profile/', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 401) {
      // Token expiré ou invalide
      localStorage.removeItem('access_token');
      setUserState(null);
      setIsLoading(false);
      return;
    }

    if (response.ok) {
      const userData = await response.json();
      setUserState(userData);
    } else {
      // Token invalide, le supprimer
      localStorage.removeItem('access_token');
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
    localStorage.removeItem('access_token');
  } finally {
    setIsLoading(false);
  }
};

  const setUser = (newUser: User | null) => {
    setUserState(newUser);
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Store the token
        if (data.access) {
          localStorage.setItem('authToken', data.access);
        }
        
        // Set user data
        if (data.user) {
          setUserState(data.user);
        }
        
        return true;
      } else {
        const errorData = await response.json();
        console.error('Login failed:', errorData);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUserState(null);
  };

  const value: UserContextType = {
    user,
    setUser,
    login,
    logout,
    isLoading,
    isAuthenticated: !!user,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const useCurrentUser = (): User | null => {
  const { user } = useUser();
  return user;
};