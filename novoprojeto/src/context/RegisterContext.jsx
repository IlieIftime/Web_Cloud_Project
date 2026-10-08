import { createContext, useContext, useState } from "react";
import axios from "axios";

const RegisterContext = createContext();

export const RegisterProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const registerUser = async (dados) => {
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const res = await axios.post("http://localhost:5000/users", dados);
      if (res.status === 201) {
        setSuccessMessage("Conta criada com sucesso!");
      }
    } catch (err) {
      if (err.response?.status === 409) {
        setErrorMessage("Email ou nome de utilizador já existente.");
      } else {
        setErrorMessage("Erro ao criar conta. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <RegisterContext.Provider value={{ registerUser, loading, successMessage, errorMessage }}>
      {children}
    </RegisterContext.Provider>
  );
};

export const useRegister = () => useContext(RegisterContext);
