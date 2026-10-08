import React, { useState } from 'react';
import './LogInPage.css';
import { useRegister } from '../context/RegisterContext';
import { useLogIn } from '../context/LogInContext';
import { useNavigate } from 'react-router-dom';
import { IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [erro, setErro] = useState(null);

  const { registerUser, loading, successMessage, errorMessage } = useRegister();
  const { login } = useLogIn();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro(null);

    if (!username || !email || !password || !confirmar) {
      setErro('Por favor, preencha todos os campos.');
      return;
    }

    if (password !== confirmar) {
      setErro('As passwords não coincidem.');
      return;
    }

    const dados = { username, email, password };
    await registerUser(dados);

    const sucesso = await login(email, password);
    if (sucesso) navigate('/perfil');
  };

  return (
    <main className="login-page">
      <div className="login-container">
        <h2>Criar Conta</h2>
        <p>Preencha os dados para criar uma nova conta.</p>

        <form onSubmit={handleSubmit} className="login-form">
          <label htmlFor="username">Nome de Utilizador</label>
          <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="O seu nome de utilizador" />

          <label htmlFor="email">Email</label>
          <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="O seu email" />

          <label htmlFor="password">Password</label>
          <div className="input-password-wrapper">
            <input type={mostrarPassword ? 'text' : 'password'} id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="A sua password" />
            <button type="button" className="eye-button" onClick={() => setMostrarPassword(!mostrarPassword)} aria-label="Mostrar ou ocultar password">
              {mostrarPassword ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
            </button>
          </div>

          <label htmlFor="confirmar">Confirmar Password</label>
          <div className="input-password-wrapper">
            <input type={mostrarConfirmar ? 'text' : 'password'} id="confirmar" value={confirmar} onChange={(e) => setConfirmar(e.target.value)} placeholder="Confirme a sua password" />
            <button type="button" className="eye-button" onClick={() => setMostrarConfirmar(!mostrarConfirmar)} aria-label="Mostrar ou ocultar confirmação">
              {mostrarConfirmar ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
            </button>
          </div>

          {erro && <div className="erro-msg">{erro}</div>}
          {errorMessage && <div className="erro-msg">{errorMessage}</div>}
          {successMessage && <div className="sucesso-msg">{successMessage}</div>}

          <button type="submit" disabled={loading}>
            {loading ? 'A criar conta...' : 'Criar Conta'}
          </button>
        </form>
      </div>
    </main>
  );
}
