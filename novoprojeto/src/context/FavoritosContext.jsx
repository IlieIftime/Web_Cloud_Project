import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLogIn } from './LogInContext';

const FavoritosContext = createContext();

export const FavoritosProvider = ({ children }) => {
  const { token } = useLogIn(); 
  const [favoritos, setFavoritos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const fetchFavoritos = async () => {
    if (!token) return;
    setCarregando(true);
    try {
      const res = await fetch('http://localhost:5000/user/favoritos', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Erro ao buscar favoritos");
      const data = await res.json();
      setFavoritos(data || []);
    } catch (err) {
      console.error("Erro ao carregar favoritos:", err);
      setFavoritos([]);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    if (token) fetchFavoritos();
  }, [token]);

  const toggleFavorito = async (id, refetchDepois = false) => {
    if (!token) return;
    try {
      const res = await fetch(`http://localhost:5000/user/favoritos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("Erro ao atualizar favoritos");

      const data = await res.json();
      setFavoritos(data.favoritos || []);

      if (refetchDepois) {
        await fetchFavoritos(); 
      }

    } catch (err) {
      console.error("Erro ao alternar favorito:", err);
    }
  };

  const isFavorito = (id) => Array.isArray(favoritos) && favoritos.includes(id);

  const limparFavoritos = async () => {
    if (!token) return;
    try {
      const res = await fetch('http://localhost:5000/user/favoritos', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("Erro ao limpar favoritos");
      const data = await res.json();
      console.log(data.message);
      setFavoritos([]);
    } catch (err) {
      console.error("Erro ao limpar favoritos:", err);
    }
  };

  return (
    <FavoritosContext.Provider value={{ favoritos, toggleFavorito, isFavorito, limparFavoritos, carregando }}>
      {children}
    </FavoritosContext.Provider>
  );
};

export const useFavoritos = () => useContext(FavoritosContext);
