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
        <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 md:p-8 lg:p-12 flex justify-center">
            <div className="w-full max-w-2xl lg:max-w-4xl flex flex-col">

                {/* Header Section */}
                <div className="pb-8 mb-8 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
                    <button
                        onClick={() => navigate(-1)}
                        className="mb-6 flex items-center text-sm font-medium text-primary hover:text-primary-focus transition-colors gap-2 group"
                    >
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <span className="material-symbols-outlined text-lg">arrow_back</span>
                        </div>
                        {t('back') || 'Back'}
                    </button>

                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
                        {title}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-4 font-mono uppercase tracking-widest opacity-80">
                        {t('last_updated') || 'Last Updated'}: {lastUpdated}
                    </p>
                </div>

                {/* Content Section */}
                <div className="flex-1 pb-20">
                    <div className="prose prose-slate dark:prose-invert prose-base md:prose-lg lg:prose-xl max-w-none 
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
        </div>
    );
};
