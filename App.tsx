import React, { useState, useMemo, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Outlet, useParams, Navigate, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import type { Space, TimeEntry } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useLocalization } from './context/AppProviders';
import { SpaceModal, LogTimeModal, ConfirmModal, DetailsModal } from './components/Modals';
import ProfileModal from './components/ProfileModal';
import MigrationModal from './components/MigrationModal';
import FinancialCalculatorModal from './components/FinancialCalculatorModal';
import CalendarView from './components/CalendarView';
import StatisticsView from './components/StatisticsView';
import { formatDateToYMD } from './utils/formatters';
import { Header, InfoPanel } from './components/Header';
import { ProtectedRoute } from './components/ProtectedRoute'; // Kept for reference or specific protected routes if needed later

// --- Auth Redirect Helper ---
const AuthRedirect: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  if (user) return <Navigate to="/spaces" replace />;
  return <>{children}</>;
};

// Services & Context
import { useAuth } from './context/AuthContext';
import { useNotification } from './context/NotificationContext';
import { dataService } from './services/dataService';
import { useDataSync } from './hooks/useDataSync';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Welcome from './pages/Welcome';
import Spaces from './pages/Spaces';
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';
import EmailConfirmed from './pages/EmailConfirmed';
import UpdatePassword from './pages/UpdatePassword';

// --- Redirector Component ---
const Redirector = ({ spaces }: { spaces: Space[] }) => {
  const navigate = useNavigate();
  useEffect(() => {
    if (spaces.length === 0) navigate('/welcome', { replace: true });
    else navigate('/spaces', { replace: true });
  }, [spaces, navigate]);
  return null;
}

// --- Wrapper Components ---
const CalendarWrapper: React.FC<{
  spaces: Space[],
  timeEntries: TimeEntry[],
  onLogTime: (d: Date) => void,
  onEditEntry: (e: TimeEntry) => void,
  onDeleteEntry: (id: string) => void,
  onViewDetails: (e: TimeEntry) => void
}> = ({ spaces, timeEntries, onLogTime, onEditEntry, onDeleteEntry, onViewDetails }) => {
  const { spaceId } = useParams();
  const navigate = useNavigate();
  const space = spaces.find(s => s.id === spaceId);

  // optimize: filter entries here 
  const entries = useMemo(() =>
    timeEntries.filter(e => e.spaceId === spaceId),
    [timeEntries, spaceId]);

  if (!space) return <div className="p-4 glass-pane text-center mt-10">Space not found</div>;

  return <CalendarView
    space={space}
    entries={entries}
    onGoBack={() => navigate('/spaces')}
    onLogTime={onLogTime}
    onEditEntry={onEditEntry}
    onDeleteEntry={onDeleteEntry}
    onViewDetails={onViewDetails}
    onGoToStatistics={() => navigate('stats')}
  />
};

const StatisticsWrapper: React.FC<{ spaces: Space[], timeEntries: TimeEntry[] }> = ({ spaces, timeEntries }) => {
  const { spaceId } = useParams();
  const navigate = useNavigate();
  const space = spaces.find(s => s.id === spaceId);

  const entries = useMemo(() =>
    timeEntries.filter(e => e.spaceId === spaceId),
    [timeEntries, spaceId]);

  if (!space) return <div className="p-4 glass-pane text-center mt-10">Space not found</div>;

  return <StatisticsView
    space={space}
    entries={entries}
    onGoBack={() => navigate(-1)}
  />
}

