import { createContext, useContext, useState } from 'react';

const SettingsContext = createContext();

export function SettingsProvider({ children }) {
  const [isKg, setIsKg] = useState(false);
  const [restTimer, setRestTimer] = useState(90);
  const [showRPE, setShowRPE] = useState(false);

  return (
    <SettingsContext.Provider value={{
      isKg, setIsKg,
      restTimer, setRestTimer,
      showRPE, setShowRPE,
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}