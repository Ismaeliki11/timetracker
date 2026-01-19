import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useLocalization, useTheme } from '../context/AppProviders';
import { AuthLanguageSelector } from '../components/AuthLanguageSelector';
import { useAuth } from '../context/AuthContext';
import { mapAuthError } from '../utils/authErrors';

const UpdatePassword: React.FC = () => {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const navigate = useNavigate();
    const { t } = useLocalization();
    const { theme, toggleTheme } = useTheme();
    const { session } = useAuth(); // Used to check if we are authenticated (link provides session)

    // Optional: Redirect if no session? Ideally Supabase link logs user in. 
    // If accessed directly without session, they can't update password.

    useEffect(() => {
        // If we are not authenticated, we probably shouldn't be here, unless it's just loading.
        // But let's handle the update blindly, if session is missing supabase will fail or we can block it.
    }, [session]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        const { error } = await supabase.auth.updateUser({
            password: password
        });

        if (error) {
            setMessage({ type: 'error', text: t(mapAuthError(error.message)) });
            setLoading(false);
        } else {
            setMessage({ type: 'success', text: t('auth_password_updated') || "Password updated successfully!" });
            setLoading(false);
            // Redirect after short delay
            setTimeout(() => {
                navigate('/');
            }, 2000);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen p-4 bg-slate-100 dark:bg-black transition-colors duration-500">
            <div className="w-full max-w-[400px] bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/10 p-8 rounded-3xl shadow-xl dark:shadow-2xl flex flex-col gap-6 animate-fade-in relative z-10">

                <div className="flex justify-between items-start mb-2 gap-4">
                    <div className="flex flex-col items-start flex-1 min-w-0">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-50 dark:bg-[#202020] text-blue-600 dark:text-blue-500 mb-3 border border-slate-100 dark:border-white/5">
                            <span className="material-symbols-outlined text-2xl">password</span>
                        </div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">{t('auth_update_password_title') || "Set New Password"}</h1>
                        <p className="text-slate-500 dark:text-gray-400 font-medium text-xs mt-0.5 break-words">{t('auth_update_password_desc') || "Please enter your new password below."}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={toggleTheme}
                            aria-label="Toggle theme"
                            className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border border-slate-100 dark:border-white/5"
                        >
                            <span className="material-symbols-outlined text-lg">{theme === 'light' ? 'dark_mode' : 'light_mode'}</span>
                        </button>
                    </div>
                </div>

                {message && (
                    <div className={`px-4 py-3 rounded-xl text-sm font-medium animate-pulse flex items-center gap-2 ${message.type === 'error'
                        ? 'bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-700 dark:text-red-400'
                        : 'bg-green-50 dark:bg-green-500/10 border border-green-100 dark:border-green-500/20 text-green-700 dark:text-green-400'
                        }`} role="alert">
                        <span className="material-symbols-outlined text-lg">{message.type === 'error' ? 'error' : 'check_circle'}</span>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleUpdate} className="flex flex-col gap-4 mt-1">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider ml-1">{t('auth_new_password') || "New Password"}</label>
                        <div className="relative group">
                            <span className="absolute left-4 top-3.5 text-slate-400 dark:text-gray-500 material-symbols-outlined text-xl group-focus-within:text-blue-600 dark:group-focus-within:text-blue-500 transition-colors">lock</span>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                minLength={6}
                                className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-[#202020] border border-slate-200 dark:border-white/5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white transition-all font-medium placeholder:text-slate-400 dark:placeholder:text-gray-600"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-4 py-3.5 px-6 bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500 text-white font-bold text-base rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span> : <span>{t('auth_update_password') || "Update Password"}</span>}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UpdatePassword;
