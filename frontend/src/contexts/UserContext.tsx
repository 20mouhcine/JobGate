import { createContext, useContext, ReactNode } from 'react';

export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
}

export interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const MOCK_USER: User = {
  id: 1,
  name: 'John Doe',
  email: 'john.doe@example.com',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  role: 'talent',
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const user = MOCK_USER;
  
  const setUser = (newUser: User | null) => {
    console.log('setUser called with:', newUser);
  };

  const value: UserContextType = {
    user,
    setUser,
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

// Export mock user for reference
export { MOCK_USER };