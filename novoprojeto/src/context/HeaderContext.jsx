import React, { createContext, useContext, useState } from 'react';

const HeaderContext = createContext();

export const HeaderProvider = ({ children }) => {
  const [termo, setTermo] = useState('');

  const normalizar = str =>
    str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

  const categoriasPorDivisao = {
    Sala: ['Cadeirões', 'Cadeiras', 'Sofás', 'Mesas de Centro', 'Estantes', 'Mesas', 'Móveis TV', 'Bancos'],
    Quarto: ['Camas', 'Mesas de Cabeceira', 'Beliches', 'Armários'],
    'Casa de Banho': ['Lavatórios', 'Banheiras'],
    Escritório: ['Secretárias', 'Cadeiras de Escritório', 'Prateleiras', 'Candeeiros'],
    Hall: ['Sapateiras', 'Cabides'],
    Cozinha: ['Armários'],
    Exterior: ['Cadeiras Suspensas']
  };

  const mapaSingularPlural = {
    'sofa': 'Sofás', 'sofá': 'Sofás',
    'cadeirao': 'Cadeirões', 'cadeirão': 'Cadeirões',
    'cadeira': 'Cadeiras',
    'mesa': 'Mesas',
    'mesa de centro': 'Mesas de Centro', 'mesas de centro': 'Mesas de Centro',
    'mesa de cabeceira': 'Mesas de Cabeceira', 'mesas de cabeceira': 'Mesas de Cabeceira',
    'cadeira de escritorio': 'Cadeiras de Escritório', 'cadeiras de escritorio': 'Cadeiras de Escritório',
    'cadeira de escritório': 'Cadeiras de Escritório', 'cadeiras de escritório': 'Cadeiras de Escritório',
    'estante': 'Estantes',
    'secretaria': 'Secretárias', 'secretária': 'Secretárias',
    'banco': 'Bancos',
    'cama': 'Camas',
    'banheira': 'Banheiras',
    'lavatorio': 'Lavatórios', 'lavatório': 'Lavatórios',
    'armario': 'Armários', 'armário': 'Armários',
    'prateleira': 'Prateleiras',
    'candeeiro': 'Candeeiros',
    'sapateira': 'Sapateiras',
    'cabide': 'Cabides',
    'cadeira suspensa': 'Cadeiras Suspensas', 'cadeiras suspensas': 'Cadeiras Suspensas',
    'movel': 'Móveis TV', 'móvel': 'Móveis TV',
    'beliche': 'Beliches'
  };

  const getPesquisaInfo = (termo, produtos) => {
    const termoNormalizado = normalizar(termo);
    const termos = termoNormalizado.split(' ').filter(t => t.length >= 4);

    let divisaoMatch = '';
    let categoriaMatch = '';
    let corMatch = '';
    let tamanhoMatch = ''; 

    const produtoDireto = produtos.find(p => {
      const nomeNormalizado = normalizar(p.name);
      const nomePartes = nomeNormalizado.split(' ');

      return nomeNormalizado === termoNormalizado || 
             nomePartes[nomePartes.length - 1] === termoNormalizado;
    });

    if (produtoDireto) {
      return { produtoId: produtoDireto.id, termoNormalizado };
    }

    for (const [singular, plural] of Object.entries(mapaSingularPlural)) {
      if (termoNormalizado === singular || termoNormalizado === normalizar(plural)) {
        categoriaMatch = plural;
        break;
      }
    }

    if (categoriaMatch) {
      const produtosCategoria = produtos.filter(p => 
        normalizar(p.category) === normalizar(categoriaMatch)
      );
      if (produtosCategoria.length > 0) {
        return { produtosLista: produtosCategoria.map(p => p.id), termoNormalizado };
      }
    }

    for (const div of Object.keys(categoriasPorDivisao)) {
      const divNorm = normalizar(div);
      if (termoNormalizado === divNorm) {
        divisaoMatch = div;
        break;
      }
    }

    const coresUnicas = [...new Set(produtos.flatMap(p => Array.isArray(p.color) ? p.color : [p.color]))];
    for (const cor of coresUnicas) {
      const corNorm = normalizar(cor);
      if (termos.includes(corNorm)) {
        corMatch = cor;
        break;
      }
    }

    const tamanhosDisponiveis = ['pequeno', 'medio', 'grande'];
    for (const tamanho of tamanhosDisponiveis) {
      if (termos.includes(tamanho)) {
        tamanhoMatch = tamanho;
        break;
      }
    }

    return { categoriaMatch, divisaoMatch, corMatch, tamanhoMatch, termoNormalizado };
  };

  return (
    <HeaderContext.Provider value={{ termo, setTermo, getPesquisaInfo }}>
      {children}
    </HeaderContext.Provider>
  );
};

export const useHeader = () => useContext(HeaderContext);