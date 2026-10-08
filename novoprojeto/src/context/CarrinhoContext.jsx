import React, { createContext, useContext, useEffect, useState } from 'react';
import { useLogIn } from './LogInContext';
import { useFavoritos } from './FavoritosContext';

const CarrinhoContext = createContext();


export function CarrinhoProvider({ children }) {
  const { token, registerLogoutCallback } = useLogIn();
  const { fetchFavoritos } = useFavoritos(); 
  const [carrinho, setCarrinho] = useState([]);

  useEffect(() => {
    registerLogoutCallback(() => setCarrinho([]));
  }, [registerLogoutCallback]);

  const guardarCarrinhoNoServidor = async (novoCarrinho) => {
    if (!token) return;
    try {
      await fetch("http://localhost:5000/user/carrinho", {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ carrinho: novoCarrinho })
      });
    } catch (err) {
      console.error("Erro ao guardar carrinho:", err);
    }
  };

  useEffect(() => {
    const syncCarrinho = async () => {
      if (!token) return;
      try {
        const res = await fetch("http://localhost:5000/user/carrinho", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Erro ao buscar carrinho");
        const data = await res.json();
        setCarrinho(data || []);
      } catch (err) {
        console.error("Erro ao carregar carrinho:", err);
      }
    };
    syncCarrinho();
  }, [token]);

  const atualizarQuantidade = (id, tamanho, delta) => {
    if (!token) return alert("Precisa de iniciar sessão para modificar o carrinho.");
    setCarrinho(prev => {
      const novo = prev.map(item =>
        item.id === id && item.tamanho === tamanho
          ? { ...item, quantidade: Math.max(1, item.quantidade + delta) }
          : item
      );
      guardarCarrinhoNoServidor(novo);
      return novo;
    });
  };

  const removerProduto = (id, tamanhoSelecionado) => {
    if (!token) return alert("Precisa de iniciar sessão para modificar o carrinho.");
    setCarrinho(prev => {
      const novo = prev.filter(item => !(item.id === id && item.tamanho === tamanhoSelecionado));
      guardarCarrinhoNoServidor(novo);
      return novo;
    });
  };

  const adicionarProduto = (produtoId, tamanhoSelecionado) => {
    if (!token) return alert("Precisa de iniciar sessão para adicionar ao carrinho.");
    try {
      setCarrinho(prev => {
        const existe = prev.find(item => item.id === produtoId && item.tamanho === tamanhoSelecionado);
        const novo = existe
          ? prev.map(item =>
              item.id === produtoId && item.tamanho === tamanhoSelecionado
                ? { ...item, quantidade: item.quantidade + 1 }
                : item
            )
          : [...prev, { id: produtoId, tamanho: tamanhoSelecionado, quantidade: 1 }];
        
        guardarCarrinhoNoServidor(novo);
        return novo;
      });

      setTimeout(() => {
        fetchFavoritos().catch(err => console.error("Erro no fetchFavoritos:", err));
      }, 100);
      
    } catch (e) {
      console.error("Erro ao adicionar produto ao carrinho:", e);
      alert("Erro ao adicionar ao carrinho.");
    }
  };

  return (
    <CarrinhoContext.Provider value={{ carrinho, atualizarQuantidade, removerProduto, adicionarProduto, setCarrinho }}>
      {children}
    </CarrinhoContext.Provider>
  );
}

export function useCarrinho() {
  return useContext(CarrinhoContext);
}
