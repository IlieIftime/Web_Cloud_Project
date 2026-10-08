import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5';
import './LogInPage.css';
import { useLogIn } from '../context/LogInContext';

export default function LogInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const navigate = useNavigate();
  const { login, errorMessage } = useLogIn();
  const location = useLocation();

  useEffect(() => {
    if (location?.state?.scrollToTop || !location.state) {
      window.scrollTo(0, 0);
    }
  }, [location]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    const sucesso = await login(email, password);
    if (sucesso) {
        navigate('/perfil'); 
    }
  };

  return (
    <main className="login-page">
      <div className="login-wrapper">
        <div className="login-container">
          <h2>Iniciar Sessão</h2>
          <p>Introduza as suas credenciais para aceder à sua conta.</p>

          <form onSubmit={handleSubmit} className="login-form">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="O seu email" />

            <label htmlFor="password">Password</label>
            <div className="input-password-wrapper">
              <input type={mostrarPassword ? 'text' : 'password'} id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="A sua password" />
              <button type="button" className="eye-button" onClick={() => setMostrarPassword(!mostrarPassword)} aria-label="Mostrar ou ocultar password">
                {mostrarPassword ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
              </button>
            </div>

            {errorMessage && <div className="erro-msg">{errorMessage}</div>}
            <button type="submit">Entrar</button>
          </form>
        </div>

        <div className="criar-conta-wrapper">
          <button className="criar-conta-btn" onClick={() => navigate('/criar-conta')}>
            Criar conta
          </button>
        </div>
      </div>
    </main>
  );
}
