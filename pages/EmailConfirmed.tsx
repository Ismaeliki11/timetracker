import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLocalization, useTheme } from '../context/AppProviders';
import { useAuth } from '../context/AuthContext';

const EmailConfirmed: React.FC = () => {
    const { t } = useLocalization();
    const { theme } = useTheme(); // Just for consistent hook usage if needed, though mostly using CSS classes
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    // If loading (processing hash), show a spinner or wait
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-black">
                <span className="material-symbols-outlined animate-spin text-4xl text-blue-600 dark:text-blue-500">progress_activity</span>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen p-4 bg-slate-100 dark:bg-black transition-colors duration-500">
            <div className="w-full max-w-[400px] bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/10 p-8 rounded-3xl shadow-xl dark:shadow-2xl flex flex-col gap-6 animate-fade-in text-center relative z-10">

                <div className="flex justify-center mb-2">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 mb-3 animate-bounce-short">
                        <span className="material-symbols-outlined text-5xl">mark_email_read</span>
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{t('auth_email_verified_title') || "Email Verified!"}</h1>
                    <p className="text-slate-500 dark:text-gray-400 font-medium text-base">
                        {t('auth_email_verified_desc') || "Your email has been successfully verified. You can now access all features of TimeTracker."}
                    </p>
                </div>

                <div className="flex flex-col gap-4 mt-4">
                    <Link to={user ? "/spaces" : "/login"} className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500 text-white font-bold text-lg rounded-xl transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 group">
                        <span>{user ? (t('auth_continue_app') || "Continue to App") : (t('auth_sign_in_now') || "Sign In Now")}</span>
                        <span className="material-symbols-outlined text-xl group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default EmailConfirmed;
