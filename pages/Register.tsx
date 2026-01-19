import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import PrivacyPolicyModal from '../components/PrivacyPolicyModal';
import { useLocalization, useTheme } from '../context/AppProviders';
import { AuthLanguageSelector } from '../components/AuthLanguageSelector';
import { mapAuthError } from '../utils/authErrors';

const Register: React.FC = () => {
    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);
    const navigate = useNavigate();
    const { t } = useLocalization();
    const { theme, toggleTheme } = useTheme();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError(t('passwords_mismatch'));
            return;
        }

        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                },
                emailRedirectTo: `${window.location.origin}/email-confirmed`,
            },
        });

        if (error) {
            setError(t(mapAuthError(error.message)));
            setLoading(false);
        } else {
            // Successful signup
            navigate('/');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen p-4 bg-slate-100 dark:bg-black transition-colors duration-500">
            <div className="w-full max-w-[440px] bg-white dark:bg-[#121212] border border-slate-200 dark:border-white/10 p-8 rounded-3xl shadow-xl dark:shadow-2xl flex flex-col gap-6 animate-fade-in relative z-10">

                {/* Header: Logo/Title + Controls */}
                <div className="flex justify-between items-start mb-2 gap-4">
                    {/* Left: Branding */}
                    <div className="flex flex-col items-start flex-1 min-w-0">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-50 dark:bg-[#202020] text-blue-600 dark:text-blue-500 mb-3 border border-slate-100 dark:border-white/5">
                            <span className="material-symbols-outlined text-2xl">person_add</span>
                        </div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight">Time Tracker</h1>
                        <p className="text-slate-500 dark:text-gray-400 font-medium text-xs mt-0.5 break-words">{t('auth_join_subtitle')}</p>
                    </div>

                    {/* Right: Controls */}
                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={toggleTheme}
                            aria-label="Toggle theme"
                            className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border border-slate-100 dark:border-white/5"
                        >
                            <span className="material-symbols-outlined text-lg">{theme === 'light' ? 'dark_mode' : 'light_mode'}</span>
                        </button>
                        <AuthLanguageSelector />
                    </div>
                </div>

                {/* Cloud Upload Notice */}
                <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-xl p-3.5 text-sm text-blue-700 dark:text-blue-400">
                    <div className="flex gap-3">
                        <span className="material-symbols-outlined text-blue-600 dark:text-blue-500">cloud_upload</span>
                        <div className="flex-1">
                            <p className="font-bold mb-0.5 text-xs uppercase tracking-wider text-blue-700 dark:text-blue-400">{t('auth_keep_safe')}</p>
                            <p className="opacity-90 dark:opacity-80 text-xs">{t('auth_keep_safe_desc')}</p>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm font-medium animate-pulse flex items-center gap-2" role="alert">
                        <span className="material-symbols-outlined text-lg">error</span>
                        {error}
                    </div>
                )}

                <form onSubmit={handleRegister} className="flex flex-col gap-4">

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider ml-1">{t('auth_full_name')}</label>
                        <div className="relative group">
                            <span className="absolute left-4 top-3 text-slate-400 dark:text-gray-500 material-symbols-outlined text-xl group-focus-within:text-blue-600 dark:group-focus-within:text-blue-500 transition-colors">badge</span>
                            <input
                                id="fullName"
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-[#202020] border border-slate-200 dark:border-white/5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white transition-all font-medium placeholder:text-slate-400 dark:placeholder:text-gray-600"
                                placeholder={t('your_name')}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider ml-1">{t('auth_email')}</label>
                        <div className="relative group">
                            <span className="absolute left-4 top-3 text-slate-400 dark:text-gray-500 material-symbols-outlined text-xl group-focus-within:text-blue-600 dark:group-focus-within:text-blue-500 transition-colors">mail</span>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-[#202020] border border-slate-200 dark:border-white/5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white transition-all font-medium placeholder:text-slate-400 dark:placeholder:text-gray-600"
                                placeholder="name@example.com"
                                required
                            />
                        </div>
                    </div>

                    {/* Stacked Password Fields */}
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider ml-1">{t('auth_password')}</label>
                            <div className="relative group">
                                <span className="absolute left-4 top-3 text-slate-400 dark:text-gray-500 material-symbols-outlined text-xl group-focus-within:text-blue-600 dark:group-focus-within:text-blue-500 transition-colors">lock</span>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-[#202020] border border-slate-200 dark:border-white/5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white transition-all font-medium placeholder:text-slate-400 dark:placeholder:text-gray-600"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider ml-1">{t('auth_confirm_password')}</label>
                            <div className="relative group">
                                <span className="absolute left-4 top-3 text-slate-400 dark:text-gray-500 material-symbols-outlined text-xl group-focus-within:text-blue-600 dark:group-focus-within:text-blue-500 transition-colors">lock_reset</span>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-[#202020] border border-slate-200 dark:border-white/5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white transition-all font-medium placeholder:text-slate-400 dark:placeholder:text-gray-600"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 px-1 py-1 mt-1">
                        <input
                            id="privacy"
                            type="checkbox"
                            required
                            className="w-5 h-5 mt-0.5 rounded border-slate-300 dark:border-gray-600 bg-slate-100 dark:bg-[#202020] text-blue-600 focus:ring-blue-500 focus:ring-offset-white dark:focus:ring-offset-gray-900 cursor-pointer accent-blue-600"
                        />
                        <label htmlFor="privacy" className="text-sm font-medium text-slate-500 dark:text-gray-400 cursor-pointer select-none leading-snug">
                            {t('auth_privacy_accept_pre')} <button type="button" onClick={() => setShowPrivacyModal(true)} className="text-blue-600 dark:text-blue-500 font-bold hover:underline hover:text-blue-500 dark:hover:text-blue-400">{t('auth_privacy_policy')}</button> {t('auth_privacy_accept_post')}
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-2 py-3.5 px-6 bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500 text-white font-bold text-base rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span> : <span>{t('auth_create_account')}</span>}
                    </button>
                </form>

                <div className="text-center pt-2">
                    <p className="text-sm text-slate-500 dark:text-gray-500 font-medium">
                        {t('auth_already_have_account')}{' '}
                        <Link to="/login" className="font-bold text-blue-600 dark:text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 hover:underline">
                            {t('auth_sign_in')}
                        </Link>
                    </p>
                </div>
            </div>

            <PrivacyPolicyModal isOpen={showPrivacyModal} onClose={() => setShowPrivacyModal(false)} />
        </div>
    );
};

export default Register;
