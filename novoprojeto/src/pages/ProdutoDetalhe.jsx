import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaStar, FaRegStar, FaHeart, FaCartPlus } from 'react-icons/fa';
import './ProdutoDetalhe.css';
import { useProduto } from '../context/ProdutoContext';
import { useFavoritos } from '../context/FavoritosContext';
import { useCarrinho } from '../context/CarrinhoContext';
import { useProdutos } from '../context/ProdutosContext';
import { useLogIn } from '../context/LogInContext';

export default function ProdutoDetalhe() {
  const { token } = useLogIn();
  const location = useLocation();
  const navigate = useNavigate();
  const { produto } = useProduto();
  const { favoritos, toggleFavorito, isFavorito } = useFavoritos();
  const { carrinho, adicionarProduto, removerProduto } = useCarrinho();
  const { produtos } = useProdutos();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  const [thumbIndex, setThumbIndex] = useState(0);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [tamanhoSelecionado, setTamanhoSelecionado] = useState('');
  const [mensagemErro, setMensagemErro] = useState('');
  const [mensagemSucesso, setMensagemSucesso] = useState('');

  const noCarrinho = carrinho.some(item => item.id === produto.id);
  const avgRating =
    produto.reviews.reduce((sum, r) => sum + r.score, 0) / (produto.reviews.length || 1);

  const similares = produtos
    .filter(p => p.category === produto.category && p.id !== produto.id)
    .slice(0, 4);

  const primeiraReview = produto.reviews[0];
  const restantesReviews = produto.reviews.slice(1);
  const backLink = location.search ? `/produtos${location.search}` : '/produtos';

  const handleToggleCarrinho = () => {
    if (!token) return;

    if (!tamanhoSelecionado) {
      setMensagemErro("Por favor, selecione um tamanho antes de adicionar ao carrinho.");
      setTimeout(() => setMensagemErro(''), 3000);
      return;
    }

    const stockDisponivel = produto.stock?.[tamanhoSelecionado];

    if (stockDisponivel === undefined || stockDisponivel <= 0) {
      setMensagemErro("Este tamanho está atualmente indisponível.");
      setTimeout(() => setMensagemErro(''), 3000);
      return;
    }

    adicionarProduto(produto.id, tamanhoSelecionado);
    toggleFavorito(produto.id, true);
    if (isFavorito(produto.id)) toggleFavorito(produto.id);
    setMensagemSucesso("Produto adicionado ao carrinho com sucesso.");
    setTamanhoSelecionado('');

    if (location.search) {
      const scrollY = sessionStorage.getItem('scrollPosProdutos') || 0;
      setTimeout(() => {
        navigate(`/produtos${location.search}`);
      }, 1500);
    } else {
      setTimeout(() => setMensagemSucesso(''), 3000);
    }
  };

  const handleSelecionarTamanho = (e) => {
    setTamanhoSelecionado(e.target.value);
  };

  return (
    <main className="pd-main">
      <section>
        <div className="global-wrapper">
          <nav className="pd-botoes">
            <Link to="/">Home</Link> &rsaquo;{' '}
            <Link to={backLink}>Produtos</Link> &rsaquo;{' '}
            <span>{produto.name}</span>
          </nav>

          <div className="pd-detalhe-container">
              <div className="pd-preview">
                <div className={`pd-preview-img-wrapper ${Object.values(produto.stock || {}).every(q => q === 0) ? 'indisponivel' : ''}`}>
                  <img src={produto.image} alt={produto.name} />
                  {Object.values(produto.stock || {}).every(q => q === 0) && (
                    <div className="faixa-indisponivel-pd">Indisponível</div>
                  )}
                </div>
              </div>

            <div className="pd-info">
              <h1 className="pd-titlo">{produto.name}</h1>
              <p className="pd-preco">{produto.price.toFixed(2)} €</p>

              <h3 className="pd-subtitulo">Descrição</h3>
              <p className="pd-descricao">{produto.description}</p>

              <div className="pd-tamanho">
                <select 
                  value={tamanhoSelecionado} 
                  onChange={handleSelecionarTamanho} 
                  disabled={!produto.size || produto.size.length === 0}
                >
                  <option value="">selecione o tamanho</option>
                  {produto.size && produto.size.map((tamanho, index) => {
                    const indisponivel = produto.stock?.[tamanho] <= 0;
                    return (
                      <option 
                        key={index} 
                        value={tamanho} 
                        disabled={indisponivel}
                        className={indisponivel ? "tamanho-indisponivel" : ""}
                      >
                        {tamanho} {indisponivel ? '(indisponível)' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="pd-acoes">
                <button
                  className={`pd-fav-btn ${isFavorito(produto.id) ? 'ativo' : ''}`}
                  onClick={() => toggleFavorito(produto.id)}
                >
                  <FaHeart /> {isFavorito(produto.id) ? 'Favorito' : 'Adicionar aos favoritos'}
                </button>
                <button
                  className={`pd-cart-btn ${Object.values(produto.stock || {}).every(q => q === 0) ? 'disabled' : ''}`}
                  onClick={handleToggleCarrinho}
                  disabled={Object.values(produto.stock || {}).every(q => q === 0)}
                >
                  <FaCartPlus /> Adicionar ao carrinho
                </button>
              </div>

              <div className="pd-mensagens">
                {mensagemErro && (
                  <p className="pd-mensagem pd-mensagem-erro">{mensagemErro}</p>
                )}
                {mensagemSucesso && (
                  <p className="pd-mensagem pd-mensagem-sucesso">{mensagemSucesso}</p>
                )}
              </div>

              <div className="pd-avaliacoes">
                <h3>Avaliações</h3>
                <div className="pd-rating-block">
                  <div className="pd-rating-num">
                    {avgRating.toFixed(1)} <span>/ 5</span>
                  </div>
                  <div className="pd-rating-stars">
                    {Array.from({ length: 5 }, (_, i) =>
                      i + 1 <= Math.round(avgRating) ? (
                        <FaStar key={i} />
                      ) : (
                        <FaRegStar key={i} />
                      )
                    )}
                    <span>({produto.reviews.length} avaliações)</span>
                  </div>

                  <ul className="pd-review-list">
                    <li>
                      <strong>{primeiraReview.name}</strong><br />
                      ({primeiraReview.score}/5) "{primeiraReview.comment}"
                    </li>

                    {showAllReviews &&
                      restantesReviews.map((r, idx) => (
                        <li key={idx}>
                          <strong>{r.name}</strong><br />
                          ({r.score}/5) "{r.comment}"
                        </li>
                      ))}
                  </ul>

                  {produto.reviews.length > 1 && (
                    <button
                      className="pd-ver-mais"
                      onClick={() => setShowAllReviews(!showAllReviews)}
                    >
                      {showAllReviews ? '– Ocultar avaliações' : '+ Ver todas as avaliações'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {similares.length > 0 && (
            <section className="pd-similares">
              <h2>Talvez goste disto</h2>
              <div className="pd-lista-similares">
                {similares.map(p => (
                  <Link
                    to={`/produto/${p.id}${location.search}`}
                    key={p.id}
                    className="pd-card-similar"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'auto' })}
                  >
                    <img src={p.image} alt={p.name} />
                    <h3>{p.name}</h3>
                    <p>{p.price.toFixed(2)} €</p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </section>
    </main>
  );
}