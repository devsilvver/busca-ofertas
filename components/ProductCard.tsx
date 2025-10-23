import React from 'react';
import { Product, DealStatus } from '../types';
import PriceChart from './PriceChart';
import { BellIcon, BellSlashIcon, CheckCircleIcon, CouponIcon, ExclamationTriangleIcon, InformationCircleIcon, TrashIcon, ExternalLinkIcon, EmptyStateIcon } from './icons/Icons';

interface ProductCardProps {
  product: Product;
  onToggleNotifications: (id: string) => void;
  onRemove: (id: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onToggleNotifications, onRemove }) => {

  const getDealStatusInfo = () => {
    switch (product.dealStatus) {
      case DealStatus.GOOD:
        return {
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/30',
          textColor: 'text-green-400',
          icon: <CheckCircleIcon />,
          text: 'Ótima Oferta',
        };
      case DealStatus.AVERAGE:
        return {
          bgColor: 'bg-yellow-500/10',
          borderColor: 'border-yellow-500/30',
          textColor: 'text-yellow-400',
          icon: <InformationCircleIcon />,
          text: 'Preço Médio',
        };
      case DealStatus.POOR:
        return {
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/30',
          textColor: 'text-red-400',
          icon: <ExclamationTriangleIcon />,
          text: 'Oferta Ruim',
        };
    }
  };

  const dealInfo = getDealStatusInfo();

  return (
    <div className="bg-slate-800 rounded-xl overflow-hidden shadow-2xl border border-slate-700 transition-all hover:border-cyan-600/50 hover:shadow-cyan-900/30">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="flex-shrink-0 w-full sm:w-32 h-32 bg-slate-700 rounded-lg flex items-center justify-center">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain rounded-lg p-2" />
            ) : (
              <EmptyStateIcon />
            )}
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-cyan-400 font-medium">{product.brand}</p>
                <h3 className="text-xl font-bold text-white">{product.name}</h3>
              </div>
              <div className="flex items-center gap-2">
                 <button 
                  onClick={() => onToggleNotifications(product.id)}
                  className="text-slate-400 hover:text-white transition"
                  title={product.notifications ? "Desativar Notificações" : "Ativar Notificações"}
                >
                  {product.notifications ? <BellIcon /> : <BellSlashIcon />}
                </button>
                <button
                  onClick={() => onRemove(product.id)}
                  className="text-slate-400 hover:text-red-500 transition"
                  title="Remover Produto"
                >
                  <TrashIcon />
                </button>
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-3 flex-wrap">
                <p className="text-3xl font-extrabold text-white">{product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                <a href={product.storeUrl} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-cyan-400 transition flex items-center gap-1.5 text-sm group">
                    <span>na <span className="font-semibold text-slate-300 group-hover:text-cyan-400">{product.storeName}</span></span>
                    <ExternalLinkIcon />
                </a>
            </div>
            <div className={`mt-3 p-3 rounded-lg flex items-center gap-3 text-sm ${dealInfo.bgColor} border ${dealInfo.borderColor}`}>
              <span className={dealInfo.textColor}>{dealInfo.icon}</span>
              <div>
                <p className={`font-semibold ${dealInfo.textColor}`}>{dealInfo.text}</p>
                <p className="text-slate-400 text-xs">{product.dealReasoning}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-slate-300 mb-3">Histórico de Preços (6 Meses)</h4>
            <div className="h-48 bg-slate-900/50 rounded-lg p-2">
              <PriceChart data={product.priceHistory} />
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-slate-300 mb-3">Cupons Disponíveis</h4>
            <div className="space-y-3">
              {product.coupons.length > 0 ? product.coupons.map((coupon) => (
                <div key={coupon.code} className="bg-slate-700/50 rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-cyan-900/50 rounded-md text-cyan-400">
                      <CouponIcon />
                    </div>
                    <div>
                      <p className="font-mono text-sm text-cyan-300 bg-slate-800 px-2 py-1 rounded inline-block">{coupon.code}</p>
                      <p className="text-xs text-slate-400 mt-1">{coupon.description}</p>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-slate-500 text-sm">Nenhum cupom encontrado.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;