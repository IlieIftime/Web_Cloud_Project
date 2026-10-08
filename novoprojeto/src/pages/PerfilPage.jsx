import React, { useState, useEffect } from 'react';
import './PerfilPage.css';
import { useLogIn } from '../context/LogInContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useProdutos } from '../context/ProdutosContext';
import { IoPersonCircleOutline } from 'react-icons/io5';

export default function PerfilPage() {
  const { user, logout, fetchUser, eliminarConta } = useLogIn();
  const { produtos } = useProdutos();
  const navigate = useNavigate();
  const location = useLocation();
  const [mostrarConfirmacaoLogout, setMostrarConfirmacaoLogout] = useState(false);
  const [mostrarConfirmacaoEliminacao, setMostrarConfirmacaoEliminacao] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser(token);
    }
  }, []);

  useEffect(() => {
    if (location?.state?.scrollToTop) {
      window.scrollTo(0, 0);
    }
  }, [location]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser(token);
    }
  }, [location?.state?.dadosAtualizados]);

  const formatarData = (data) => {
    if (!data) return 'N/D';
    const d = new Date(data);
    return d.toLocaleDateString('pt-PT');
  };

  const handleLogout = () => {
    logout();
    setTimeout(() => {
      navigate('/login');
      window.scrollTo(0, 0);
    }, 100);
  };

  const handleEliminarConta = async () => {
    try {
      await eliminarConta();
      navigate('/login', { state: { scrollToTop: true } });
    } catch (err) {
      console.error("Erro ao eliminar conta:", err);
      alert("Houve um erro ao eliminar a conta.");
    }
  };

  const getProduto = (id) => produtos.find(p => p.id === id);

  if (!user || !user.username || !user.historico) {
    return <main className="perfil-page">A carregar informações do utilizador...</main>;
  }

  const nomeVisivel = user.username
    .split('.')
    .map(p => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ');

  return (
    <main className="perfil-page">
      <div className="perfil-cabecalho">
        <IoPersonCircleOutline className="perfil-avatar" size={96} />
        <h2>Olá, {nomeVisivel}</h2>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Data de Registo:</strong> {formatarData(user.createdAt)}</p>
        <button className="editar-conta-btn" onClick={() => navigate('/editar-perfil')}>
          Editar Conta
        </button>
      </div>

      <div className="perfil-historico-wrapper">
        {user.historico.length > 0 && <h3>Histórico de Compras</h3>}
        {user.historico.map((compra, i) => {
          const produtosUnicos = [...new Set(compra.itens.map(item => item.id))];
          const produtosPorAvaliar = produtosUnicos.filter(id => {
            const produto = getProduto(id);
            if (!produto || !produto.reviews) return true;
            return !produto.reviews.some(r => r.userId === user._id);
          });

          return (
            <div key={`${compra.data}_${i}`} className="compra-card">
              <p><strong>Data:</strong> {formatarData(compra.data)}</p>
              <div className="produtos-compra">
                {compra.itens.map((item, j) => {
                  const produto = getProduto(item.id);
                  if (!produto) return null;
                  return (
                    <div key={j} className="produto-item">
                      <img
                        src={produto.image || '/placeholder.png'}
                        alt={produto.name || 'Produto'}
                        onClick={() => navigate(`/produto/${produto.id}`)}
                        style={{ cursor: 'pointer' }}
                      />
                      <div>
                        <p><strong>{produto.name}</strong></p>
                        <p>{item.quantidade}x Tamanho: {item.tamanho}</p>
                        <p>Preço(unid.): €{(produto.price || 0).toFixed(2)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="total-texto"><strong>Total:</strong> {Number(compra.total || 0).toFixed(2)} €</p>
              {produtosPorAvaliar.length > 0 && (
                <div className="avaliar-wrapper">
                  <button
                    onClick={() => navigate('/avaliar', { state: { produtosParaAvaliar: produtosPorAvaliar, scrollToTop: true } })}
                    className="avaliar-btn"
                  >
                    Deixar Avaliação
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="perfil-botoes-finais">
        <button className="logout-btn" onClick={() => setMostrarConfirmacaoLogout(true)}>
          Terminar Sessão
        </button>

        <button className="eliminar-conta-btn" onClick={() => setMostrarConfirmacaoEliminacao(true)}>
          Eliminar Conta
        </button>
      </div>

      {mostrarConfirmacaoLogout && (
        <div className="modal-overlay">
          <div className="modal">
            <p>Tem a certeza que quer terminar a sessão?</p>
            <div className="modal-buttons">
              <button onClick={handleLogout} className="confirm-btn">Sim, terminar</button>
              <button onClick={() => setMostrarConfirmacaoLogout(false)} className="cancel-btn">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {mostrarConfirmacaoEliminacao && (
        <div className="modal-overlay">
          <div className="modal">
            <p>Tem a certeza que quer eliminar a sua conta? Esta ação é irreversível.</p>
            <div className="modal-buttons">
              <button onClick={handleEliminarConta} className="confirm-btn danger">Sim, eliminar</button>
              <button onClick={() => setMostrarConfirmacaoEliminacao(false)} className="cancel-btn">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
