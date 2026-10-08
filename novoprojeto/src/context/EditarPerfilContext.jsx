// context/EditarPerfilContext.jsx
import { createContext, useContext, useState } from 'react';
import { useLogIn } from './LogInContext';
import { useNavigate } from 'react-router-dom';

const EditarPerfilContext = createContext();

export function EditarPerfilProvider({ children }) {
  const { user, token, fetchUser } = useLogIn();
  const navigate = useNavigate();

  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [novaPassword, setNovaPassword] = useState('');
  const [passwordAtual, setPasswordAtual] = useState('');
  const [mensagem, setMensagem] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem('');

    const dados = {};
    if (username !== user.username) dados.username = username;
    if (email !== user.email) dados.email = email;

    if (novaPassword.trim()) {
      if (!passwordAtual.trim()) {
        setMensagem('Para alterar a password, tem de introduzir a password atual.');
        return;
      }
      dados.password = novaPassword;
      dados.passwordAtual = passwordAtual;
    }

    if (Object.keys(dados).length === 0) {
      setMensagem('Nenhuma alteração foi feita.');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/user/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(dados)
      });

      let resultado;
      try {
        resultado = await res.json();
      } catch {
        throw new Error("O servidor devolveu uma resposta inválida.");
      }

      if (!res.ok) throw new Error(resultado.message || 'Erro na atualização');

      if (resultado.token) {
        localStorage.setItem("token", resultado.token);
      }

      const tokenAtualizado = resultado.token || token;

      await new Promise(resolve => setTimeout(resolve, 1200));

      await fetchUser(tokenAtualizado);

      setMensagem('Dados atualizados com sucesso!');
      navigate('/perfil', { state: { scrollToTop: true, dadosAtualizados: true } });

    } catch (err) {
      const msg = err.message.toLowerCase();

      if (msg.includes("username") && msg.includes("ocupado")) {
        setMensagem("Escolha outro username, esse já está a ser utilizado.");
      } else if (msg.includes("email") && msg.includes("ocupado")) {
        setMensagem("Escolha outro email, esse já está a ser utilizado.");
      } else if (msg.includes("password") && msg.includes("incorreta")) {
        setMensagem("Password atual incorreta.");
      } else {
        setMensagem(err.message || "Ocorreu um erro ao atualizar.");
      }
    }
  };

  return (
    <EditarPerfilContext.Provider
      value={{
        username, setUsername,
        email, setEmail,
        novaPassword, setNovaPassword,
        passwordAtual, setPasswordAtual,
        mensagem,
        handleSubmit
      }}
    >
      {children}
    </EditarPerfilContext.Provider>
  );
}

export function useEditarPerfil() {
  return useContext(EditarPerfilContext);
}
