import React, { createContext, useContext, useState, useCallback } from 'react';

const ModalContext = createContext(null);

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

export const ModalProvider = ({ children }) => {
  const [modalState, setModalState] = useState(null);

  const showAlert = useCallback((message, title = 'Повідомлення') => {
    return new Promise((resolve) => {
      setModalState({
        type: 'alert',
        title,
        message,
        onConfirm: () => {
          setModalState(null);
          resolve(true);
        }
      });
    });
  }, []);

  const showConfirm = useCallback((message, title = 'Підтвердження') => {
    return new Promise((resolve) => {
      setModalState({
        type: 'confirm',
        title,
        message,
        onConfirm: () => {
          setModalState(null);
          resolve(true);
        },
        onCancel: () => {
          setModalState(null);
          resolve(false);
        }
      });
    });
  }, []);

  const showPrompt = useCallback((message, defaultValue = '', title = 'Введіть дані') => {
    return new Promise((resolve) => {
      setModalState({
        type: 'prompt',
        title,
        message,
        defaultValue,
        onConfirm: (val) => {
          setModalState(null);
          resolve(val);
        },
        onCancel: () => {
          setModalState(null);
          resolve(null);
        }
      });
    });
  }, []);

  return (
    <ModalContext.Provider value={{ showAlert, showConfirm, showPrompt }}>
      {children}
      
      {modalState && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full mx-auto overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-200">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{modalState.title}</h3>
              <p className="text-gray-600 mb-4">{modalState.message}</p>
              
              {modalState.type === 'prompt' && (
                <input
                  type="text"
                  autoFocus
                  defaultValue={modalState.defaultValue}
                  id="modal-prompt-input"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') modalState.onConfirm(e.target.value);
                  }}
                />
              )}
            </div>
            
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              {(modalState.type === 'confirm' || modalState.type === 'prompt') && (
                <button 
                  onClick={modalState.onCancel}
                  className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Скасувати
                </button>
              )}
              
              <button 
                onClick={() => {
                  if (modalState.type === 'prompt') {
                    const val = document.getElementById('modal-prompt-input')?.value || '';
                    modalState.onConfirm(val);
                  } else {
                    modalState.onConfirm();
                  }
                }}
                className="px-4 py-2 bg-indigo-600 text-white font-medium hover:bg-indigo-700 rounded-lg transition-colors shadow-sm"
              >
                ОК
              </button>
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
};
