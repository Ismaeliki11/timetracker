import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import { dataService } from '../services/dataService';
import { useLocalization } from '../context/AppProviders';
import { Space, TimeEntry } from '../types';

const Profile: React.FC<{
    onImport?: (spaces: Space[], entries: TimeEntry[]) => Promise<void>;
}> = ({ onImport }) => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const { t } = useLocalization();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Profile State
    const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '');
    const [avatarUrl, setAvatarUrl] = useState(user?.user_metadata?.avatar_url || null);

    // Privacy / Danger Zone State
    const [deleteConfirm, setDeleteConfirm] = useState('');
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

    // Stats
    const [storageUsage, setStorageUsage] = useState<string>('--- KB');

    const fileInputRef = useRef<HTMLInputElement>(null);
    const importInputRef = useRef<HTMLInputElement>(null);

    // --- Profile Actions ---

    const handleUpdateProfile = async () => {
        setLoading(true);
        const { error } = await supabase.auth.updateUser({
            data: { full_name: fullName }
        });

        if (error) setMessage({ type: 'error', text: error.message });
        else setMessage({ type: 'success', text: 'Profile updated successfully!' });
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
        const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
            redirectTo: window.location.origin + '/reset-password',
        });
        if (error) setMessage({ type: 'error', text: error.message });
        else setMessage({ type: 'success', text: 'Reset link sent to your email.' });
        setLoading(false);
    };

    // --- Data Migration ---

    const calculateSize = async () => {
        try {
            const spaces = await dataService.getSpaces();
            const timeEntries = await dataService.getTimeEntries();
            const dataToExport = {
                metadata: { version: '1.0', exported_at: new Date().toISOString() },
                spaces, timeEntries
            };
            const jsonString = JSON.stringify(dataToExport, null, 2);
            // Calculate KB
            const kb = (new Blob([jsonString]).size / 1024).toFixed(2);
            setStorageUsage(`${kb} KB`);
        } catch (err) {
            console.error(err);
        }
    }

    const handleExportData = async () => {
        try {
            const spaces = await dataService.getSpaces();
            const timeEntries = await dataService.getTimeEntries();
            const dataToExport = {
                metadata: {
                    version: '1.0',
                    exported_at: new Date().toISOString(),
                    user_id: user?.id
                },
                spaces: spaces,
                timeEntries: timeEntries
            };

            const jsonString = JSON.stringify(dataToExport, null, 2);
            calculateSize(); // Update size display too

            const blob = new Blob([jsonString], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `timetracker_backup_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err: any) {
            setMessage({ type: 'error', text: "Failed to export data." });
        }
    };

    const handleImportData = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const json = JSON.parse(event.target?.result as string);
                if (!Array.isArray(json.spaces) || !Array.isArray(json.timeEntries)) {
                    throw new Error("Invalid file format");
                }
                setLoading(true);

                let count = 0;
                for (const s of json.spaces) {
                    const newId = Date.now().toString() + Math.random().toString(36).substr(2, 5);
                    const oldId = s.id;
                    await dataService.createSpace({ ...s, id: newId });
                    const spaceEntries = json.timeEntries.filter((te: any) => te.spaceId === oldId);
                    for (const te of spaceEntries) {
                        await dataService.createTimeEntry({ ...te, id: Date.now().toString() + Math.random().toString(36).substr(2, 9), spaceId: newId });
                    }
                    count++;
                }
                setMessage({ type: 'success', text: `Imported ${count} spaces successfully!` });
                setTimeout(() => window.location.reload(), 1500);
            } catch (err: any) {
                setMessage({ type: 'error', text: "Import failed: " + err.message });
            } finally {
                setLoading(false);
            }
        };
        reader.readAsText(file);
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirm !== 'DELETE') return;
        setLoading(true);
        try {
            const { error } = await supabase.rpc('delete_own_account');
            if (error) throw error;
            await signOut();
            navigate('/welcome');
        } catch (err: any) {
            setMessage({ type: 'error', text: "Could not delete account: " + err.message });
            setLoading(false);
            setDeleteModalOpen(false);
        }
    };

    return (
        <div className="flex flex-col h-[100dvh] bg-gradient-to-br from-slate-50 to-slate-200 dark:from-black dark:to-slate-900 text-slate-900 dark:text-gray-100 font-sans">
            {/* Header */}
            <div className="flex items-center justify-between p-6 px-8 sticky top-0 z-10 backdrop-blur-md bg-white/30 dark:bg-black/30 border-b border-white/20 dark:border-white/5">
                <button onClick={() => navigate(-1)} className="p-3 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-all text-slate-600 dark:text-slate-300">
                    <span className="material-symbols-outlined text-2xl">arrow_back</span>
                </button>
                <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-400">
                    Profile & Settings
                </h1>
                <button onClick={signOut} className="p-3 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-all" title="Log Out">
                    <span className="material-symbols-outlined text-2xl">logout</span>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col gap-6 max-w-2xl mx-auto w-full pb-32">

                {/* --- Profile Card --- */}
                <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/40 dark:border-white/5 p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                    {/* Decorative Blob */}
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="relative group cursor-pointer flex-shrink-0" onClick={() => fileInputRef.current?.click()}>
                        <div className="w-28 h-28 rounded-full shadow-2xl p-1 bg-gradient-to-br from-white to-slate-200 dark:from-slate-700 dark:to-slate-800">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                            ) : (
                                <div className="w-full h-full rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-4xl font-black text-slate-400">
                                    {fullName ? fullName[0].toUpperCase() : user?.email?.[0].toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                            <span className="material-symbols-outlined text-white text-3xl">edit_square</span>
                        </div>
                        <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleAvatarUpload} />
                    </div>

                    <div className="flex-1 w-full flex flex-col gap-4 text-center md:text-left">
                        <div>
                            <label className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-1 block">{t('display_name')}</label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={e => setFullName(e.target.value)}
                                className="w-full bg-transparent text-2xl md:text-3xl font-black text-slate-900 dark:text-white border-b-2 border-transparent hover:border-slate-200 focus:border-indigo-500 focus:outline-none transition-all py-1 text-center md:text-left"
                                placeholder="Your Name"
                            />
                        </div>
                        <div className="flex gap-2 justify-center md:justify-start">
                            <button onClick={handleUpdateProfile} disabled={loading} className="px-6 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black font-bold shadow-lg hover:transform hover:scale-105 transition-all text-sm">
                                {t('save_changes')}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* --- Security --- */}
                    <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/40 dark:border-white/5 p-6 rounded-3xl shadow-lg flex flex-col gap-4">
                        <h3 className="font-bold text-lg flex items-center gap-2 text-slate-700 dark:text-slate-200">
                            <span className="material-symbols-outlined text-emerald-500">security</span>
                            {t('security')}
                        </h3>
                        <button onClick={handleResetPassword} disabled={loading} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-black/20 hover:bg-white hover:shadow-md transition-all text-left group border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                            <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined">lock_reset</span>
                            </div>
                            <div>
                                <div className="font-bold text-slate-800 dark:text-slate-100">{t('reset_password_button')}</div>
                                <div className="text-xs text-slate-500">{t('send_recovery_link')}</div>
                            </div>
                        </button>
                    </div>

                    {/* --- Data --- */}
                    <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/40 dark:border-white/5 p-6 rounded-3xl shadow-lg flex flex-col gap-4">
                        <h3 className="font-bold text-lg flex items-center gap-2 text-slate-700 dark:text-slate-200">
                            <span className="material-symbols-outlined text-blue-500">database</span>
                            {t('data_migration')}
                        </h3>

                        <div className="flex gap-2">
                            <button onClick={handleExportData} className="flex-1 flex flex-col items-center justify-center p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/10 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all border border-blue-100 dark:border-blue-900/30 group">
                                <span className="material-symbols-outlined text-blue-500 text-3xl mb-2 group-hover:-translate-y-1 transition-transform">download</span>
                                <span className="font-bold text-blue-900 dark:text-blue-100 text-sm">{t('export_data')}</span>
                            </button>
                            <button onClick={() => importInputRef.current?.click()} className="flex-1 flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-slate-200 dark:border-slate-700 group">
                                <span className="material-symbols-outlined text-slate-500 text-3xl mb-2 group-hover:-translate-y-1 transition-transform">upload</span>
                                <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">{t('import_data')}</span>
                            </button>
                            <input type="file" ref={importInputRef} hidden accept=".json" onChange={handleImportData} />
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 dark:bg-white/5">
                            <span className="text-xs font-medium text-slate-500">{t('est_size')}: <span className="font-mono text-slate-700 dark:text-slate-300">{storageUsage}</span></span>
                            <button onClick={calculateSize} className="text-xs font-bold text-blue-500 hover:text-blue-600">{t('calculate')}</button>
                        </div>
                    </div>
                </div>

                {/* --- Danger Zone --- */}
                <div className="mt-4 p-1 rounded-3xl bg-gradient-to-r from-red-200 via-orange-200 to-red-200 dark:from-red-900/50 dark:via-orange-900/50 dark:to-red-900/50">
                    <div className="bg-white dark:bg-slate-900 rounded-[22px] p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full text-red-500">
                                <span className="material-symbols-outlined">warning</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-red-600 dark:text-red-400">{t('danger_zone')}</h3>
                                <p className="text-xs text-red-500/70">{t('irreversible_actions')}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setDeleteModalOpen(true)}
                            className="px-5 py-2.5 rounded-xl bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 font-bold text-sm hover:bg-red-500 hover:text-white transition-all shadow-sm"
                        >
                            {t('delete_account')}
                        </button>
                    </div>
                </div>

            </div>

            {/* Feedback Toast */}
            {message && (
                <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl shadow-2xl backdrop-blur-md border ${message.type === 'success' ? 'bg-emerald-500/90 border-emerald-400 text-white' : 'bg-red-500/90 border-red-400 text-white'} animate-fade-in z-50 font-bold flex items-center gap-3`}>
                    <span className="material-symbols-outlined">{message.type === 'success' ? 'check_circle' : 'error'}</span>
                    {message.text}
                </div>
            )}

            {/* Delete Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 scale-100 animate-slide-up">
                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center text-red-500 mb-4">
                                <span className="material-symbols-outlined text-3xl">delete_forever</span>
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{t('delete_account_title')}</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 leading-relaxed">
                                {t('delete_account_warning')} <br /><strong>{t('cannot_be_undone')}</strong>
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{t('type_delete_confirm')}</label>
                                <input
                                    type="text"
                                    className="w-full border-2 border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-slate-50 dark:bg-slate-800 font-bold text-center focus:border-red-500 focus:outline-none transition-colors"
                                    placeholder="DELETE"
                                    value={deleteConfirm}
                                    onChange={e => setDeleteConfirm(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setDeleteModalOpen(false)} className="flex-1 py-3 font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">{t('cancel')}</button>
                                <button
                                    onClick={handleDeleteAccount}
                                    disabled={deleteConfirm !== 'DELETE' || loading}
                                    className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed font-bold shadow-lg shadow-red-500/30 transition-all"
                                >
                                    {loading ? '...' : t('confirm')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
