import React, { useState } from 'react';
import { ProductInputData, ProductInputType } from '../types';
import { UrlIcon, TextIcon, ImageIcon, LoadingIcon } from './icons/Icons';

interface ProductInputProps {
  onAddProduct: (data: ProductInputData) => void;
  isLoading: boolean;
}

const ProductInput: React.FC<ProductInputProps> = ({ onAddProduct, isLoading }) => {
  const [activeTab, setActiveTab] = useState<ProductInputType>(ProductInputType.URL);
  const [inputValue, setInputValue] = useState('');
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    onAddProduct({ type: activeTab, value: inputValue });
    setInputValue('');
    setFilePreview(null);
    setFileName(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setInputValue(base64String);
        setFilePreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const TabButton = ({ type, icon, label }: { type: ProductInputType; icon: React.ReactNode; label: string }) => (
    <button
      type="button"
      onClick={() => {
          setActiveTab(type);
          setInputValue('');
          setFilePreview(null);
          setFileName(null);
      }}
      className={`flex-1 flex items-center justify-center gap-2 p-3 text-sm font-semibold rounded-t-lg transition-all duration-200 ${
        activeTab === type ? 'bg-slate-700 text-cyan-400' : 'bg-slate-800 text-slate-400 hover:bg-slate-700/50'
      }`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex border-b border-slate-700">
        <TabButton type={ProductInputType.URL} icon={<UrlIcon />} label="URL" />
        <TabButton type={ProductInputType.TEXT} icon={<TextIcon />} label="Texto" />
        <TabButton type={ProductInputType.IMAGE} icon={<ImageIcon />} label="Imagem" />
      </div>

      <div className="pt-6">
        {activeTab === ProductInputType.URL && (
          <input
            type="url"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="https://exemplo.com/pagina-do-produto"
            className="w-full bg-slate-700 text-white p-3 rounded-md border border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition"
            required
          />
        )}
        {activeTab === ProductInputType.TEXT && (
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ex: Fone de ouvido Sony WH-1000XM5"
            className="w-full bg-slate-700 text-white p-3 rounded-md border border-slate-600 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition"
            required
          />
        )}
        {activeTab === ProductInputType.IMAGE && (
          <div>
            <label
              htmlFor="file-upload"
              className="relative cursor-pointer bg-slate-700 rounded-md p-4 flex flex-col items-center justify-center border-2 border-dashed border-slate-600 hover:border-cyan-500 transition"
            >
              {filePreview ? (
                <img src={filePreview} alt="Preview" className="h-24 max-h-24 w-auto rounded-md object-contain" />
              ) : (
                <ImageIcon />
              )}
              <span className="mt-2 text-sm text-slate-400">{fileName || "Clique para carregar uma imagem"}</span>
              <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
            </label>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading || !inputValue.trim()}
        className="mt-6 w-full flex items-center justify-center bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-md transition-all duration-300 transform hover:scale-105 disabled:scale-100 shadow-lg shadow-cyan-900/50"
      >
        {isLoading ? <LoadingIcon /> : 'Rastrear Produto'}
      </button>
    </form>
  );
};

export default ProductInput;