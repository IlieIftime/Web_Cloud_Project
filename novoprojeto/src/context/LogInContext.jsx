// LogInContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const LogInContext = createContext();

export const LogInProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [errorMessage, setErrorMessage] = useState(null);

  const logoutCallbacks = [];

  const registerLogoutCallback = (cb) => {
    if (typeof cb === 'function') {
      logoutCallbacks.push(cb);
    }
  };

  const logout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    logoutCallbacks.forEach((cb) => cb());
  };

  const login = async (email, password) => {
    setErrorMessage(null);
    try {
      const res = await axios.post('http://localhost:5000/user/login', {
        username: email,
        password,
      });

      const jwtToken = res.data.token;
      localStorage.setItem('token', jwtToken);
      setToken(jwtToken);

      await fetchUser(jwtToken); 
      return true;
    } catch (err) {
      setErrorMessage('Email ou password incorretos.');
      return false;
    }
  };

  const eliminarConta = async () => {
    if (!token) return;

    try {
      const res = await fetch('http://localhost:5000/user/eliminar-conta', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Erro ao eliminar conta");

      logout(); 
    } catch (err) {
      console.error("Erro ao eliminar conta:", err);
      alert("Erro ao eliminar conta. Tente novamente.");
    }
  };

  const fetchUser = async (jwt) => {
    try {
      const res = await axios.get('http://localhost:5000/user/me', {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
    } catch (err) {
      console.error('Erro a carregar utilizador:', err.response?.data || err.message);
      logout();
    }
  };

  useEffect(() => {
    const jwtToken = localStorage.getItem('token');
    if (jwtToken) {
      fetchUser(jwtToken);
    }
  }, []);

  return (
    <LogInContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        errorMessage,
        fetchUser,
        eliminarConta,
        registerLogoutCallback,
      }}
    >
      {children}
    </LogInContext.Provider>
  );
};

export const useLogIn = () => useContext(LogInContext);
