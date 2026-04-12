import { createContext, useContext, useState } from 'react';
import { currentUser } from '../data/mockData';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(currentUser);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState('login');

  const login = (credentials) => {
    setUser(currentUser);
    setIsAuthenticated(true);
    setCurrentPage('feed');
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentPage('login');
  };

  return (
    <AppContext.Provider value={{ user, isAuthenticated, currentPage, setCurrentPage, login, logout }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
