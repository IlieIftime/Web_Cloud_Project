import React, { useState } from 'react';
import Slider from 'react-slick';
import { Link, useNavigate } from 'react-router-dom';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { useHome } from '../context/HomeContext';
import { useFavoritos } from '../context/FavoritosContext';
import './HomePage.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

export default function HomePage() {
  const {
    produtos,
    produtos2025,
    divisao,
    setDivisao,
    categoria,
    setCategoria,
    categoriasPorDivisao
  } = useHome();

  const { favoritos, toggleFavorito, isFavorito } = useFavoritos();
  const navigate = useNavigate();

  const handleSubmit = () => {
    const query = new URLSearchParams({ divisao, categoria }).toString();
    navigate(`/produtos?${query}`);
    window.scrollTo(0, 0);
  };

  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 1,
    arrows: true,
    responsive: [{ breakpoint: 768, settings: { slidesToShow: 1 } }]
  };

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [mensagemEnviada, setMensagemEnviada] = useState(false);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setMensagemEnviada(true);
    setNome('');
    setEmail('');
    setMensagem('');
    setTimeout(() => setMensagemEnviada(false), 5000);
  };

  return (
    <main style={{ backgroundColor: '#fdf6ec', minHeight: '100vh', width: '100%' }}>
      <section className="hero">
        <div className="global-wrapper">
          <h2>Bem-vindo à HomeDeco</h2>
          <p>
            Descubra uma coleção de mobília elegante e funcional!<br />
            A harmonia que o seu lar merece.
          </p>
        </div>
      </section>

      <section className="divisoes-estatisticas">
        <div className="global-wrapper">
          <div className="divisoes-linha">
            {[['41+', 'Sala'], ['15+', 'Quarto'], ['10+', 'Casa de Banho'], ['14+', 'Escritório'],
              ['4+', 'Hall'], ['4+', 'Cozinha'], ['4+', 'Exterior']].map(([num, nome]) => (
              <div className="divisoes-item" key={nome}>
                <p className="divisoes-num">{num} <span>Itens</span></p>
                <p className="divisoes-nome">{nome}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="destaques">
        <div className="global-wrapper">
          <h2>Produtos em Destaque</h2>
          <div className="conjunto-produtos">
            {produtos
              .filter(p => Object.values(p.stock).some(q => q > 0)) 
              .map(p => {
                const media = p.reviews.reduce((acc, r) => acc + r.score, 0) / (p.reviews.length || 1);
                return { ...p, media };
              })
              .sort((a, b) => b.media - a.media)
              .slice(0, 6)
              .map(p => (
                <div key={p.id} className="produto-cartao">
                  <Link to={`/produto/${p.id}`} className="produto-link" onClick={() => window.scrollTo(0, 0)}>
                    <div className={`produto-imagem-wrapper ${Object.values(p.stock).every(q => q === 0) ? 'indisponivel' : ''}`}>
                      <img src={p.image} alt={p.name} className="produto-imagem" />
                      {Object.values(p.stock).every(q => q === 0) && (
                        <div className="faixa-indisponivel">Indisponível</div>
                      )}
                    </div>
                    <h3>{p.name}</h3>
                    <p>{p.description}</p>
                    <p><strong>{p.price.toFixed(2)} €</strong></p>
                  </Link>
                  <button className="botao-favorito" onClick={() => toggleFavorito(p.id)}>
                    {isFavorito(p.id) ? <FaHeart color="#a88463" /> : <FaRegHeart />}
                  </button>
                </div>
              ))}
          </div>
        </div>
      </section>

      <section className="banner">
        <div className="global-wrapper">
          <h1>Descubra a Nova Coleção 2025</h1>
          <p>Faça da sua casa um lar...</p>

          <div className="carousel-2025">
            <Slider {...settings}>
              {[...produtos2025]
                .sort((a, b) => {
                  const stockA = Object.values(a.stock || {}).some(q => q > 0);
                  const stockB = Object.values(b.stock || {}).some(q => q > 0);
                  return stockB - stockA; // true (1) vem antes de false (0)
                })
                .map(p => {
                  const semStock = Object.values(p.stock || {}).every(q => q === 0);
                  return (
                    <Link
                      key={p.id}
                      to={`/produto/${p.id}`}
                      className="slide-item"
                      onClick={() => window.scrollTo(0, 0)}
                    >
                      <div className={`slide-image-wrapper ${semStock ? 'indisponivel' : ''}`}>
                        <img src={p.image} alt={p.name} className="slide-image" />
                        {semStock && <div className="faixa-indisponivel">Indisponível</div>}
                      </div>
                      <p className="slide-caption">{p.name}</p>
                    </Link>
                  );
                })}
            </Slider>
          </div>

          <Link to="/produtos" className="btn-banner" onClick={() => window.scrollTo(0, 0)}>
            Ver Produtos
          </Link>
        </div>
      </section>

      <section className="quiz-filtros">
        <div className="global-wrapper">
          <h2>Qual é o ambiente que quer transformar?</h2>

          <div className="step">
            <label>1. Escolha a divisão:</label>
            <div className="opcoes-divisao">
              {Object.keys(categoriasPorDivisao).map(d => (
                <div
                  key={d}
                  className={`divisao-imagem ${divisao === d ? 'ativo' : ''}`}
                  onClick={() => { setDivisao(d); setCategoria(''); }}
                  style={{ backgroundImage: `url(/imagens/${d.toLowerCase().replace(/ /g, '%20')}.png)` }}
                >
                  <span>{d}</span>
                </div>
              ))}
            </div>
          </div>

          {divisao && (
            <div className="step">
              <label>2. O que procura?</label>
              <select value={categoria} onChange={e => setCategoria(e.target.value)}>
                <option value="">Selecione uma categoria</option>
                {categoriasPorDivisao[divisao].map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          )}

          {categoria && (
            <button className="btn-banner" onClick={handleSubmit}>
              Ver Resultados
            </button>
          )}
        </div>
      </section>

      <section className="contacto-section">
        <div className="global-wrapper contacto-wrapper">
          <div className="contacto-info">
            <h2>Precisa de Ajuda?</h2>
            <p><strong>Endereço</strong><br />Av. Heliodoro Salgado 3, 2710-569 Sintra</p>
            <p><strong>Telefone</strong><br />917153040</p>
            <p><strong>E-mail</strong><br />homedeco@gmail.com</p>
          </div>
          <form className="contacto-form" onSubmit={handleFormSubmit}>
            <label>
              Nome *
              <input
                type="text"
                placeholder="O seu nome"
                value={nome}
                onChange={e => setNome(e.target.value)}
                required
              />
            </label>
            <label>
              E-mail *
              <input
                type="email"
                placeholder="O seu e-mail"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </label>
            <label>
              Mensagem
              <textarea
                rows="4"
                placeholder="Escreva a sua mensagem..."
                value={mensagem}
                onChange={e => setMensagem(e.target.value)}
              />
            </label>
            <button type="submit">Enviar</button>
            {mensagemEnviada && (
              <p className="sucesso-envio">A sua mensagem foi enviada com sucesso!</p>
            )}
          </form>
        </div>
      </section>
    </main>
  );
}