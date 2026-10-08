import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaCartPlus } from 'react-icons/fa';
import './FavoritosPage.css';

import { useCarrinho } from '../context/CarrinhoContext';
import { useProdutos } from '../context/ProdutosContext';
import { useFavoritos } from '../context/FavoritosContext';

export default function FavoritosPage() {
  const { adicionarProduto } = useCarrinho();
  const { produtos } = useProdutos();
  const { favoritos, toggleFavorito } = useFavoritos();

  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const dropdownRef = useRef(null);
  const botaoRef = useRef(null);

  const favoritosProdutos = produtos
    .filter(p => favoritos.includes(p.id))
    .sort((a, b) => favoritos.indexOf(a.id) - favoritos.indexOf(b.id))
    .reverse();

  const handleAddCart = (produtoId, event) => {
    event.stopPropagation();
    const buttonRect = event.currentTarget.getBoundingClientRect();
    setProdutoSelecionado({
      id: produtoId,
      width: buttonRect.width,
      left: buttonRect.left,
      top: buttonRect.bottom + window.scrollY
    });
  };

  const handleSelecionarTamanho = (produtoId, tamanho) => {
    const produto = produtos.find(p => p.id === produtoId);
    const stock = produto?.stock?.[tamanho] ?? 0;

    if (stock <= 0) return;

    adicionarProduto(produtoId, tamanho);
    toggleFavorito(produtoId);
    setProdutoSelecionado(null);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        botaoRef.current &&
        !botaoRef.current.contains(event.target)
      ) {
        setProdutoSelecionado(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <main className="fav-main">
      <section>
        <div className="global-wrapper fav-wrapper">
          <h2>Os Meus Favoritos</h2>
          <p className="fav-sub">Aqui estão os produtos que mais gosta! Pode adicioná-los ao carrinho ou removê-los a qualquer momento.</p>

          {favoritosProdutos.length === 0 ? (
            <p className="fav-empty">Não tem nenhum produto adicionado aos favoritos.</p>
          ) : (
            <div className="fav-grid">
              {favoritosProdutos.map((produto) => {
                const esgotado = Object.values(produto.stock || {}).every(q => q === 0);
                return (
                  <div key={produto.id} className="fav-card">
                    <div className={`fav-img-link-wrapper ${esgotado ? 'indisponivel' : ''}`}>
                      <Link to={`/produto/${produto.id}`} className="fav-img-link">
                        <img src={produto.image} alt={produto.name} />
                        {esgotado && (
                          <div className="faixa-indisponivel">Indisponível</div>
                        )}
                      </Link>
                    </div>
                    <div className="fav-info">
                      <h3>{produto.name}</h3>
                      <p>{produto.price.toFixed(2)} €</p>

                      <div className="fav-buttons">
                        <button className="fav-botao remove" onClick={() => toggleFavorito(produto.id)}>
                          <FaHeart /> Remover
                        </button>
                        <button
                          className="fav-botao add-cart"
                          onClick={(e) => handleAddCart(produto.id, e)}
                          ref={botaoRef}
                        >
                          <FaCartPlus /> Adicionar ao carrinho
                        </button>

                        {produtoSelecionado?.id === produto.id && (
                          <ul
                            className="fav-tamanho-dropdown"
                            style={{
                              width: `${produtoSelecionado.width}px`,
                              left: `${produtoSelecionado.left}px`,
                              top: `${produtoSelecionado.top}px`,
                            }}
                            ref={dropdownRef}
                          >
                            {produto.size.map((tamanho) => {
                              const stockTamanho = produto.stock?.[tamanho] ?? 0;
                              const indisponivel = stockTamanho <= 0;
                              return (
                                <li
                                  key={tamanho}
                                  onClick={() =>
                                    !indisponivel && handleSelecionarTamanho(produto.id, tamanho)
                                  }
                                  className={indisponivel ? "fav-tamanho-indisponivel" : ""}
                                >
                                  {tamanho} {indisponivel ? "(indisponível)" : ""}
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
