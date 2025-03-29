import { createContext, useContext, useState } from 'react';

const UsersContext = createContext();

export const UsersProvider = ({ children }) => {
  const [localUpdates, setLocalUpdates] = useState({});

  const handleUserUpdated = (updatedUser) => {
    setLocalUpdates(prev => ({
      ...prev,
      [updatedUser.id]: updatedUser
    }));
  };

  return (
    <UsersContext.Provider value={{ localUpdates, handleUserUpdated }}>
      {children}
    </UsersContext.Provider>
  );
};

export const useUsers = () => useContext(UsersContext);