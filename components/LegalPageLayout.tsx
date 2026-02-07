import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocalization } from '../context/AppProviders';

interface LegalPageLayoutProps {
    title: string;
    lastUpdated: string;
    children: React.ReactNode;
}

export const LegalPageLayout: React.FC<LegalPageLayoutProps> = ({ title, lastUpdated, children }) => {
    const navigate = useNavigate();
    const { t } = useLocalization();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-4 md:p-8 flex justify-center">
            <div className="w-full max-w-2xl bg-white/80 dark:bg-black/40 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 dark:border-white/10 overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header Section */}
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 flex-shrink-0">
                    <button
                        onClick={() => navigate(-1)}
                        className="mb-4 flex items-center text-sm font-medium text-primary hover:text-primary-focus transition-colors gap-2 group"
                    >
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <span className="material-symbols-outlined text-lg">arrow_back</span>
                        </div>
                        {t('back') || 'Back'}
                    </button>

                    <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
                        {title}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-2 font-mono uppercase tracking-wider opacity-70">
                        {t('last_updated') || 'Last Updated'}: {lastUpdated}
                    </p>
                </div>

                {/* Content Section - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                    <div className="prose prose-slate dark:prose-invert prose-sm md:prose-base max-w-none 
                        prose-headings:font-bold prose-headings:text-slate-900 dark:prose-headings:text-slate-100
                        prose-p:text-slate-600 dark:prose-p:text-slate-300 prose-p:leading-relaxed
                        prose-a:text-primary hover:prose-a:text-primary-focus prose-a:transition-colors
                        prose-strong:text-slate-800 dark:prose-strong:text-slate-200
                        prose-ul:list-disc prose-ul:pl-5
                        prose-li:marker:text-primary prose-li:text-slate-600 dark:prose-li:text-slate-300">
                        {children}
                    </div>
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: rgba(156, 163, 175, 0.3);
                    border-radius: 20px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background-color: rgba(156, 163, 175, 0.5);
                }
            `}</style>
        </div>
    );
};
