import React, { createContext, useContext, useState, useMemo } from 'react';
import { useProdutos } from './ProdutosContext';

const HomeContext = createContext();

export const HomeProvider = ({ children }) => {
  const { produtos, loading } = useProdutos();
  const [divisao, setDivisao] = useState('');
  const [categoria, setCategoria] = useState('');

  const produtos2025 = useMemo(
    () => produtos.filter(p => p.date?.includes('2025')),
    [produtos]
  );

  const categoriasPorDivisao = {
    Sala: ['Cadeirões', 'Cadeiras', 'Sofás', 'Mesas de centro', 'Estantes', 'Mesas', 'Móveis TV', 'Bancos'],
    Quarto: ['Camas', 'Mesas de Cabeceira', 'Beliches', 'Armários'],
    'Casa de Banho': ['Lavatórios', 'Banheiras'],
    Escritório: ['Secretárias', 'Cadeiras de Escritório', 'Prateleiras', 'Candeeiros'],
    Hall: ['Sapateiras', 'Cabides'],
    Cozinha: ['Armários'],
    Exterior: ['Cadeiras Suspensas']
  };

  return (
    <HomeContext.Provider
      value={{
        produtos,
        produtos2025,
        divisao,
        setDivisao,
        categoria,
        setCategoria,
        categoriasPorDivisao
      }}
    >
      {children}
    </HomeContext.Provider>
  );
};

export const useHome = () => useContext(HomeContext);