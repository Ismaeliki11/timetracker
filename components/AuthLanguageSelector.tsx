import React from 'react';
import { useLocalization } from '../context/AppProviders';

export const AuthLanguageSelector: React.FC = () => {
    const { language, setLanguage } = useLocalization();

    return (
        <div className="flex bg-white/50 dark:bg-black/20 rounded-xl p-1 backdrop-blur-md border border-white/20 dark:border-white/5">
            <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${language === 'en'
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
            >
                EN
            </button>
            <button
                onClick={() => setLanguage('es')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${language === 'es'
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
            >
                ES
            </button>
        </div>
    );
};
