// AvaliarPage.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLogIn } from '../context/LogInContext';
import { useProdutos } from '../context/ProdutosContext';
import './AvaliarPage.css';
import { FaStar } from 'react-icons/fa';

export default function AvaliarPage() {
  const { state } = useLocation();
  const produtosParaAvaliar = state?.produtosParaAvaliar || [];
  const { token, fetchUser } = useLogIn();
  const { produtos, fetchProdutos } = useProdutos();
  const navigate = useNavigate();

  const [avaliacoes, setAvaliacoes] = useState([]);

  useEffect(() => {
    if (state?.scrollToTop) {
      window.scrollTo(0, 0);
    }
  }, [state]);

  useEffect(() => {
    if (!produtosParaAvaliar || produtosParaAvaliar.length === 0) return;

    const nomeAtual = JSON.parse(localStorage.getItem('user'))?.username?.toLowerCase();

    const inicial = produtosParaAvaliar
      .map(id => {
        const produto = produtos.find(p => p.id === id);
        const jaAvaliado = produto?.reviews?.some(r =>
          typeof r.name === 'string' && r.name.toLowerCase() === nomeAtual
        );
        return !jaAvaliado ? { id, score: 0, comment: '', enviado: false } : null;
      })
      .filter(Boolean);

    setAvaliacoes(inicial);
  }, [produtosParaAvaliar, produtos]);

  const atualizarCampo = (index, campo, valor) => {
    const novo = [...avaliacoes];
    novo[index][campo] = valor;
    setAvaliacoes(novo);
  };

  const enviarAvaliacao = async (produto, index) => {
    const { id, score, comment } = produto;
    if (!score || !comment) return;

    try {
      const res = await fetch(`http://localhost:5000/products/${id}/review`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ score, comment })
      });

      if (!res.ok) throw new Error();

      const novo = [...avaliacoes];
      novo[index].enviado = true;
      const restantes = novo.filter((_, i) => i !== index);
      setAvaliacoes(restantes);

      await fetchProdutos();
      await fetchUser(token);

      if (restantes.length === 0) {
        setTimeout(() => {
          navigate('/perfil', { state: { scrollToTop: true } });
        }, 700);
      }

    } catch (err) {
      console.error(err);
    }
  };

  const getProduto = (id) => produtos.find(p => p.id === id);

  return (
    <main className="avaliar-main">
      <div className="avaliar-container">
        <h1>Avaliar Produtos</h1>
        {avaliacoes.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#6e4b34', fontWeight: 'bold' }}>
            Todos os produtos já foram avaliados.
          </p>
        ) : (
          avaliacoes.map((item, i) => {
            const produto = getProduto(item.id);
            return (
              <div className="avaliar-card" key={item.id}>
                <img
                  src={produto?.image || '/placeholder.png'}
                  alt={produto?.name}
                  className="avaliar-imagem"
                />
                <div className="avaliar-info">
                  <h3>{produto?.name}</h3>
                  <p>Preço: €{(produto?.price || 0).toFixed(2)}</p>
                  <div className="estrelas">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        onClick={() => atualizarCampo(i, 'score', star)}
                        className={star <= item.score ? 'filled' : ''}
                      >
                        <FaStar />
                      </span>
                    ))}
                  </div>
                  <textarea
                    className="avaliar-textarea"
                    placeholder="Escreve a tua opinião..."
                    value={item.comment}
                    onChange={(e) => atualizarCampo(i, 'comment', e.target.value)}
                  />
                  <button
                    className="btn-avaliar"
                    onClick={() => enviarAvaliacao(item, i)}
                  >
                    Avaliar Produto
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </main>
  );
}
