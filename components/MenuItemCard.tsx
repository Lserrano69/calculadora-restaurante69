import React, { useState } from 'react';
import { MenuItem } from '../types';
import MessageBox from './MessageBox';

interface MenuItemCardProps {
  item: MenuItem;
  onAddToOrder: (item: MenuItem) => void;
  onDelete: (itemId: string) => void;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, onAddToOrder, onDelete }) => {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDeleteClick = () => {
    setConfirmDelete(true);
  };

  const handleConfirmDelete = () => {
    onDelete(item.id);
    setConfirmDelete(false);
  };
  
  return (
    <>
      <MessageBox
        state={{
          isOpen: confirmDelete,
          message: `¿Estás seguro de que quieres eliminar "${item.name}" del menú? Esta acción es permanente.`,
          type: 'info',
        }}
        onClose={() => setConfirmDelete(false)}
        buttons={[
          { text: 'Confirmar', onClick: handleConfirmDelete, className: 'bg-red-600 hover:bg-red-700' },
          { text: 'Cancelar', onClick: () => setConfirmDelete(false) }
        ]}
      />
      <div className="bg-gray-700 p-4 rounded-lg shadow-md flex flex-col justify-between items-center transform transition duration-200 hover:scale-105 hover:bg-gray-600">
        <div className="text-center mb-3 flex-grow">
          <span className="text-lg font-medium text-white break-words">{item.name}</span>
        </div>
        <span className="text-xl font-bold text-yellow-300 mb-3">${item.price ? item.price.toFixed(2) : '0.00'}</span>
        <div className="grid grid-cols-2 gap-2 w-full">
          <button
            onClick={() => onAddToOrder(item)}
            className="add-to-order-btn bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 rounded-lg shadow-sm transition duration-200 ease-in-out"
            aria-label={`Añadir ${item.name} al pedido`}
          >
            Añadir
          </button>
          <button
            onClick={handleDeleteClick}
            className="delete-menu-item-btn bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-lg shadow-sm transition duration-200 ease-in-out"
            aria-label={`Eliminar ${item.name} del menú`}
          >
            Eliminar
          </button>
        </div>
      </div>
    </>
  );
};

export default MenuItemCard;
