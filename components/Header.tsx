import React from 'react';
import { LogoIcon } from './icons/Icons';

const Header: React.FC = () => {
  return (
    <header className="bg-slate-800/50 backdrop-blur-lg border-b border-slate-700 sticky top-0 z-10">
      <div className="container mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <LogoIcon />
          <h1 className="text-2xl font-bold text-white">
            Price <span className="text-cyan-400">Pulse</span>
          </h1>
        </div>
        <p className="hidden md:block text-slate-400 text-sm">Seu Caçador de Ofertas com IA</p>
      </div>
    </header>
  );
};

export default Header;