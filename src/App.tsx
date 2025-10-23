import React, { useState, useCallback } from 'react';
import { Product, ProductInputData } from './types';
import { analyzeProductInput, getProductPriceAnalysis } from './services/geminiService';
import Header from './components/Header';
import ProductInput from './components/ProductInput';
import ProductCard from './components/ProductCard';
import { AnalyticsIcon, EmptyStateIcon, ErrorIcon } from './components/icons/Icons';

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddProduct = useCallback(async (input: ProductInputData) => {
    setIsLoading(true);
    setError(null);
    try {
      const initialInfo = await analyzeProductInput(input);
      if (!initialInfo || !initialInfo.name) {
        throw new Error("Não foi possível identificar o produto. Por favor, tente uma entrada diferente.");
      }
      
      const analysis = await getProductPriceAnalysis(initialInfo.name);
      
      const newProduct: Product = {
        id: Date.now().toString(),
        name: initialInfo.name,
        brand: initialInfo.brand,
        imageUrl: initialInfo.imageUrl,
        ...analysis,
        notifications: true,
      };
      
      setProducts(prevProducts => [newProduct, ...prevProducts]);
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : "Ocorreu um erro desconhecido.";
      setError(`Falha ao adicionar produto. ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleToggleNotifications = (productId: string) => {
    setProducts(products.map(p => 
      p.id === productId ? { ...p, notifications: !p.notifications } : p
    ));
  };

  const handleRemoveProduct = (productId: string) => {
    setProducts(products.filter(p => p.id !== productId));
  };


  return (
    <div className="bg-slate-900 min-h-screen text-white flex flex-col">
      <Header />
      <main className="container mx-auto p-4 md:p-8 flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-1 lg:sticky lg:top-8 bg-slate-800 rounded-xl p-6 shadow-2xl border border-slate-700">
            <h2 className="text-2xl font-bold mb-1 text-cyan-400">Rastrear Novo Produto</h2>
            <p className="text-slate-400 mb-6">Adicione um produto via URL, texto ou imagem.</p>
            <ProductInput onAddProduct={handleAddProduct} isLoading={isLoading} />
          </div>

          <div className="lg:col-span-2">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <AnalyticsIcon />
              Seus Produtos Rastreados
            </h2>
            {isLoading && (
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center animate-pulse">
                <div className="w-24 h-24 bg-slate-700 rounded-lg mb-4"></div>
                <div className="h-6 w-3/4 bg-slate-700 rounded mb-2"></div>
                <div className="h-4 w-1/2 bg-slate-700 rounded"></div>
              </div>
            )}
            {error && (
              <div className="bg-red-900/50 border border-red-700 text-red-300 rounded-xl p-6 flex flex-col items-center text-center">
                 <ErrorIcon />
                 <h3 className="text-xl font-semibold mt-4 mb-2">Oops! Algo deu errado.</h3>
                 <p className="text-red-300">{error}</p>
              </div>
            )}
            {!isLoading && !error && products.length === 0 && (
              <div className="bg-slate-800/50 border-2 border-dashed border-slate-700 rounded-xl p-12 flex flex-col items-center text-center">
                <EmptyStateIcon />
                <h3 className="text-xl font-semibold mt-6 mb-2 text-slate-300">Sua lista está vazia</h3>
                <p className="text-slate-400 max-w-sm">Use o formulário para adicionar seu primeiro produto e deixe nosso assistente de IA começar a rastrear as melhores ofertas para você!</p>
              </div>
            )}
            <div className="space-y-6">
              {products.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onToggleNotifications={handleToggleNotifications}
                  onRemove={handleRemoveProduct}
                />
              ))}
            </div>
          </div>
        </div>
      </main>
      <footer className="text-center p-4 text-slate-500 text-sm border-t border-slate-800">
        © {new Date().getFullYear()} Guilherme Silvestrini. Todos os direitos reservados.
      </footer>
    </div>
  );
};

export default App;