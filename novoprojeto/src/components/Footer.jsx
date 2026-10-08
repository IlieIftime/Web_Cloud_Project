import React from 'react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="global-wrapper">
        <p>© {new Date().getFullYear()} HomeDeco. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}