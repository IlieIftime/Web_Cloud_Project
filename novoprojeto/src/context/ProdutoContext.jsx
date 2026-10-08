import React, { createContext, useContext, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useProdutos } from './ProdutosContext';

const ProdutoContext = createContext();

export const ProdutoProvider = ({ children }) => {
  const { produtos } = useProdutos();
  const { id } = useParams();

  const produto = useMemo(() => produtos.find(p => String(p.id) === id), [produtos, id]);

  return (
    <ProdutoContext.Provider value={{ produto }}>
      {children}
    </ProdutoContext.Provider>
  );
};

export const useProduto = () => useContext(ProdutoContext);