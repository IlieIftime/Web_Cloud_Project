import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

import { CarrinhoProvider } from './context/CarrinhoContext';
import { FavoritosProvider } from './context/FavoritosContext';
import { ProdutosProvider } from './context/ProdutosContext';
import { HomeProvider } from './context/HomeContext';
import { HeaderProvider } from './context/HeaderContext';
import { LogInProvider } from './context/LogInContext';
import { RegisterProvider } from './context/RegisterContext';
import { HistoricoProvider } from './context/HistoricoContext'; 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ProdutosProvider>
      <LogInProvider>
        <HistoricoProvider>
          <FavoritosProvider>     
            <CarrinhoProvider>
              <HomeProvider>
                <HeaderProvider>
                  <RegisterProvider>
                    <App />
                  </RegisterProvider>
                </HeaderProvider>
              </HomeProvider>
            </CarrinhoProvider>
          </FavoritosProvider>
        </HistoricoProvider>
      </LogInProvider>
    </ProdutosProvider>
  </React.StrictMode>
);
