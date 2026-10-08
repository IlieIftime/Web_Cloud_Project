import React from 'react';
import { useCarrinho } from '../context/CarrinhoContext';
import { useProdutos } from '../context/ProdutosContext';
import { useNavigate } from 'react-router-dom';
import { useLogIn } from '../context/LogInContext';
import './CarrinhoPage.css';
import { IoTrashOutline } from 'react-icons/io5';

export default function CarrinhoPage() {
  const { carrinho, atualizarQuantidade, removerProduto, setCarrinho } = useCarrinho();
  const { produtos } = useProdutos();
  const navigate = useNavigate();
  const { token, fetchUser } = useLogIn(); 

  const getProduto = (id) => produtos.find(p => p.id === id);

  const calcularSubtotal = () => {
    return carrinho.reduce((acc, item) => {
      const produto = getProduto(item.id);
      const preco = produto?.price ?? 0;
      return acc + preco * item.quantidade;
    }, 0).toFixed(2);
  };

  const handleContinuar = () => {
    navigate('/produtos');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleFinalizarCompra = async () => {
    if (carrinho.length === 0) return;

    const total = Number(calcularSubtotal());

    try {
      const response = await fetch('http://localhost:5000/checkout/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ carrinho, total }),
      });

      if (!response.ok) throw new Error("Erro ao confirmar compra");

      localStorage.removeItem('carrinho');
      setCarrinho([]);

      await fetchUser(token);
      navigate('/perfil');
    } catch (err) {
      console.error(err);
      alert("Houve um erro ao finalizar a compra.");
    }
  };

  return (
    <main className="carrinho-main">
      <section>
        <div className="global-wrapper">
          <h1 className="carrinho-titulo">O Meu Carrinho</h1>
          <p className="carrinho-subtitulo">
            Aqui pode encontrar todos os produtos que adicionou ao carrinho. Finalize a compra ou continue a explorar o catálogo.
          </p>
          <div className="carrinho-tabela-wrapper">
            <p className="carrinho-info">
              Tem {carrinho.reduce((acc, item) => acc + item.quantidade, 0)} produto{carrinho.length !== 1 ? 's' : ''} no carrinho
            </p>

            <div className="carrinho-tabela">
              <div className="carrinho-header">
                <span>Produto</span>
                <span>Preço</span>
                <span>Quantidade</span>
                <span>Total</span>
              </div>

              {carrinho.map(item => {
                const produto = getProduto(item.id);
                if (!produto) return null;

                return (
                  <div key={`${item.id}-${item.tamanho}`} className="carrinho-linha">
                    <div className="produto-info">
                      <img
                        src={produto.image}
                        alt={produto.name}
                        onClick={() => {
                          navigate(`/produto/${produto.id}`);
                          window.scrollTo(0, 0);
                        }}
                        style={{ cursor: 'pointer' }}
                      />
                      <div>
                        <h4>{produto.name}</h4>
                        <p>Tamanho: {item.tamanho}</p>
                      </div>
                    </div>
                    <span>{produto.price.toFixed(2)} €</span>
                    <div className="quantidade">
                      <button onClick={() => atualizarQuantidade(item.id, item.tamanho, -1)}>-</button>
                      <span>{item.quantidade}</span>
                      <button onClick={() => atualizarQuantidade(item.id, item.tamanho, 1)}>+</button>
                    </div>
                    <div className="linha-total">
                      <span>{(produto.price * item.quantidade).toFixed(2)} €</span>
                      <button
                        className="btn-remover"
                        onClick={() => removerProduto(item.id, item.tamanho)}
                        aria-label="Remover produto"
                      >
                        <IoTrashOutline size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="carrinho-bottom">
              <div className="carrinho-subtotal">
                <p><strong>Subtotal:</strong> {calcularSubtotal()} €</p>
                <small>Portes não incluídos</small>
              </div>

              <div className="carrinho-botoes">
                <button onClick={handleContinuar} className="btn-carrinho">Continuar a Comprar</button>
                <button className="btn-carrinho finalizar" onClick={handleFinalizarCompra}>
                  Finalizar Compra
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
