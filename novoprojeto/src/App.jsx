import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from "./components/Footer";
import HomePage from './pages/HomePage';
import ProdutosPage from './pages/ProdutosPage';
import ProdutoDetalhe from './pages/ProdutoDetalhe';
import FavoritosPage from './pages/FavoritosPage';
import CarrinhoPage from './pages/CarrinhoPage';
import LogInPage from './pages/LogInPage';
import RegisterPage from './pages/RegisterPage';
import PerfilPage from './pages/PerfilPage';
import AvaliarPage from './pages/AvaliarPage';
import EditarPerfilPage from './pages/EditarPerfilPage';

import { ProdutoProvider } from './context/ProdutoContext';
import { EditarPerfilProvider } from './context/EditarPerfilContext'; 

export default function App() {
  return (
    <Router>
      <Header />
      <div className="global-wrapper">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/produtos" element={<ProdutosPage />} />
          <Route
            path="/produto/:id"
            element={
              <ProdutoProvider>
                <ProdutoDetalhe />
              </ProdutoProvider>
            }
          />
          <Route path="/favoritos" element={<FavoritosPage />} />
          <Route path="/carrinho" element={<CarrinhoPage />} />
          <Route path="/login" element={<LogInPage />} />
          <Route path="/criar-conta" element={<RegisterPage />} />
          <Route path="/perfil" element={<PerfilPage />} />
          <Route path="/avaliar" element={<AvaliarPage />} />

          <Route
            path="/editar-perfil"
            element={
              <EditarPerfilProvider>
                <EditarPerfilPage />
              </EditarPerfilProvider>
            }
          />
        </Routes>
      </div>
      <Footer />
    </Router>
  );
}
