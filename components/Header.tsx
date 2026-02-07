import React, { useState } from 'react';
import { useTheme, useLocalization } from '../context/AppProviders';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export const Header: React.FC<{ onInfoClick: () => void, onProfileClick: () => void, isSyncing?: boolean, onSyncClick?: () => void }> = ({ onInfoClick, onProfileClick, isSyncing, onSyncClick }) => {
    const { theme, toggleTheme } = useTheme();
    const { user } = useAuth();
    const navigate = useNavigate();
    const { t } = useLocalization();

    // Get user initial or avatar
    const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || '?';
    const initial = displayName[0].toUpperCase();
    const avatarUrl = user?.user_metadata?.avatar_url;

    return (
        <header className="flex items-center justify-between p-2 h-16 flex-shrink-0">
            <div className="flex items-center gap-2">
                <button
                    onClick={onInfoClick}
                    aria-label="Show app information"
                    className="flex items-center justify-center rounded-full h-12 w-12 text-slate-900 dark:text-slate-200 glass-interactive">
                    <span className="material-symbols-outlined">info</span>
                </button>
                {onSyncClick && (
                    <button
                        onClick={onSyncClick}
                        disabled={isSyncing}
                        aria-label="Force synchronization"
                        className={`flex items-center justify-center rounded-full h-12 w-12 text-slate-900 dark:text-slate-200 glass-interactive transition-all ${isSyncing ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <span className={`material-symbols-outlined ${isSyncing ? 'animate-spin' : ''}`}>sync</span>
                    </button>
                )}
            </div>

            {/* Center - maybe Title? */}

            <div className="flex items-center gap-2">
                <button
                    onClick={toggleTheme}
                    aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                    className="flex items-center justify-center rounded-full h-12 w-12 text-slate-900 dark:text-slate-200 glass-interactive">
                    <span className="material-symbols-outlined">{theme === 'light' ? 'dark_mode' : 'light_mode'}</span>
                </button>
                {user ? (
                    <button
                        onClick={onProfileClick}
                        className="flex items-center justify-center rounded-full h-10 w-10 overflow-hidden ring-2 ring-transparent hover:ring-primary transition-all ml-1 shadow-md cursor-pointer"
                        title="Your Profile"
                    >
                        {avatarUrl ? (
                            <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 flex items-center justify-center font-bold text-lg">
                                {initial}
                            </div>
                        )}
                    </button>
                ) : (
                    // Just logout or login button? The app forces login for access now, so user is likely logged in if seeing this.
                    // But if we allow guests later, we can show login.
                    <button
                        onClick={() => navigate('/login')}
                        className="flex items-center justify-center rounded-full h-12 w-12 text-slate-900 dark:text-slate-200 glass-interactive"
                        title="Sign In"
                    >
                        <span className="material-symbols-outlined">login</span>
                    </button>
                )}
            </div>
        </header>
    );
};

export const InfoPanel: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const { language, setLanguage, t } = useLocalization();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-end justify-center animate-fade-in" onClick={onClose}>
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slide-up {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }
                .animate-fade-in { animation: fade-in 0.3s ease-out; }
                .animate-slide-up { animation: slide-up 0.3s ease-out; }
            `}</style>
            <div className="relative w-full max-w-md glass-pane rounded-t-xl shadow-lg flex flex-col p-6 animate-slide-up" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-center text-black dark:text-white mb-4">Time Tracker</h2>
                <p className="text-center text-slate-800 dark:text-slate-200 mb-6">{t('app_description')}</p>
                <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                    <p className="text-base font-medium text-slate-900 dark:text-gray-200 mb-3">{t('language')}</p>
                    <div className="flex justify-center p-1 rounded-lg bg-slate-100 dark:bg-slate-800">
                        <button onClick={() => setLanguage('en')} className={`px-4 py-1.5 rounded-md text-sm font-medium flex-1 transition-all ${language === 'en' ? 'bg-white dark:bg-slate-700 shadow' : 'text-slate-700 dark:text-slate-200'}`}>English</button>
                        <button onClick={() => setLanguage('es')} className={`px-4 py-1.5 rounded-md text-sm font-medium flex-1 transition-all ${language === 'es' ? 'bg-white dark:bg-slate-700 shadow' : 'text-slate-700 dark:text-slate-200'}`}>Español</button>
                    </div>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-700 mt-6 pt-4 flex flex-col gap-2 text-center">
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider mb-2">Legal</p>
                    <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm text-slate-600 dark:text-slate-400">
                        <Link to="/privacy" className="hover:text-primary hover:underline" onClick={onClose}>Privacy</Link>
                        <Link to="/terms" className="hover:text-primary hover:underline" onClick={onClose}>Terms</Link>
                        <Link to="/cookies" className="hover:text-primary hover:underline" onClick={onClose}>Cookies</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

