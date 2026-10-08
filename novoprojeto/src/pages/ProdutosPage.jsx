import React, { useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import './ProdutosPage.css';

import { useFavoritos } from '../context/FavoritosContext';
import { useProdutos } from '../context/ProdutosContext';

const categoriasPorDivisao = {
  Sala: ['Cadeirões', 'Cadeiras', 'Sofás', 'Mesas de Centro', 'Estantes', 'Mesas', 'Móveis TV', 'Bancos'],
  Quarto: ['Camas', 'Mesas de Cabeceira', 'Beliches', 'Armários'],
  'Casa de Banho': ['Lavatórios', 'Banheiras'],
  Escritório: ['Secretárias', 'Cadeiras de Escritório', 'Prateleiras', 'Candeeiros'],
  Hall: ['Sapateiras', 'Cabides'],
  Cozinha: ['Armários'],
  Exterior: ['Cadeiras Suspensas']
};

export default function ProdutosPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { favoritos, toggleFavorito, isFavorito } = useFavoritos();
  const { produtos, loading } = useProdutos();

  useEffect(() => {
    const scrollPos = sessionStorage.getItem('scrollPosProdutos');
    if (scrollPos) {
      window.scrollTo({ top: parseInt(scrollPos), behavior: 'instant' });
      sessionStorage.removeItem('scrollPosProdutos');
    }
  }, []);

  const paginaAtual = parseInt(searchParams.get('pagina') || '1', 10);
  const produtosPorPagina = 15;

  const divisaoSelecionada = searchParams.get('divisao') ?? '';
  const categoriaSelecionada = searchParams.get('categoria') ?? '';
  const corSelecionada = searchParams.get('cor') ?? '';
  const ordenacao = searchParams.get('ordenacao') ?? '';
  const tamanhoSelecionado = searchParams.get('tamanho') ?? '';

  const coresDisponiveis = useMemo(() => {
    return [...new Set(produtos.flatMap(p => Array.isArray(p.color) ? p.color : [p.color]))].sort((a, b) => a.localeCompare(b));
  }, [produtos]);

  const produtosFiltrados = useMemo(() => {
    let filtrados = produtos.filter(p => {
      const [div, cat] = p.category.split(' - ');
      return (
        (!divisaoSelecionada || div === divisaoSelecionada) &&
        (!categoriaSelecionada || cat === categoriaSelecionada) &&
        (!corSelecionada || (Array.isArray(p.color) ? p.color.includes(corSelecionada) : p.color === corSelecionada)) &&
        (!tamanhoSelecionado || (Array.isArray(p.size) ? p.size.includes(tamanhoSelecionado) : p.size === tamanhoSelecionado))
      );
    });

    if (ordenacao === 'preco_asc') {
      filtrados.sort((a, b) => a.price - b.price);
    } else if (ordenacao === 'preco_desc') {
      filtrados.sort((a, b) => b.price - a.price);
    } else if (ordenacao === 'favoritos') {
      filtrados.sort((a, b) => {
        const mediaA = a.reviews.reduce((acc, r) => acc + r.score, 0) / (a.reviews.length || 1);
        const mediaB = b.reviews.reduce((acc, r) => acc + r.score, 0) / (b.reviews.length || 1);
        return mediaB - mediaA;
      });
    }

    return filtrados.sort((a, b) => {
      const stockA = Object.values(a.stock || {}).some(q => q > 0);
      const stockB = Object.values(b.stock || {}).some(q => q > 0);
      return stockB - stockA; // true (1) vem antes de false (0)
    });
  }, [produtos, divisaoSelecionada, categoriaSelecionada, corSelecionada, tamanhoSelecionado, ordenacao]);

  const totalPaginas = Math.ceil(produtosFiltrados.length / produtosPorPagina);
  const indiceInicial = (paginaAtual - 1) * produtosPorPagina;
  const produtosPaginados = produtosFiltrados.slice(indiceInicial, indiceInicial + produtosPorPagina);

  const atualizarFiltro = (chave, valor) => {
    const params = new URLSearchParams(searchParams);
    if (valor) {
      params.set(chave, valor);
    } else {
      params.delete(chave);
    }
    if (chave === 'divisao') params.delete('categoria');
    if (chave !== 'pagina') params.set('pagina', '1');
    setSearchParams(params);
  };

  return (
    <main className="produtos-main">
      <section>
        <div className="global-wrapper">
          <div className="cabecalho-produtos">
            <h2>Todos os Produtos</h2>
            <p>Aqui pode encontrar todos os produtos que temos à sua disposição.</p>
          </div>

          <div className="filtros">
            <label>
              Divisão:
              <select value={divisaoSelecionada} onChange={e => atualizarFiltro('divisao', e.target.value)}>
                <option value="">Todas</option>
                {Object.keys(categoriasPorDivisao).map(div => (
                  <option key={div} value={div}>{div}</option>
                ))}
              </select>
            </label>

            {categoriasPorDivisao[divisaoSelecionada] && (
              <label>
                Categoria:
                <select value={categoriaSelecionada} onChange={e => atualizarFiltro('categoria', e.target.value)}>
                  <option value="">Todas</option>
                  {categoriasPorDivisao[divisaoSelecionada].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </label>
            )}

            <label>
              Cor:
              <select value={corSelecionada} onChange={e => atualizarFiltro('cor', e.target.value)}>
                <option value="">Todas</option>
                {coresDisponiveis.map(cor => (
                  <option key={cor} value={cor}>{cor}</option>
                ))}
              </select>
            </label>

            <label>
              Tamanho:
              <select value={tamanhoSelecionado} onChange={e => atualizarFiltro('tamanho', e.target.value)}>
                <option value="">Todos</option>
                {[...new Set(produtos.flatMap(p => Array.isArray(p.size) ? p.size : [p.size]))]
                  .sort((a, b) => a.localeCompare(b))
                  .map(tamanho => (
                    <option key={tamanho} value={tamanho}>{tamanho}</option>
                  ))}
              </select>
            </label>

            <label>
              Ordenar por:
              <select value={ordenacao} onChange={e => atualizarFiltro('ordenacao', e.target.value)}>
                <option value="">Padrão</option>
                <option value="preco_asc">Preço ascendente</option>
                <option value="preco_desc">Preço descendente</option>
                <option value="favoritos">Melhores avaliações</option>
              </select>
            </label>
          </div>

          {produtosFiltrados.length === 0 ? (
            <p className="sem-resultados">Não encontrámos nenhum produto com essas características.</p>
          ) : (
            <>
              <div className="produtos-grid">
                {produtosPaginados.map(produto => (
                  <div key={produto.id} className="produto-cartao">
                    <Link
                      to={`/produto/${produto.id}?${searchParams.toString()}`}
                      className="produto-link"
                      onClick={() => {
                        sessionStorage.setItem('scrollPosProdutos', window.scrollY);
                      }}
                    >
                      <div className={`produto-imagem-wrapper ${Object.values(produto.stock || {}).every(q => q === 0) ? 'indisponivel' : ''}`}>
                        <img src={produto.image} alt={produto.name} />
                        {Object.values(produto.stock || {}).every(q => q === 0) && (
                          <div className="faixa-indisponivel">Indisponível</div>
                        )}
                      </div>
                      <h3>{produto.name}</h3>
                      <p>{produto.description}</p>
                      <p><strong>{produto.price.toFixed(2)} €</strong></p>
                    </Link>
                    <button className="botao-favorito" onClick={() => toggleFavorito(produto.id)}>
                      {isFavorito(produto.id) ? <FaHeart color="#a88463" /> : <FaRegHeart />}
                    </button>
                  </div>
                ))}
              </div>

              <div className="paginacao">
                {Array.from({ length: totalPaginas }, (_, i) => (
                  <button
                    key={i}
                    className={i + 1 === paginaAtual ? 'ativo' : ''}
                    onClick={() => {
                      searchParams.set('pagina', (i + 1).toString());
                      setSearchParams(searchParams);
                      window.scrollTo({ top: 0, behavior: 'instant' });
                    }}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
