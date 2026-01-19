import React, { useState, useRef } from 'react';
import { Space, TimeEntry } from '../types';
import { useLocalization } from '../context/AppProviders';
import { dataService } from '../services/dataService';
import { useAuth } from '../context/AuthContext';
import { Modal } from './Modals';

interface MigrationModalProps {
    spaces: Space[];
    timeEntries: TimeEntry[];
    onClose: () => void;
}

const MigrationModal: React.FC<MigrationModalProps> = ({ spaces, timeEntries, onClose }) => {
    const { t } = useLocalization();
    const { user } = useAuth();
    const [selectedSpaceIds, setSelectedSpaceIds] = useState<Set<string>>(new Set());
    const [mode, setMode] = useState<'main' | 'select_export'>('main');
    const [importing, setImporting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const importInputRef = useRef<HTMLInputElement>(null);

    const toggleSpace = (id: string) => {
        const newSet = new Set(selectedSpaceIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedSpaceIds(newSet);
    };

    const handleExport = (subsetSpaces?: Space[]) => {
        try {
            const spacesToExport = subsetSpaces || spaces;
            const spaceIds = new Set(spacesToExport.map(s => s.id));
            const entriesToExport = timeEntries.filter(e => spaceIds.has(e.spaceId));

            const data = {
                metadata: {
                    version: '1.0',
                    exported_at: new Date().toISOString(),
                    user_id: user?.id
                },
                spaces: spacesToExport,
                timeEntries: entriesToExport
            };

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `timetracker_backup_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setMessage({ type: 'success', text: 'Export successful' });
        } catch (e: any) {
            setMessage({ type: 'error', text: 'Export failed' });
        }
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const json = JSON.parse(event.target?.result as string);
                if (!Array.isArray(json.spaces)) throw new Error("Invalid format: missing spaces");

                setImporting(true);
                let count = 0;

                // Process
                for (const s of json.spaces) {
                    const newId = Date.now().toString() + Math.random().toString(36).substr(2, 5);
                    const oldId = s.id;

                    await dataService.createSpace({ ...s, id: newId });

                    const relatedEntries = json.timeEntries?.filter((te: any) => te.spaceId === oldId) || [];
                    for (const te of relatedEntries) {
                        await dataService.createTimeEntry({
                            ...te,
                            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                            spaceId: newId
                        });
                    }
                    count++;
                }

                setMessage({ type: 'success', text: `Imported ${count} spaces.` });
                setTimeout(() => window.location.reload(), 1500);
            } catch (err: any) {
                setMessage({ type: 'error', text: "Import Error: " + err.message });
                setImporting(false);
            }
        };
        reader.readAsText(file);
    };

    return (
        <div style={{ zIndex: 60 }} className="fixed inset-0 flex items-center justify-center">
            {/* Wrapper to handle z-index override or stacking context */}
            <Modal onClose={onClose}>
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-500">database</span>
                        {t('data_migration')}
                    </h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                        <span className="material-symbols-outlined text-slate-900 dark:text-white">close</span>
                    </button>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto max-h-[80vh]">
                    {message && (
                        <div className={`p-3 rounded-lg text-sm font-bold text-center ${message.type === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                            {message.text}
                        </div>
                    )}

                    {mode === 'main' ? (
                        <div className="space-y-4">
                            {/* Card 1: Export All */}
                            <button onClick={() => handleExport()} className="w-full text-left group">
                                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-500/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                                        <span className="material-symbols-outlined">upload</span>
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-slate-800 dark:text-white">{t('export_all')}</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Download complete JSON backup</p>
                                    </div>
                                </div>
                            </button>

                            {/* Card 2: Export Selection */}
                            <button onClick={() => setMode('select_export')} className="w-full text-left group">
                                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-500/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                                        <span className="material-symbols-outlined">checklist</span>
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-slate-800 dark:text-white">{t('export_selected')}</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Choose specific spaces to export</p>
                                    </div>
                                </div>
                            </button>

                            {/* Card 3: Import */}
                            <button onClick={() => importInputRef.current?.click()} className="w-full text-left group">
                                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-purple-500/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                                        <span className="material-symbols-outlined">download</span>
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-slate-800 dark:text-white">{t('import_spaces')}</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Restore from JSON file</p>
                                    </div>
                                </div>
                                <input type="file" ref={importInputRef} hidden accept=".json" onChange={handleImport} />
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <button onClick={() => setMode('main')} className="text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">arrow_back</span> Back
                                </button>
                                <span className="text-xs text-slate-400">| Select Spaces</span>
                            </div>

                            <div className="max-h-60 overflow-y-auto space-y-2 pr-2 scrollable-content">
                                {spaces.map(s => (
                                    <div key={s.id} onClick={() => toggleSpace(s.id)} className={`p-3 rounded-lg border cursor-pointer flex items-center gap-3 transition-colors ${selectedSpaceIds.has(s.id) ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-200 dark:border-slate-700'}`}>
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center ${selectedSpaceIds.has(s.id) ? 'bg-indigo-500 border-indigo-500' : 'border-slate-300 dark:border-slate-600'}`}>
                                            {selectedSpaceIds.has(s.id) && <span className="material-symbols-outlined text-white text-xs">check</span>}
                                        </div>
                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{s.name}</span>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => handleExport(spaces.filter(s => selectedSpaceIds.has(s.id)))}
                                disabled={selectedSpaceIds.size === 0}
                                className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl disabled:opacity-50 hover:bg-indigo-700 shadow-lg"
                            >
                                Export {selectedSpaceIds.size} Spaces
                            </button>
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
};

export default MigrationModal;
