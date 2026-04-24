import { createContext, useContext, useState } from 'react';

const SettingsContext = createContext();

export function SettingsProvider({ children }) {
  const [isKg, setIsKg] = useState(false);
  const [restTimer, setRestTimer] = useState(90);
  const [showRPE, setShowRPE] = useState(false);
  const [sessionSets, setSessionSets] = useState([]);
  const [sessionActive, setSessionActive] = useState(false);

  const addSetToSession = (set) => {
    setSessionSets(prev => [...prev, set]);
  };

  const clearSession = () => {
    setSessionSets([]);
    setSessionActive(false);
  };

  return (
    <SettingsContext.Provider value={{
      isKg, setIsKg,
      restTimer, setRestTimer,
      showRPE, setShowRPE,
      sessionSets, addSetToSession, clearSession,
      sessionActive, setSessionActive,
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
