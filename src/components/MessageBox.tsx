
import React from 'react';
import { MessageBoxState } from '../types';

interface ButtonConfig {
    text: string;
    onClick: () => void;
    className?: string;
}

interface MessageBoxProps {
  state: MessageBoxState;
  onClose: () => void;
  buttons?: ButtonConfig[];
}

const MessageBox: React.FC<MessageBoxProps> = ({ state, onClose, buttons }) => {
  if (!state.isOpen) return null;

  const typeColorClasses = {
    error: 'text-red-400',
    success: 'text-green-400',
    info: 'text-white',
  };

  const defaultButtons = [{ text: 'OK', onClick: onClose, className: 'bg-indigo-600 hover:bg-indigo-700' }];
  const displayButtons = buttons || defaultButtons;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50" aria-modal="true" role="dialog">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center border border-gray-700 max-w-sm w-full">
        <p className={`text-lg font-medium mb-6 ${typeColorClasses[state.type || 'info']}`}>
          {state.message}
        </p>
        <div className="flex justify-center gap-4">
          {displayButtons.map((btn, index) => (
            <button
              key={index}
              onClick={btn.onClick}
              className={`text-white font-semibold py-2 px-5 rounded-lg transition duration-200 ease-in-out ${btn.className || 'bg-indigo-600 hover:bg-indigo-700'}`}
            >
              {btn.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MessageBox;