// --- Main Layout with Logic ---
const MainLayoutWithModals = ({ spaces, setSpaces, timeEntries, setTimeEntries, t }: any) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { notify } = useNotification();

  // --- LOGOUT CLEANUP ---
  // If user transitions from Logged In -> Logged Out (null), clear the dashboard.
  // We use a ref to track if we were previously logged in to differentiate initial load vs logout.
  // However, simple check: if !user but we have data that MIGHT be user data (not verified guest data), purge?
  // Safer approach for now per specs: User clicks logout -> AuthContext nulls user.
  // We detect user is null here.
  useEffect(() => {
    // Only clear if we actually have data to clear? 
    // Or just strictly enforce: No user = No data visible (Privacy first)
    // UNLESS we want to support "Keep local data". 
    // BUT spec says: "It must be impossible for a logged-out user to still see account-owned data".
    // AND "Guest State: ... spaces and entries are stored in localStorage ONLY".

    // To distinguish "Logout" from "First Load as Guest":
    // The trick is: When you logout, you want to reset to a blank slate OR keep local data?
    // User requirement: "Cerrar sesión debe... Mostrar la app como 'sin sesión'. Quitar los espacios..."
    // This implies a RESET.

    // We can't easily distinguish "App Load (Guest)" vs "Logout (Guest)" without extra state.
    // However, if we assume Logout forces a reload or we react to the transition.

    // Let's use a previousUser ref to detect the TRANSITION.
  }, [user]);

  // Actually, let's implement the previousUser logic in the MainLayout? 
  // No, MainLayoutWithModals is re-rendered.

  const prevUserRef = React.useRef(user);

  useEffect(() => {
    // If we HAD a user, and now we DON'T (Logout happened)
    if (prevUserRef.current && !user) {
      setSpaces([]);
      setTimeEntries([]);
      // Clear LocalStorage explicitly to prevent re-hydration of old user data
      window.localStorage.removeItem('spaces');
      window.localStorage.removeItem('timeEntries');
      window.localStorage.removeItem('known_synced_spaces');
      window.localStorage.removeItem('known_synced_entries');
      notify(t('logged_out_success'), 'info');
    }
    prevUserRef.current = user;
  }, [user, setSpaces, setTimeEntries, notify, t]);


  // Sync Hook: Handles initial migration/download on login
  const { isSyncing, syncNow } = useDataSync(spaces, setSpaces, timeEntries, setTimeEntries);

  const [isInfoPanelOpen, setInfoPanelOpen] = useState(false);

  // Network Status Monitor
  useEffect(() => {
    const handleOnline = () => notify(t('info_network_online'), 'info');
    const handleOffline = () => notify(t('error_network_offline'), 'error');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [notify, t]);


  // Modal States from URL
  const modal = searchParams.get('modal');
  const entryIdParam = searchParams.get('entryId');

  // Internal State for Modals
  const [editingSpace, setEditingSpace] = useState<Space | null>(null);
  const [logDate, setLogDate] = useState(new Date());
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  const [viewingEntry, setViewingEntry] = useState<TimeEntry | null>(null);
  const [confirmState, setConfirmState] = useState<{ isOpen: boolean, title: string, message: string, onConfirm: () => void }>({ isOpen: false, title: '', message: '', onConfirm: () => { } });

  const currentPathSpaceId = location.pathname.match(/\/space\/([^\/]+)/)?.[1];

  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    const relevantEntries = currentPathSpaceId
      ? timeEntries.filter((e: TimeEntry) => e.spaceId === currentPathSpaceId)
      : timeEntries;

    relevantEntries.forEach((entry: TimeEntry) => {
      entry.tags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [timeEntries, currentPathSpaceId]);


  // -- Modal Helpers --
  const closeModal = () => {
    setSearchParams(params => {
      const newParams = new URLSearchParams(params);
      newParams.delete('modal');
      newParams.delete('entryId');
      return newParams;
    });
    setEditingSpace(null);
    setEditingEntry(null);
    setViewingEntry(null);
  };

  const openModal = (name: string, extra?: any) => {
    setSearchParams(params => {
      const newParams = new URLSearchParams(params);
      newParams.set('modal', name);
      if (extra?.entryId) newParams.set('entryId', extra.entryId);
      return newParams;
    });
  }

  // -- Handler Implementations --
  const handleSaveSpace = async (data: any, id?: string) => {
    const newSpace = id ? { ...data, id } : { ...data, id: crypto.randomUUID() };

    // Optimistic Update
    if (id) {
      setSpaces(spaces.map((s: Space) => s.id === id ? { ...s, ...data } : s));
    } else {
      setSpaces([...spaces, newSpace]);
    }

    // Cloud Sync
    if (user) {
      try {
        if (id) await dataService.updateSpace(id, data);
        else await dataService.createSpace(newSpace);
      } catch (err) {
        console.error("Cloud save failed", err);
        notify(t('error_save_failed'), 'error');
      }
    }

    closeModal();
  }

  const handleDeleteSpace = (id: string, name: string) => {
    setConfirmState({
      isOpen: true,
      title: t('delete_space'),
      message: t('delete_space_confirm', { spaceName: name }),
      onConfirm: async () => {
        setSpaces(spaces.filter((s: Space) => s.id !== id));
        setTimeEntries(timeEntries.filter((t: TimeEntry) => t.spaceId !== id));

        if (user) {
          try {
            await dataService.deleteSpace(id);
          } catch (err) {
            console.error(err);
            notify(t('error_save_failed'), 'error');
          }
        }

        setConfirmState(prev => ({ ...prev, isOpen: false }));
      }
    });
  }

  const handleSaveTimeEntry = async (data: any, id?: string) => {
    let newEntry: TimeEntry;

    if (id) {
      const old = timeEntries.find((e: TimeEntry) => e.id === id);
      if (old) {
        newEntry = { ...old, ...data };
        setTimeEntries(timeEntries.map((e: TimeEntry) => e.id === id ? newEntry : e));
      } else { return; }
    } else {
      if (currentPathSpaceId) {
        newEntry = {
          ...data,
          id: crypto.randomUUID(),
          spaceId: currentPathSpaceId,
          date: formatDateToYMD(logDate)
        };
        setTimeEntries([...timeEntries, newEntry]);
      } else {
        console.error("Cannot create entry without space context");
        return;
      }
    }

    if (user) {
      try {
        if (id) await dataService.updateTimeEntry(id, newEntry);
        // fix: updateTimeEntry expects partial, safe to pass full entry as updates? yes mostly, except keys like 'id'.
        // dataService.updateTimeEntry implementation extracts keys, so safely passing 'newEntry' works as long as 'id' matches arg1.
        else await dataService.createTimeEntry(newEntry);
      } catch (err) {
        console.error(err);
        notify(t('error_save_failed'), 'error');
      }
    }

    closeModal();
  }

  const handleDeleteEntry = (id: string) => {
    setConfirmState({
      isOpen: true,
      title: t('delete_entry'),
      message: t('delete_entry_confirm'),
      onConfirm: async () => {
        setTimeEntries(timeEntries.filter((e: TimeEntry) => e.id !== id));

        if (user) {
          try {
            await dataService.deleteTimeEntry(id);
          } catch (err) {
            console.error(err);
            notify(t('error_save_failed'), 'error');
          }
        }

        setConfirmState(prev => ({ ...prev, isOpen: false }));
      }
    });
  }

  // Sync View Logic
  useEffect(() => {
    if (modal === 'details' && entryIdParam) {
      const e = timeEntries.find((t: TimeEntry) => t.id === entryIdParam);
      if (e) setViewingEntry(e);
    }
  }, [modal, entryIdParam, timeEntries]);

  const showHeader = ['/welcome', '/spaces'].includes(location.pathname);

  return (
    <div className="relative mx-auto flex w-full max-w-md flex-col text-slate-900 dark:text-slate-100 overflow-hidden bg-white/50 dark:bg-black/20" style={{ height: '100dvh' }}>
      {showHeader && (
        <Header
          onInfoClick={() => setInfoPanelOpen(true)}
          onProfileClick={() => openModal('profile')}
          isSyncing={isSyncing}
          onSyncClick={syncNow}
        />
      )}

      <div className="flex-1 scrollable-content touch-pan-y overflow-y-auto">
        <Routes>
          <Route index element={<Redirector spaces={spaces} />} />
          <Route path="*" element={<Redirector spaces={spaces} />} />
          <Route path="/welcome" element={<Welcome onNavigate={() => navigate('/spaces?modal=createSpace')} />} />
          <Route path="/spaces" element={
            <Spaces
              spaces={spaces}
              timeEntries={timeEntries}
              onSelectSpace={(id) => navigate(`/space/${id}`)}
              onCreateSpace={() => { setEditingSpace(null); openModal('createSpace'); }}
              onEditSpace={(s) => { setEditingSpace(s); openModal('createSpace'); }}
              onDeleteSpace={handleDeleteSpace}
            />
          } />
          <Route path="/space/:spaceId" element={
            <CalendarWrapper
              spaces={spaces}
              timeEntries={timeEntries}
              onLogTime={(date) => { setLogDate(date); setEditingEntry(null); openModal('logTime'); }}
              onEditEntry={(e) => { setLogDate(new Date(e.date + 'T12:00')); setEditingEntry(e); openModal('logTime'); }}
              onDeleteEntry={(id) => handleDeleteEntry(id)}
              onViewDetails={(e) => { openModal('details', { entryId: e.id }); }}
            />
          } />
          <Route path="/space/:spaceId/stats" element={<StatisticsWrapper spaces={spaces} timeEntries={timeEntries} />} />
        </Routes>
      </div>

      {/* Global Modals overlaying the content */}
      {modal === 'createSpace' && (
        <SpaceModal
          onClose={closeModal}
          onSave={handleSaveSpace}
          spaceToEdit={editingSpace}
        />
      )}
      {modal === 'logTime' && (
        <LogTimeModal
          date={logDate}
          onClose={closeModal}
          onSave={handleSaveTimeEntry}
          entryToEdit={editingEntry}
          availableTags={availableTags}
        />
      )}
      {modal === 'details' && viewingEntry && (
        <DetailsModal
          entry={viewingEntry}
          spaceColor={spaces.find((s: Space) => s.id === viewingEntry.spaceId)?.color}
          spaceName={spaces.find((s: Space) => s.id === viewingEntry.spaceId)?.name}
          onClose={closeModal}
        />
      )}
      {modal === 'profile' && (
        <ProfileModal
          onClose={closeModal}
          onOpenMigration={() => openModal('migration')}
        />
      )}
      {modal === 'migration' && (
        <MigrationModal
          spaces={spaces}
          timeEntries={timeEntries}
          setSpaces={setSpaces}
          setTimeEntries={setTimeEntries}
          onClose={() => openModal('profile')} // Back to profile or close? User said "separate panel". Back makes sense flow-wise.
        />
      )}
      {modal === 'calculator' && (
        <FinancialCalculatorModal
          entries={timeEntries}
          onClose={closeModal}
        />
      )}
      {confirmState.isOpen && (
        <ConfirmModal
          title={confirmState.title}
          message={confirmState.message}
          onConfirm={confirmState.onConfirm}
          onClose={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
        />
      )}
      <InfoPanel isOpen={isInfoPanelOpen} onClose={() => setInfoPanelOpen(false)} />
    </div>
  )
}

const App: React.FC = () => {
  const { t } = useLocalization();
  // State management (Temporary before moving to Supabase completely)
  const [spaces, setSpaces] = useLocalStorage<Space[]>('spaces', []);
  const [timeEntries, setTimeEntries] = useLocalStorage<TimeEntry[]>('timeEntries', []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AuthRedirect><Login /></AuthRedirect>} />
        <Route path="/register" element={<AuthRedirect><Register /></AuthRedirect>} />
        <Route path="/recovery" element={<AuthRedirect><ForgotPassword /></AuthRedirect>} />
        <Route path="/email-confirmed" element={<EmailConfirmed />} />
        <Route path="/update-password" element={<UpdatePassword />} />

        {/* Public Routes (formerly protected) */}
        <Route path="/*" element={
          <MainLayoutWithModals
            spaces={spaces}
            setSpaces={setSpaces}
            timeEntries={timeEntries}
            setTimeEntries={setTimeEntries}
            t={t}
          />
        } />
      </Routes>
    </BrowserRouter>
  );
};

export default App;