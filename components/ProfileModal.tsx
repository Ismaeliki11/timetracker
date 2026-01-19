import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import { useLocalization, useDateFormat } from '../context/AppProviders';
import { Modal } from './Modals';

interface ProfileModalProps {
    onClose: () => void;
    onOpenMigration: () => void;
}

// Internal Sub-Modal for Password Reset Confirmation
const PasswordResetModal: React.FC<{ onClose: () => void; onConfirm: () => void; loading: boolean; message: { type: 'success' | 'error', text: string } | null }> = ({ onClose, onConfirm, loading, message }) => {
    const { t } = useLocalization();

    return (
        <Modal onClose={onClose}>
            <div className="p-6">
                <h2 className="text-xl font-bold text-center text-slate-800 dark:text-white mb-4">{t('change_password')}</h2>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl mb-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-800 mx-auto flex items-center justify-center mb-3">
                        <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">mark_email_read</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                        {t('send_recovery_link')}? <br />
                        <span className="text-xs opacity-70">A recovery link will be sent to your email.</span>
                    </p>
                </div>

                {message && (
                    <div className={`mb-4 p-3 rounded-lg text-sm font-bold text-center animate-fade-in ${message.type === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {message.text}
                    </div>
                )}

                <div className="flex gap-4">
                    <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                        {t('cancel')}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading || (message?.type === 'success')} // Disable if already sent successfully
                        className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all"
                    >
                        {loading ? 'Sending...' : (message?.type === 'success' ? 'Sent' : 'Confirm')}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

const ProfileModal: React.FC<ProfileModalProps> = ({ onClose, onOpenMigration }) => {
    const { user, signOut } = useAuth();
    const { t, language, setLanguage } = useLocalization();
    const { dateFormat, toggleDateFormat } = useDateFormat();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Profile State
    const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '');
    const [avatarUrl, setAvatarUrl] = useState(user?.user_metadata?.avatar_url || null);

    // Modal States
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Danger Zone State
    const [deleteConfirm, setDeleteConfirm] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- Actions ---

    const handleUpdateProfile = async () => {
        setLoading(true);
        const { error } = await supabase.auth.updateUser({
            data: { full_name: fullName }
        });

        if (error) setMessage({ type: 'error', text: error.message });
        else setMessage({ type: 'success', text: t('profile_updated') });
        setLoading(false);
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        setLoading(true);
        const file = e.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user?.id}/${fileName}`;

        try {
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            const { error: updateError } = await supabase.auth.updateUser({
                data: { avatar_url: publicUrl }
            });
            if (updateError) throw updateError;

            setAvatarUrl(publicUrl);
            setMessage({ type: 'success', text: 'Avatar updated!' });
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!user?.email) return;
        setLoading(true);
        setPasswordMessage(null); // Clear previous messages

        const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
            redirectTo: window.location.origin + '/reset-password',
        });

        if (error) setPasswordMessage({ type: 'error', text: error.message });
        else {
            setPasswordMessage({ type: 'success', text: 'Mensaje enviado correctamente' });
            // Optionally close after a delay? Or let user close.
        }
        setLoading(false);
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirm !== 'DELETE') return;
        setLoading(true);
        try {
            const { error } = await supabase.rpc('delete_own_account');
            if (error) throw error;
            await signOut();
            window.location.href = '/login';
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
            setLoading(false);
        }
    };

    return (
        <>
            <Modal onClose={onClose}>
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-center text-black dark:text-white">{t('profile')}</h2>
                </div>

                <div className="flex flex-col gap-6 px-6 max-h-[60vh] overflow-y-auto scrollable-content">

                    {/* Avatar Section */}
                    <div className="flex flex-col items-center gap-3">
                        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <div className="w-24 h-24 rounded-full shadow-lg bg-slate-100 dark:bg-slate-800 overflow-hidden ring-4 ring-slate-50 dark:ring-slate-700/50">
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-slate-400">
                                        {fullName ? fullName[0]?.toUpperCase() : user?.email?.[0]?.toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="material-symbols-outlined text-white">edit</span>
                            </div>
                            <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleAvatarUpload} />
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
                    </div>

                    {/* Name Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-800 dark:text-gray-300">{t('display_name')}</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                className="form-input flex h-12 w-full rounded-lg border bg-slate-100 px-4 text-base placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-gray-400"
                                value={fullName}
                                onChange={e => setFullName(e.target.value)}
                            />
                            <button
                                onClick={handleUpdateProfile}
                                disabled={loading || fullName === user?.user_metadata?.full_name}
                                className="h-12 w-12 flex items-center justify-center rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <span className="material-symbols-outlined">save</span>
                            </button>
                        </div>
                    </div>

                    {/* Preferences */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-800 dark:text-gray-300">{t('language')}</label>
                            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                                <button
                                    onClick={() => setLanguage('es')}
                                    className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${language === 'es' ? 'bg-white dark:bg-slate-700 shadow text-primary' : 'text-slate-500 dark:text-slate-400'}`}
                                >
                                    ES
                                </button>
                                <button
                                    onClick={() => setLanguage('en')}
                                    className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${language === 'en' ? 'bg-white dark:bg-slate-700 shadow text-primary' : 'text-slate-500 dark:text-slate-400'}`}
                                >
                                    EN
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-800 dark:text-gray-300">{t('date_format')}</label>
                            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                                <button
                                    onClick={toggleDateFormat}
                                    className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${dateFormat === 'DD/MM/YYYY' ? 'bg-white dark:bg-slate-700 shadow text-primary' : 'text-slate-500 dark:text-slate-400'}`}
                                >
                                    {t('fmt_ddmm')}
                                </button>
                                <button
                                    onClick={toggleDateFormat}
                                    className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${dateFormat === 'MM/DD/YYYY' ? 'bg-white dark:bg-slate-700 shadow text-primary' : 'text-slate-500 dark:text-slate-400'}`}
                                >
                                    {t('fmt_mmdd')}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                        <p className="text-sm font-medium text-slate-800 dark:text-gray-300">{t('options')}</p>

                        <button
                            onClick={() => { setPasswordMessage(null); setShowPasswordModal(true); }}
                            className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-slate-400 group-hover:text-primary">lock_reset</span>
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{t('change_password')}</span>
                            </div>
                            <span className="material-symbols-outlined text-slate-400 text-sm">arrow_forward</span>
                        </button>

                        <button
                            onClick={onOpenMigration}
                            className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-slate-400 group-hover:text-primary">database</span>
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{t('data_migration')}</span>
                            </div>
                            <span className="material-symbols-outlined text-slate-400 text-sm">arrow_forward</span>
                        </button>
                    </div>

                    {/* Danger Zone */}
                    <div className="pt-2 space-y-3">
                        <button
                            onClick={async () => {
                                onClose();
                                await signOut();
                            }}
                            className="w-full py-3 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            Log Out
                        </button>

                        {!showDeleteConfirm ? (
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="w-full py-3 rounded-lg text-red-500 text-sm font-bold hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                            >
                                {t('delete_account')}
                            </button>
                        ) : (
                            <div className="p-4 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10 space-y-3 animate-fade-in text-center">
                                <p className="text-xs text-red-600 dark:text-red-400 font-bold">Type "DELETE" to confirm.</p>
                                <input
                                    type="text"
                                    className="w-full text-center p-2 rounded bg-white dark:bg-black/20 text-sm font-bold border border-red-200 dark:border-red-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                                    value={deleteConfirm}
                                    onChange={e => setDeleteConfirm(e.target.value)}
                                    placeholder="DELETE"
                                    autoFocus
                                />
                                <div className="flex gap-2 justify-center">
                                    <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-white/50 rounded-lg">Cancel</button>
                                    <button
                                        onClick={handleDeleteAccount}
                                        disabled={deleteConfirm !== 'DELETE'}
                                        className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50 shadow-sm"
                                    >
                                        CONFIRM
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                    {message && (
                        <div className={`p-3 rounded-lg text-sm font-bold text-center ${message.type === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                            {message.text}
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-end p-4 mt-4 border-t border-slate-200 dark:border-slate-700">
                    <button onClick={onClose} className="flex items-center justify-center rounded-lg h-12 px-6 bg-slate-200 dark:bg-slate-700 text-black dark:text-gray-200 text-base font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
                        {t('close')}
                    </button>
                </div>
            </Modal>

            {/* Password Reset Modal */}
            {showPasswordModal && (
                <PasswordResetModal
                    onClose={() => setShowPasswordModal(false)}
                    onConfirm={handleResetPassword}
                    loading={loading}
                    message={passwordMessage}
                />
            )}
        </>
    );
};

export default ProfileModal;
