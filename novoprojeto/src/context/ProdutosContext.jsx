import React, { createContext, useContext, useState, useEffect } from 'react';

const ProdutosContext = createContext();

export const ProdutosProvider = ({ children }) => {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProdutos = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/products');
      const data = await res.json();
      setProdutos(data.data || []);
    } catch (err) {
      console.error('Erro ao carregar produtos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProdutos();
  }, []);

  return (
    <ProdutosContext.Provider value={{ produtos, loading, fetchProdutos }}>
      {children}
    </ProdutosContext.Provider>
  );
};

export const useProdutos = () => useContext(ProdutosContext);
