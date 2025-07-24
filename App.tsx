
import React, { useState, useEffect, useCallback } from 'react';
import {
  auth,
  onAuthStateChanged,
  User,
  setupMenuListener,
  addMenuItem as addMenuItemToDB,
  deleteMenuItem as deleteMenuItemFromDB,
} from './services/firebaseService';
import { MenuItem, Order, MessageBoxState } from './types';

import MenuItemCard from './components/MenuItemCard';
import OrderPanel from './components/OrderPanel';
import MessageBox from './components/MessageBox';
import Spinner from './components/Spinner';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order>({});
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState({
    text: 'Conectando...',
    color: 'text-yellow-400',
  });
  const [messageBox, setMessageBox] = useState<MessageBoxState>({
    isOpen: false,
    message: '',
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setConnectionStatus({ text: 'Conectado', color: 'text-green-400' });
      } else {
        setConnectionStatus({ text: 'Desconectado', color: 'text-red-400' });
        setIsLoading(false); // No hay usuario, no hay nada que cargar
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      setIsLoading(true);
      const unsubscribe = setupMenuListener(
        user.uid,
        (items) => {
          setMenuItems(items);
          setIsLoading(false);
        },
        (error) => {
          console.error(error);
          setMessageBox({
            isOpen: true,
            message: 'Error al cargar el menú: ' + error.message,
            type: 'error',
          });
          setIsLoading(false);
        }
      );
      return () => unsubscribe();
    }
  }, [user]);

  const showMessage = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    setMessageBox({ isOpen: true, message, type });
  };

  const addItemToOrder = useCallback((item: MenuItem) => {
    setCurrentOrder((prevOrder) => {
      const newOrder = { ...prevOrder };
      const existingItem = newOrder[item.id];
      if (existingItem) {
        newOrder[item.id] = { ...existingItem, quantity: existingItem.quantity + 1 };
      } else {
        newOrder[item.id] = { item, quantity: 1 };
      }
      return newOrder;
    });
  }, []);

  const removeItemFromOrder = useCallback((itemId: string) => {
    setCurrentOrder((prevOrder) => {
      const newOrder = { ...prevOrder };
      const existingItem = newOrder[itemId];
      if (existingItem && existingItem.quantity > 1) {
        newOrder[itemId] = { ...existingItem, quantity: existingItem.quantity - 1 };
      } else {
        delete newOrder[itemId];
      }
      return newOrder;
    });
  }, []);

  const clearOrder = useCallback(() => {
    setCurrentOrder({});
  }, []);

  const addMenuItem = async (name: string, price: number) => {
    if (!user) {
      return showMessage('Debes estar conectado para añadir productos.', 'error');
    }
    try {
      await addMenuItemToDB(user.uid, name, price);
      showMessage(`"${name}" añadido al menú.`, 'success');
    } catch (error: any) {
      showMessage(error.message, 'error');
    }
  };

  const deleteMenuItem = async (itemId: string) => {
    if (!user) {
      return showMessage('Debes estar conectado para eliminar productos.', 'error');
    }
    try {
      await deleteMenuItemFromDB(user.uid, itemId);
      setCurrentOrder(prevOrder => {
        const newOrder = { ...prevOrder };
        if (newOrder[itemId]) {
          delete newOrder[itemId];
        }
        return newOrder;
      });
      showMessage('Producto eliminado del menú.', 'success');
    } catch (error: any) {
      showMessage(error.message, 'error');
    }
  };

  return (
    <>
      <MessageBox
        state={messageBox}
        onClose={() => setMessageBox({ ...messageBox, isOpen: false })}
      />
      <div className="min-h-screen flex flex-col items-center justify-center p-4 font-sans text-gray-300">
        <div className="bg-gray-800 p-4 md:p-6 rounded-xl shadow-2xl w-full max-w-6xl flex flex-col lg:flex-row gap-6 border border-gray-700">
          <div className="lg:w-2/3 bg-gray-900 p-5 rounded-lg shadow-inner border border-gray-700 flex flex-col">
            <h2 className="text-2xl font-bold text-indigo-400 mb-5 text-center">Menú del Restaurante</h2>
            <div className="flex-grow overflow-hidden">
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <Spinner />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 h-full overflow-y-auto pr-2">
                  {menuItems.length > 0 ? (
                    menuItems.map((item) => (
                      <MenuItemCard
                        key={item.id}
                        item={item}
                        onAddToOrder={addItemToOrder}
                        onDelete={deleteMenuItem}
                      />
                    ))
                  ) : (
                     <p className="text-gray-400 text-center col-span-full py-4">No hay productos en el menú.</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <OrderPanel
            order={currentOrder}
            onAddItem={addItemToOrder}
            onRemoveItem={removeItemFromOrder}
            onClearOrder={clearOrder}
            onAddMenuItem={addMenuItem}
          />
        </div>

        <div className="mt-6 text-center text-gray-400 text-sm">
          <p>ID de Usuario: <span className="font-mono text-gray-300">{user?.uid || 'No autenticado'}</span></p>
          <p>Estado: <span className={connectionStatus.color}>{connectionStatus.text}</span></p>
        </div>
      </div>
    </>
  );
}

export default App;
