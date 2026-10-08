import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IoSearch, IoHeartOutline, IoCartOutline, IoAppsOutline, IoPersonOutline } from 'react-icons/io5';
import './Header.css';
import { useHeader } from '../context/HeaderContext';
import { useProdutos } from '../context/ProdutosContext';
import { useCarrinho } from '../context/CarrinhoContext';
import { useLogIn } from '../context/LogInContext'; // <--- novo import

export default function Header() {
  const { termo, setTermo, getPesquisaInfo } = useHeader();
  const { produtos } = useProdutos();
  const { carrinho } = useCarrinho();
  const { user } = useLogIn(); // <--- novo hook
  const navigate = useNavigate();

  const handlePesquisa = () => {
    if (!termo.trim() || termo.trim().length < 4) return;

    const { categoriaMatch, divisaoMatch, corMatch, tamanhoMatch, produtoId } = getPesquisaInfo(termo, produtos);
    const params = new URLSearchParams();

    if (produtoId) {
      navigate(`/produto/${produtoId}`);
    } else {
      if (categoriaMatch) params.set('categoria', categoriaMatch);
      if (divisaoMatch) params.set('divisao', divisaoMatch);
      if (corMatch) params.set('cor', corMatch);
      if (tamanhoMatch) params.set('tamanho', tamanhoMatch);

      if (params.toString()) {
        navigate(`/produtos?${params.toString()}`);
      } else {
        navigate(`/produtos?termo=${termo}`);
      }
    }

    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handlePesquisa();
  };

  const totalProdutos = carrinho.reduce((acc, item) => acc + item.quantidade, 0);

  return (
    <header className="header">
      <div className="header-container">
        <h1 className="header-logo">
          <Link to="/">HomeDeco</Link>
        </h1>
        <div className="header-controls">
          <div className="header-search">
            <input
              type="text"
              placeholder="Pesquisar produtos..."
              value={termo}
              onChange={e => setTermo(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <button onClick={handlePesquisa}>
              <IoSearch size={24} />
            </button>
          </div>
          <nav className="header-nav-icons">
            <Link to={user ? "/perfil" : "/login"} title={user ? "Perfil" : "Login"}>
              <IoPersonOutline size={26} />
            </Link>
            <Link to="/produtos" title="Todos os Produtos">
              <IoAppsOutline size={26} />
            </Link>
            <Link to="/favoritos" title="Favoritos">
              <IoHeartOutline size={26} />
            </Link>
            <Link to="/carrinho" title="Carrinho" className="header-cart-icon">
              <IoCartOutline size={26} />
              {totalProdutos > 0 && (
                <span className="cart-badge">{totalProdutos}</span>
              )}
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
