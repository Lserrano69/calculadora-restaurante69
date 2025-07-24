import React from 'react';

const Spinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div
        className="w-12 h-12 rounded-full animate-spin border-4 border-solid border-indigo-500 border-t-transparent"
        role="status"
        aria-live="polite"
        aria-label="Cargando"
      ></div>
      <p className="text-indigo-300">Cargando...</p>
    </div>
  );
};

export default Spinner;
