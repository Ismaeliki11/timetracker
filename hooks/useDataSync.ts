import { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocalization } from '../context/AppProviders';
import { useNotification } from '../context/NotificationContext';
import { dataService } from '../services/dataService';
import { Space, TimeEntry } from '../types';

const KNOWN_SYNCED_SPACES_KEY = 'known_synced_spaces';
const KNOWN_SYNCED_ENTRIES_KEY = 'known_synced_entries';

export const useDataSync = (
    localSpaces: Space[],
    setLocalSpaces: (s: Space[]) => void,
    localEntries: TimeEntry[],
    setLocalEntries: (e: TimeEntry[]) => void
) => {
    const { user } = useAuth();
    const { t } = useLocalization();
    const { notify } = useNotification();
    const [isSyncing, setIsSyncing] = useState(false);

    // Track if we have performed the initial sync on mount/login
    const hasInitialSynced = useRef(false);

    const getKnownIds = useCallback((key: string): Set<string> => {
        try {
            const stored = localStorage.getItem(key);
            return stored ? new Set(JSON.parse(stored)) : new Set();
        } catch {
            return new Set();
        }
    }, []);

    const saveKnownIds = useCallback((key: string, ids: Set<string>) => {
        localStorage.setItem(key, JSON.stringify(Array.from(ids)));
    }, []);

    const syncNow = useCallback(async () => {
        if (!user || isSyncing) return;

        setIsSyncing(true);
        console.log("[Sync] Starting Cloud Sync...");

        try {
            if (!navigator.onLine) {
                notify(t('error_network_offline'), 'error');
                setIsSyncing(false);
                return;
            }

            // --- SPACES SYNC ---
            const cloudSpaces = await dataService.getSpaces();
            const cloudSpaceIds = new Set(cloudSpaces.map(s => s.id));
            const knownSyncedSpaces = getKnownIds(KNOWN_SYNCED_SPACES_KEY);

            // 1. Identify Deletions (Present Locally, Known to be Synced, Missing in Cloud)
            // SAFETY: On initial sync (Guest -> User transition), we MUST NOT delete local data based on 'known' keys
            // because 'known' keys might be stale or from a previous session if not cleared properly.
            // We treat initial sync as a "Union" merge: Keep local, fetch cloud.
            const effectiveKnownSpaces = hasInitialSynced.current ? knownSyncedSpaces : new Set<string>();

            const localSpacesToDelete = localSpaces.filter(
                s => effectiveKnownSpaces.has(s.id) && !cloudSpaceIds.has(s.id)
            );

            // 2. Identify New Local Items (Present Locally, NOT Known to be Synced, Missing in Cloud)
            const spacesToUpload = localSpaces.filter(
                s => !effectiveKnownSpaces.has(s.id) && !cloudSpaceIds.has(s.id)
            );

            // Execute Side Effects
            if (localSpacesToDelete.length > 0) {
                console.log(`[Sync] Deleting ${localSpacesToDelete.length} spaces locally (deleted on cloud).`);
                // Filters are applied at the end
            }

            if (spacesToUpload.length > 0) {
                console.log(`[Sync] Uploading ${spacesToUpload.length} new spaces.`);
                await Promise.all(spacesToUpload.map(s => dataService.upsertSpace(s)));
            }

            // 3. Construct Final State
            const finalSpaces = [...cloudSpaces, ...spacesToUpload];

            // Update Known IDs for next time (Current Cloud + What we added)
            const newKnownSpaceIds = new Set(finalSpaces.map(s => s.id));
            saveKnownIds(KNOWN_SYNCED_SPACES_KEY, newKnownSpaceIds);

            setLocalSpaces(finalSpaces);


            // --- ENTRIES SYNC ---
            const cloudEntries = await dataService.getTimeEntries();
            const cloudEntryIds = new Set(cloudEntries.map(e => e.id));
            const knownSyncedEntries = getKnownIds(KNOWN_SYNCED_ENTRIES_KEY);
            const effectiveKnownEntries = hasInitialSynced.current ? knownSyncedEntries : new Set<string>();

            const localEntriesToDelete = localEntries.filter(
                e => effectiveKnownEntries.has(e.id) && !cloudEntryIds.has(e.id)
            );

            const entriesToUpload = localEntries.filter(
                e => !effectiveKnownEntries.has(e.id) && !cloudEntryIds.has(e.id)
            );

            if (localEntriesToDelete.length > 0) {
                console.log(`[Sync] Deleting ${localEntriesToDelete.length} entries locally.`);
            }

            if (entriesToUpload.length > 0) {
                console.log(`[Sync] Uploading ${entriesToUpload.length} new entries.`);
                await Promise.all(entriesToUpload.map(e => dataService.upsertTimeEntry(e)));
            }

            // Final List
            const finalEntries = [...cloudEntries, ...entriesToUpload];
            // Sort
            finalEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            const newKnownEntryIds = new Set(finalEntries.map(e => e.id));
            saveKnownIds(KNOWN_SYNCED_ENTRIES_KEY, newKnownEntryIds);

            setLocalEntries(finalEntries);

            notify(t('success_sync_complete'), 'success');
            console.log("[Sync] Complete.");
        } catch (error) {
            console.error("[Sync] Error:", error);
            notify(t('error_sync_failed'), 'error');
        } finally {
            setIsSyncing(false);
        }
    }, [user, isSyncing, localSpaces, localEntries, setLocalSpaces, setLocalEntries, notify, t, saveKnownIds, getKnownIds]);

    // Initial Sync on Mount/Login + Focus/Interval
    useEffect(() => {
        if (user && !hasInitialSynced.current) {
            hasInitialSynced.current = true;
            syncNow();
        } else if (!user) {
            hasInitialSynced.current = false;
        }

        // Auto-sync on Tab Focus (Multi-device interoperability)
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && user) {
                syncNow();
            }
        };

        // Periodic Sync Every 5 Minutes
        const interval = setInterval(() => {
            if (user) syncNow();
        }, 5 * 60 * 1000);

        window.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleVisibilityChange);

        return () => {
            window.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleVisibilityChange);
            clearInterval(interval);
        };
    }, [user, syncNow]);

    return { isSyncing, syncNow };
};
