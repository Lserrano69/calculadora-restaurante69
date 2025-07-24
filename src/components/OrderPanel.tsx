
import React, { useState, useMemo } from 'react';
import { Order, MenuItem } from '../types';
import MessageBox from './MessageBox';

interface OrderPanelProps {
  order: Order;
  onAddItem: (item: MenuItem) => void;
  onRemoveItem: (itemId: string) => void;
  onClearOrder: () => void;
  onAddMenuItem: (name: string, price: number) => Promise<void>;
}

const OrderPanel: React.FC<OrderPanelProps> = ({
  order,
  onAddItem,
  onRemoveItem,
  onClearOrder,
  onAddMenuItem
}) => {
  const [receivedAmount, setReceivedAmount] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const orderTotal = useMemo(() => {
    return Object.values(order).reduce((total, { item, quantity }) => total + item.price * quantity, 0);
  }, [order]);

  const changeAmount = useMemo(() => {
    const received = parseFloat(receivedAmount);
    if (isNaN(received)) {
      return 0;
    }
    return received - orderTotal;
  }, [receivedAmount, orderTotal]);

  const handleAddMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(newItemPrice);
    if (!newItemName.trim() || isNaN(price) || price <= 0) {
      // Basic validation feedback can be added here if needed
      return;
    }
    setIsAdding(true);
    try {
      await onAddMenuItem(newItemName.trim(), price);
      setNewItemName('');
      setNewItemPrice('');
    } finally {
      setIsAdding(false);
    }
  };
  
  const handleClearOrder = () => {
    onClearOrder();
    setReceivedAmount('');
    setConfirmClear(false);
  }

  const orderIsEmpty = Object.keys(order).length === 0;

  return (
    <>
      <MessageBox
        state={{ isOpen: confirmClear, message: '¿Estás seguro de que quieres limpiar el pedido actual?', type: 'info' }}
        onClose={() => setConfirmClear(false)}
        buttons={[
          { text: 'Limpiar', onClick: handleClearOrder, className: 'bg-red-600 hover:bg-red-700' },
          { text: 'Cancelar', onClick: () => setConfirmClear(false) }
        ]}
      />
      <div className="lg:w-1/3 bg-gray-900 p-5 rounded-lg shadow-inner border border-gray-700 flex flex-col">
        <h2 className="text-2xl font-bold text-green-400 mb-5 text-center">Pedido Actual</h2>
        <div className="flex-1 overflow-y-auto pr-2 mb-4">
          {orderIsEmpty ? (
            <p className="text-gray-400 text-center py-4">El pedido está vacío.</p>
          ) : (
            Object.values(order).map(({ item, quantity }) => (
              <div key={item.id} className="bg-gray-700 p-3 rounded-lg shadow-sm mb-2 flex justify-between items-center">
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{item.name}</p>
                  <p className="text-gray-400 text-sm">(${item.price.toFixed(2)})</p>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <button onClick={() => onRemoveItem(item.id)} className="bg-red-500 hover:bg-red-600 text-white font-bold w-6 h-6 rounded-full flex items-center justify-center transition transform hover:scale-110">-</button>
                  <span className="text-yellow-300 font-bold text-lg w-6 text-center">{quantity}</span>
                  <button onClick={() => onAddItem(item)} className="bg-green-500 hover:bg-green-600 text-white font-bold w-6 h-6 rounded-full flex items-center justify-center transition transform hover:scale-110">+</button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-auto pt-4 border-t border-gray-700 space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xl font-semibold text-gray-300">TOTAL:</span>
                <span className="text-3xl font-bold text-green-400">${orderTotal.toFixed(2)}</span>
              </div>
              <div className="mb-2">
                <label htmlFor="received-amount" className="block text-gray-300 text-sm font-semibold mb-1">Monto Recibido:</label>
                <input type="number" id="received-amount" placeholder="0.00" step="0.01" min="0" value={receivedAmount} onChange={e => setReceivedAmount(e.target.value)} className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 text-lg focus:ring-indigo-500 focus:border-indigo-500" />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xl font-semibold text-gray-300">CAMBIO:</span>
                <span className={`text-3xl font-bold ${changeAmount < 0 ? 'text-red-400' : 'text-yellow-400'}`}>
                  ${changeAmount.toFixed(2)}
                </span>
              </div>
            </div>

            <button onClick={() => setConfirmClear(true)} disabled={orderIsEmpty} className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg shadow-md transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
              Limpiar Pedido
            </button>
            
            <div className="pt-4 border-t border-gray-700">
                <h3 className="text-lg font-semibold text-indigo-400 mb-3 text-center">Añadir Producto al Menú</h3>
                <form onSubmit={handleAddMenuItem} className="flex flex-col sm:flex-row gap-3">
                    <input type="text" value={newItemName} onChange={e => setNewItemName(e.target.value)} placeholder="Nombre" className="flex-1 p-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500" required />
                    <input type="number" value={newItemPrice} onChange={e => setNewItemPrice(e.target.value)} placeholder="Precio" step="0.01" min="0" className="w-24 p-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500" required />
                    <button type="submit" disabled={isAdding} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
                        {isAdding ? '...' : 'Añadir'}
                    </button>
                </form>
            </div>
        </div>
      </div>
    </>
  );
};

export default OrderPanel;
