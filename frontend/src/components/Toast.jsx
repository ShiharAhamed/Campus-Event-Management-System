import { useEffect, useState } from 'react';

let addToast;

export const toast = {
  success: (msg) => addToast?.({ msg, type: 'success', icon: '✅' }),
  error: (msg) => addToast?.({ msg, type: 'error', icon: '❌' }),
  info: (msg) => addToast?.({ msg, type: 'info', icon: 'ℹ️' }),
};

const Toast = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    addToast = ({ msg, type, icon }) => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, msg, type, icon }]);
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
    };
  }, []);

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type}`}>
          <span className="toast-icon">{t.icon}</span>
          <span className="toast-msg">{t.msg}</span>
        </div>
      ))}
    </div>
  );
};

export default Toast;
