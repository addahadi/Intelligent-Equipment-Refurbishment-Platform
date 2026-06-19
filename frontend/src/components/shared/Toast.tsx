import { useEffect, useState } from 'react';
import { useApp } from '../../store/AppContext';
import { X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onDismiss: () => void;
}

export default function Toast({ message, type, onDismiss }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Entrance animation
    const enterTimer = requestAnimationFrame(() => setIsVisible(true));
    
    // Auto-dismiss after 4 seconds
    const closeTimer = setTimeout(() => {
      setIsClosing(true);
      setTimeout(onDismiss, 300); // Wait for exit animation
    }, 4000);

    return () => {
      cancelAnimationFrame(enterTimer);
      clearTimeout(closeTimer);
    };
  }, [onDismiss]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onDismiss, 300);
  };

  const isSuccess = type === 'success';
  const color = isSuccess ? '#1C7A62' : '#9C4A2C';

  return (
    <div
      role="alert"
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: `translateX(-50%) translateY(${isVisible && !isClosing ? '0' : '20px'})`,
        opacity: isVisible && !isClosing ? 1 : 0,
        transition: 'transform 300ms ease, opacity 300ms ease',
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E6E9',
        borderLeft: `4px solid ${color}`,
        borderRadius: '6px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        zIndex: 1000,
        minWidth: '300px',
        maxWidth: '90vw',
      }}
    >
      <div
        style={{
          fontFamily: "'IBM Plex Sans', sans-serif",
          fontSize: '14px',
          fontWeight: 500,
          color: color,
          flex: 1,
        }}
      >
        {message}
      </div>
      <button
        onClick={handleClose}
        aria-label="Fermer"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#6E7A80',
          transition: 'color 0.15s ease',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.color = '#18211F';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.color = '#6E7A80';
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const { toasts, dismissToast } = useApp();

  if (!toasts || toasts.length === 0) return null;

  const latestToast = toasts[toasts.length - 1];

  // Only success/error toasts match the UI spec described
  if (latestToast.type !== 'success' && latestToast.type !== 'error') {
    return null;
  }

  return (
    <Toast
      key={latestToast.id}
      message={latestToast.message}
      type={latestToast.type as 'success' | 'error'}
      onDismiss={() => dismissToast(latestToast.id)}
    />
  );
}