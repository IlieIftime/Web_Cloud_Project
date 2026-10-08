import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLogIn } from './LogInContext';

const HistoricoContext = createContext();

export const HistoricoProvider = ({ children }) => {
  const { token } = useLogIn();
  const [historico, setHistorico] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const fetchHistorico = async () => {
    if (!token) return;
    setCarregando(true);
    try {
      const res = await fetch('http://localhost:5000/user/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("Erro ao buscar histórico");
      const data = await res.json();
      setHistorico(data.historico || []);
    } catch (err) {
      console.error("Erro ao carregar histórico:", err);
      setHistorico([]);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    if (token) fetchHistorico();
  }, [token]);

  return (
    <HistoricoContext.Provider value={{ historico, fetchHistorico, carregando }}>
      {children}
    </HistoricoContext.Provider>
  );
};

export const useHistorico = () => useContext(HistoricoContext);
