import React, { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
    message: string;
    type: ToastType;
    onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
    // Auto-close after 4 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);

    let bgClass = '';
    let icon = '';

    switch (type) {
        case 'success':
            bgClass = 'bg-green-500 text-white';
            icon = 'check_circle';
            break;
        case 'error':
            bgClass = 'bg-red-500 text-white';
            icon = 'error';
            break;
        case 'info':
        default:
            bgClass = 'bg-blue-500 text-white';
            icon = 'info';
            break;
    }

    return (
        <div className={`pointer-events-auto flex w-full max-w-md overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 transition-all animate-slide-up ${bgClass}`}>
            <div className="p-4 flex items-start">
                <div className="flex-shrink-0">
                    <span className="material-symbols-outlined">{icon}</span>
                </div>
                <div className="ml-3 flex-1 min-w-0">
                    <p className="text-sm font-medium leading-5 break-words">{message}</p>
                </div>
                <div className="ml-4 flex flex-shrink-0">
                    <button
                        type="button"
                        className="inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 hover:bg-white/20"
                        onClick={onClose}
                    >
                        <span className="sr-only">Close</span>
                        <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                </div>
            </div>
            <style>{`
                @keyframes slide-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-slide-up { animation: slide-up 0.3s ease-out; }
            `}</style>
        </div>
    );
};
