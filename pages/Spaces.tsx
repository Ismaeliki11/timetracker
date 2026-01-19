import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Space, TimeEntry } from '../types';
import { useLocalization } from '../context/AppProviders';
import { useAuth } from '../context/AuthContext';
import { getWelcomeMessageKey } from '../utils/welcomeMessages';

// Helper for formatting duration
const formatDurationFromHours = (hours: number): string => {
    if (isNaN(hours) || hours < 0) {
        return "0:00";
    }
    const totalMinutes = Math.round(hours * 60);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h}:${String(m).padStart(2, '0')}`;
};

interface SpacesScreenProps {
    spaces: Space[];
    timeEntries: TimeEntry[];
    onSelectSpace: (id: string) => void;
    onCreateSpace: () => void;
    onEditSpace: (space: Space) => void;
    onDeleteSpace: (id: string, name: string) => void;
}


const Spaces: React.FC<SpacesScreenProps> = ({ spaces, timeEntries, onSelectSpace, onCreateSpace, onEditSpace, onDeleteSpace }) => {
    const { t } = useLocalization();
    const { user } = useAuth();

    const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || '';

    // Select a key based on whether user is logged in (!!user)
    // Dependencies: user state change should trigger re-calc
    // FIX: If user is present (!!user is true), isGuest should be FALSE.
    // So we must pass !user.
    const messageKey = useMemo(() => getWelcomeMessageKey(!user), [!!user]);

    // Translate the message. If it's a guest key, 'name' param is ignored by the string content anyway.
    // If it's a user key, 'name' is used.
    const welcomeMessage = t(messageKey, { name: displayName });

    const totalHoursBySpace = useMemo(() => {
        const totals: { [key: string]: number } = {};
        spaces.forEach(space => totals[space.id] = 0);
        timeEntries.forEach(entry => {
            if (totals[entry.spaceId] !== undefined) {
                totals[entry.spaceId] += entry.duration;
            }
        });
        return totals;
    }, [spaces, timeEntries]);

    return (
        <main className="flex-1 px-4 pt-4">
            <h1 className="tracking-tight text-3xl font-bold pt-6 pb-2 text-black dark:text-white">{welcomeMessage}</h1>
            <p className="text-slate-600 dark:text-gray-300 text-base font-normal pb-3 pt-1">{t('select_space_prompt')}</p>
            <div className="grid grid-cols-1 gap-3 pt-6">
                {spaces.map(space => (
                    <SpaceItem
                        key={space.id}
                        space={space}
                        totalHours={totalHoursBySpace[space.id]}
                        onSelect={() => onSelectSpace(space.id)}
                        onEdit={() => onEditSpace(space)}
                        onDelete={() => onDeleteSpace(space.id, space.name)}
                    />
                ))}
                <div onClick={onCreateSpace} className="flex items-center rounded-xl p-4 text-center mt-4 cursor-pointer glass-interactive">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-slate-200 dark:bg-slate-700">
                        <span className="material-symbols-outlined text-slate-800 dark:text-gray-300">add</span>
                    </div>
                    <div className="ml-4">
                        <h4 className="text-base font-bold text-black dark:text-gray-200 text-left">{t('create_new_space')}</h4>
                    </div>
                </div>
            </div>
        </main>
    );
};

interface SpaceItemProps {
    space: Space;
    totalHours: number;
    onSelect: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

const SpaceItem: React.FC<SpaceItemProps> = ({ space, totalHours, onSelect, onEdit, onDelete }) => {
    const { t } = useLocalization();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className={`relative flex items-center rounded-xl p-4 transition-all glass-pane ${menuOpen ? 'z-10' : ''}`}>
            <div onClick={onSelect} className="flex items-center flex-1 cursor-pointer min-w-0">
                <div className={`flex-shrink-0 size-10 rounded-lg ${space.color} flex items-center justify-center shadow-md`}>
                    {space.icon && <span className="material-symbols-outlined text-white">{space.icon}</span>}
                </div>
                <div className="ml-4 flex-1 min-w-0">
                    <h4 className="text-base font-bold truncate text-black dark:text-white">{space.name}</h4>
                    <p className="text-sm text-slate-600 dark:text-gray-400">{`${formatDurationFromHours(totalHours)} ${t('tracked')}`}</p>
                </div>
                <span className="material-symbols-outlined text-slate-500 dark:text-gray-400 text-lg ml-2">arrow_forward_ios</span>
            </div>
            <div className="relative ml-2" ref={menuRef}>
                <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-full glass-interactive" aria-label={t('options')}>
                    <span className="material-symbols-outlined text-slate-700 dark:text-slate-300">more_vert</span>
                </button>
                {menuOpen && (
                    <div className="absolute right-0 mt-2 w-32 glass-pane rounded-lg shadow-xl z-50">
                        <button onClick={() => { onEdit(); setMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-black dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-t-lg">{t('edit')}</button>
                        <button onClick={() => { onDelete(); setMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-red-500 dark:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-b-lg">{t('delete')}</button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Spaces;

