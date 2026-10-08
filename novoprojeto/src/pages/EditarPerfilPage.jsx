import React, { useState } from 'react';
import { useEditarPerfil } from '../context/EditarPerfilContext';
import { IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5';
import './EditarPerfilPage.css';

export default function EditarPerfilPage() {
  const {
    username, setUsername,
    email, setEmail,
    novaPassword, setNovaPassword,
    passwordAtual, setPasswordAtual,
    mensagem, handleSubmit
  } = useEditarPerfil();

  const [mostrarNova, setMostrarNova] = useState(false);
  const [mostrarAtual, setMostrarAtual] = useState(false);

  return (
    <main className="editar-perfil">
      <h2>Editar Dados da Conta</h2>
      <form onSubmit={handleSubmit} className="form-editar">
        <label>Username:</label>
        <input value={username} onChange={e => setUsername(e.target.value)} />

        <label>Email:</label>
        <input value={email} onChange={e => setEmail(e.target.value)} />

        <label>Nova Password:</label>
        <div className="input-password-wrapper">
          <input
            type={mostrarNova ? 'text' : 'password'}
            value={novaPassword}
            onChange={e => setNovaPassword(e.target.value)}
          />
          <button
            type="button"
            className="eye-button"
            onClick={() => setMostrarNova(!mostrarNova)}
            aria-label="Mostrar ou ocultar nova password"
          >
            {mostrarNova ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
          </button>
        </div>

        {novaPassword && (
          <>
            <label>
              Password Atual <span className="obrigatorio">(necessária para mudar a password)</span>:
            </label>
            <div className="input-password-wrapper">
              <input
                type={mostrarAtual ? 'text' : 'password'}
                value={passwordAtual}
                onChange={e => setPasswordAtual(e.target.value)}
              />
              <button
                type="button"
                className="eye-button"
                onClick={() => setMostrarAtual(!mostrarAtual)}
                aria-label="Mostrar ou ocultar password atual"
              >
                {mostrarAtual ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
              </button>
            </div>
          </>
        )}

        <button type="submit">Guardar Alterações</button>

        {mensagem && (
          <p className={`mensagem ${mensagem.toLowerCase().includes('sucesso') ? 'sucesso' : 'erro'}`}>
            {mensagem}
          </p>
        )}
      </form>
    </main>
  );
}
