import React, { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { Route, Routes, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import type { Space, TimeEntry } from '../types';
import { useLocalization } from '../context/AppProviders';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useDataSync } from '../hooks/useDataSync';
import { useIsDesktop } from '../hooks/useIsDesktop';
import { dataService } from '../services/dataService';
import { formatDateToYMD } from '../utils/formatters';
import { generateUUID } from '../utils/uuid';
import { Header, InfoPanel } from '../components/Header';
import DesktopSidebar from '../components/desktop/DesktopSidebar';
import { OverlayLoader, SectionLoader } from '../components/LoadingFallback';

const SpaceModal = lazy(() => import('../components/Modals').then((module) => ({ default: module.SpaceModal })));
const LogTimeModal = lazy(() => import('../components/Modals').then((module) => ({ default: module.LogTimeModal })));
const ConfirmModal = lazy(() => import('../components/Modals').then((module) => ({ default: module.ConfirmModal })));
const DetailsModal = lazy(() => import('../components/Modals').then((module) => ({ default: module.DetailsModal })));
const ProfileModal = lazy(() => import('../components/ProfileModal'));
const MigrationModal = lazy(() => import('../components/MigrationModal'));
const FinancialCalculatorModal = lazy(() => import('../components/FinancialCalculatorModal'));
const LabelsModal = lazy(() => import('../components/LabelsModal'));
const CalendarView = lazy(() => import('../components/CalendarView'));
const StatisticsView = lazy(() => import('../components/StatisticsView'));
const DesktopSpaces = lazy(() => import('../components/desktop/DesktopSpaces'));
const DesktopCalendar = lazy(() => import('../components/desktop/DesktopCalendar'));
const DesktopStatistics = lazy(() => import('../components/desktop/DesktopStatistics'));
const Welcome = lazy(() => import('../pages/Welcome'));
const SpacesView = lazy(() => import('../pages/Spaces'));

interface AppShellProps {
  spaces: Space[];
  setSpaces: React.Dispatch<React.SetStateAction<Space[]>>;
  timeEntries: TimeEntry[];
  setTimeEntries: React.Dispatch<React.SetStateAction<TimeEntry[]>>;
}

const renderWithSuspense = (node: React.ReactNode, fallback: React.ReactNode = <SectionLoader />) => (
  <Suspense fallback={fallback}>{node}</Suspense>
);

const Redirector: React.FC<{ spaces: Space[] }> = ({ spaces }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (spaces.length === 0) {
      navigate('/welcome', { replace: true });
    } else {
      navigate('/spaces', { replace: true });
    }
  }, [spaces, navigate]);

  return null;
};

const DesktopCalendarWrapper: React.FC<{
  spaces: Space[];
  timeEntries: TimeEntry[];
  onLogTime: (date: Date) => void;
  onEditEntry: (entry: TimeEntry) => void;
  onDeleteEntry: (id: string) => void;
  onViewDetails: (entry: TimeEntry) => void;
  onOpenLabels: () => void;
}> = ({ spaces, timeEntries, onLogTime, onEditEntry, onDeleteEntry, onViewDetails, onOpenLabels }) => {
  const { spaceId } = useParams();
  const navigate = useNavigate();
  const space = spaces.find((item) => item.id === spaceId);
  const entries = useMemo(() => timeEntries.filter((entry) => entry.spaceId === spaceId), [timeEntries, spaceId]);

  if (!space) {
    return <div className="flex h-full items-center justify-center text-slate-500">Space not found</div>;
  }

  return renderWithSuspense(
    <DesktopCalendar
      space={space}
      entries={entries}
      onLogTime={onLogTime}
      onEditEntry={onEditEntry}
      onDeleteEntry={onDeleteEntry}
      onViewDetails={onViewDetails}
      onGoToStatistics={() => navigate(`/space/${spaceId}/stats`)}
      onOpenLabels={onOpenLabels}
    />,
  );
};

const DesktopStatisticsWrapper: React.FC<{ spaces: Space[]; timeEntries: TimeEntry[] }> = ({ spaces, timeEntries }) => {
  const { spaceId } = useParams();
  const space = spaces.find((item) => item.id === spaceId);
  const entries = useMemo(() => timeEntries.filter((entry) => entry.spaceId === spaceId), [timeEntries, spaceId]);

  if (!space) {
    return <div className="flex h-full items-center justify-center text-slate-500">Space not found</div>;
  }

  return renderWithSuspense(<DesktopStatistics space={space} entries={entries} />);
};

const CalendarWrapper: React.FC<{
  spaces: Space[];
  timeEntries: TimeEntry[];
  onLogTime: (date: Date) => void;
  onEditEntry: (entry: TimeEntry) => void;
  onDeleteEntry: (id: string) => void;
  onViewDetails: (entry: TimeEntry) => void;
  onOpenLabels: () => void;
}> = ({ spaces, timeEntries, onLogTime, onEditEntry, onDeleteEntry, onViewDetails, onOpenLabels }) => {
  const { spaceId } = useParams();
  const navigate = useNavigate();
  const space = spaces.find((item) => item.id === spaceId);
  const entries = useMemo(() => timeEntries.filter((entry) => entry.spaceId === spaceId), [timeEntries, spaceId]);

  if (!space) {
    return <div className="mt-10 p-4 text-center glass-pane">Space not found</div>;
  }

  return renderWithSuspense(
    <CalendarView
      space={space}
      entries={entries}
      onGoBack={() => navigate('/spaces')}
      onLogTime={onLogTime}
      onEditEntry={onEditEntry}
      onDeleteEntry={onDeleteEntry}
      onViewDetails={onViewDetails}
      onGoToStatistics={() => navigate('stats')}
      onOpenLabels={onOpenLabels}
    />,
  );
};

const StatisticsWrapper: React.FC<{ spaces: Space[]; timeEntries: TimeEntry[] }> = ({ spaces, timeEntries }) => {
  const { spaceId } = useParams();
  const navigate = useNavigate();
  const space = spaces.find((item) => item.id === spaceId);
  const entries = useMemo(() => timeEntries.filter((entry) => entry.spaceId === spaceId), [timeEntries, spaceId]);

  if (!space) {
    return <div className="mt-10 p-4 text-center glass-pane">Space not found</div>;
  }

  return renderWithSuspense(<StatisticsView space={space} entries={entries} onGoBack={() => navigate(-1)} />);
};

const AppShell: React.FC<AppShellProps> = ({ spaces, setSpaces, timeEntries, setTimeEntries }) => {
  const { t } = useLocalization();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { notify } = useNotification();
  const prevUserRef = React.useRef(user);

  useEffect(() => {
    if (prevUserRef.current && !user) {
      setSpaces([]);
      setTimeEntries([]);
      window.localStorage.removeItem('spaces');
      window.localStorage.removeItem('timeEntries');
      window.localStorage.removeItem('known_synced_spaces');
      window.localStorage.removeItem('known_synced_entries');
      notify(t('logged_out_success'), 'info');
    }

    prevUserRef.current = user;
  }, [notify, setSpaces, setTimeEntries, t, user]);

  const { isSyncing, syncNow } = useDataSync(spaces, setSpaces, timeEntries, setTimeEntries);

  const [isInfoPanelOpen, setInfoPanelOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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

  const modal = searchParams.get('modal');
  const entryIdParam = searchParams.get('entryId');

  const [editingSpace, setEditingSpace] = useState<Space | null>(null);
  const [logDate, setLogDate] = useState(new Date());
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  const [viewingEntry, setViewingEntry] = useState<TimeEntry | null>(null);
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const currentPathSpaceId = location.pathname.match(/\/space\/([^/]+)/)?.[1];

  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    const relevantEntries = currentPathSpaceId
      ? timeEntries.filter((entry) => entry.spaceId === currentPathSpaceId)
      : timeEntries;

    relevantEntries.forEach((entry) => {
      entry.tags?.forEach((tag) => tags.add(tag));
    });

    return Array.from(tags).sort();
  }, [currentPathSpaceId, timeEntries]);

  const closeModal = () => {
    setSearchParams((params) => {
      const nextParams = new URLSearchParams(params);
      nextParams.delete('modal');
      nextParams.delete('entryId');
      return nextParams;
    });
    setEditingSpace(null);
    setEditingEntry(null);
    setViewingEntry(null);
  };

  const openModal = (name: string, extra?: { entryId?: string }) => {
    setSearchParams((params) => {
      const nextParams = new URLSearchParams(params);
      nextParams.set('modal', name);
      if (extra?.entryId) {
        nextParams.set('entryId', extra.entryId);
      }
      return nextParams;
    });
  };

  const handleSaveSpace = async (data: Omit<Space, 'id'>, id?: string) => {
    const newSpace = id ? { ...data, id } : { ...data, id: generateUUID() };

    if (id) {
      setSpaces(spaces.map((space) => (space.id === id ? { ...space, ...data } : space)));
    } else {
      setSpaces([...spaces, newSpace]);
    }

    if (user) {
      try {
        if (id) {
          await dataService.updateSpace(id, data);
        } else {
          await dataService.createSpace(newSpace);
        }
      } catch (error) {
        console.error('Cloud save failed', error);
        notify(t('error_save_failed'), 'error');
      }
    }

    closeModal();
  };

  const handleDeleteSpace = (id: string, name: string) => {
    setConfirmState({
      isOpen: true,
      title: t('delete_space'),
      message: t('delete_space_confirm', { spaceName: name }),
      onConfirm: async () => {
        setSpaces(spaces.filter((space) => space.id !== id));
        setTimeEntries(timeEntries.filter((entry) => entry.spaceId !== id));

        if (user) {
          try {
            await dataService.deleteSpace(id);
          } catch (error) {
            console.error(error);
            notify(t('error_save_failed'), 'error');
          }
        }

        setConfirmState((previous) => ({ ...previous, isOpen: false }));
      },
    });
  };

  const handleSaveTimeEntry = async (data: Partial<TimeEntry>, id?: string) => {
    let newEntry: TimeEntry;

    if (id) {
      const oldEntry = timeEntries.find((entry) => entry.id === id);

      if (!oldEntry) {
        return;
      }

      newEntry = { ...oldEntry, ...data } as TimeEntry;
      setTimeEntries(timeEntries.map((entry) => (entry.id === id ? newEntry : entry)));
    } else {
      if (!currentPathSpaceId) {
        console.error('Cannot create entry without space context');
        return;
      }

      newEntry = {
        ...(data as Omit<TimeEntry, 'id' | 'spaceId' | 'date'>),
        id: generateUUID(),
        spaceId: currentPathSpaceId,
        date: formatDateToYMD(logDate),
      };
      setTimeEntries([...timeEntries, newEntry]);
    }

    if (user) {
      try {
        if (id) {
          await dataService.updateTimeEntry(id, newEntry);
        } else {
          await dataService.createTimeEntry(newEntry);
        }
      } catch (error) {
        console.error(error);
        notify(t('error_save_failed'), 'error');
      }
    }

    closeModal();
  };

  const handleDeleteEntry = (id: string) => {
    setConfirmState({
      isOpen: true,
      title: t('delete_entry'),
      message: t('delete_entry_confirm'),
      onConfirm: async () => {
        setTimeEntries(timeEntries.filter((entry) => entry.id !== id));

        if (user) {
          try {
            await dataService.deleteTimeEntry(id);
          } catch (error) {
            console.error(error);
            notify(t('error_save_failed'), 'error');
          }
        }

        setConfirmState((previous) => ({ ...previous, isOpen: false }));
      },
    });
  };

  const handleRenameTag = async (oldTag: string, newTag: string) => {
    if (!currentPathSpaceId) {
      return;
    }

    const updatedEntries = timeEntries.map((entry) => {
      if (entry.spaceId !== currentPathSpaceId || !entry.tags?.includes(oldTag)) {
        return entry;
      }

      return { ...entry, tags: entry.tags.map((tag) => (tag === oldTag ? newTag : tag)) };
    });

    setTimeEntries(updatedEntries);

    if (user) {
      try {
        const affectedEntries = updatedEntries.filter(
          (entry) => entry.spaceId === currentPathSpaceId && entry.tags?.includes(newTag),
        );
        await Promise.all(affectedEntries.map((entry) => dataService.updateTimeEntry(entry.id, entry)));
      } catch (error) {
        console.error(error);
        notify(t('error_save_failed'), 'error');
      }
    }
  };

  const handleDeleteTag = async (tag: string) => {
    if (!currentPathSpaceId) {
      return;
    }

    const affectedEntries = timeEntries.filter(
      (entry) => entry.spaceId === currentPathSpaceId && entry.tags?.includes(tag),
    );

    const updatedEntries = timeEntries.map((entry) => {
      if (entry.spaceId !== currentPathSpaceId || !entry.tags?.includes(tag)) {
        return entry;
      }

      return { ...entry, tags: entry.tags.filter((item) => item !== tag) };
    });

    setTimeEntries(updatedEntries);

    if (user) {
      try {
        const updatedAffectedEntries = updatedEntries.filter((entry) =>
          affectedEntries.some((affectedEntry) => affectedEntry.id === entry.id),
        );
        await Promise.all(updatedAffectedEntries.map((entry) => dataService.updateTimeEntry(entry.id, entry)));
      } catch (error) {
        console.error(error);
        notify(t('error_save_failed'), 'error');
      }
    }
  };

  const handleBulkTag = async (entryIds: string[], tag: string, action: 'add' | 'remove') => {
    const entryIdSet = new Set(entryIds);

    const applyChange = (entry: TimeEntry): TimeEntry => {
      if (!entryIdSet.has(entry.id)) {
        return entry;
      }

      const currentTags = entry.tags ?? [];

      if (action === 'add') {
        return currentTags.includes(tag) ? entry : { ...entry, tags: [...currentTags, tag] };
      }

      return { ...entry, tags: currentTags.filter((item) => item !== tag) };
    };

    setTimeEntries((previousEntries) => previousEntries.map(applyChange));

    if (user) {
      try {
        const affectedEntries = timeEntries.filter((entry) => entryIdSet.has(entry.id)).map(applyChange);
        await Promise.all(affectedEntries.map((entry) => dataService.updateTimeEntry(entry.id, entry)));
      } catch (error) {
        console.error(error);
        notify(t('error_save_failed'), 'error');
      }
    }
  };

  const handleFinishEntry = async (entry: TimeEntry) => {
    const now = new Date();
    const endTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const startTime = new Date(`1970-01-01T${entry.startTime}:00`);
    const finishTime = new Date(`1970-01-01T${endTime}:00`);
    let finalDuration = 0;

    if (finishTime > startTime) {
      finalDuration = (finishTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    }

    const updatedEntry = {
      ...entry,
      endTime,
      duration: finalDuration || 0.01,
      isOngoing: false,
    };

    setTimeEntries(timeEntries.map((item) => (item.id === entry.id ? updatedEntry : item)));

    if (user) {
      try {
        await dataService.updateTimeEntry(entry.id, updatedEntry);
      } catch (error) {
        console.error(error);
        notify(t('error_save_failed'), 'error');
      }
    }
  };

  useEffect(() => {
    if (modal === 'details' && entryIdParam) {
      const entry = timeEntries.find((item) => item.id === entryIdParam);
      if (entry) {
        setViewingEntry(entry);
      }
    }
  }, [entryIdParam, modal, timeEntries]);

  const isDesktop = useIsDesktop();
  const activeSpaceId = location.pathname.match(/\/space\/([^/]+)/)?.[1];
  const activeSpace = spaces.find((space) => space.id === activeSpaceId);
  const isStatsPath = location.pathname.endsWith('/stats');

  const handlers = {
    onCreateSpace: () => {
      setEditingSpace(null);
      openModal('createSpace');
    },
    onEditSpace: (space: Space) => {
      setEditingSpace(space);
      openModal('createSpace');
    },
    onDeleteSpace: handleDeleteSpace,
    onLogTime: (date: Date) => {
      setLogDate(date);
      setEditingEntry(null);
      openModal('logTime');
    },
    onEditEntry: (entry: TimeEntry) => {
      setLogDate(new Date(`${entry.date}T12:00`));
      setEditingEntry(entry);
      openModal('logTime');
    },
    onDeleteEntry: (id: string) => handleDeleteEntry(id),
    onViewDetails: (entry: TimeEntry) => openModal('details', { entryId: entry.id }),
    onFinishEntry: handleFinishEntry,
    onOpenLabels: () => openModal('labels'),
  };

  const sharedModals = (
    <>
      {modal === 'createSpace' &&
        renderWithSuspense(
          <SpaceModal onClose={closeModal} onSave={handleSaveSpace} spaceToEdit={editingSpace} />,
          <OverlayLoader />,
        )}
      {modal === 'logTime' &&
        renderWithSuspense(
          <LogTimeModal
            date={logDate}
            onClose={closeModal}
            onSave={handleSaveTimeEntry}
            entryToEdit={editingEntry}
            availableTags={availableTags}
          />,
          <OverlayLoader />,
        )}
      {modal === 'details' &&
        viewingEntry &&
        renderWithSuspense(
          <DetailsModal
            entry={viewingEntry}
            spaceColor={spaces.find((space) => space.id === viewingEntry.spaceId)?.color}
            spaceName={spaces.find((space) => space.id === viewingEntry.spaceId)?.name}
            onClose={closeModal}
            onFinish={handleFinishEntry}
          />,
          <OverlayLoader />,
        )}
      {modal === 'profile' &&
        renderWithSuspense(
          <ProfileModal onClose={closeModal} onOpenMigration={() => openModal('migration')} />,
          <OverlayLoader />,
        )}
      {modal === 'migration' &&
        renderWithSuspense(
          <MigrationModal
            spaces={spaces}
            timeEntries={timeEntries}
            setSpaces={setSpaces}
            setTimeEntries={setTimeEntries}
            onClose={() => openModal('profile')}
          />,
          <OverlayLoader />,
        )}
      {modal === 'calculator' &&
        renderWithSuspense(<FinancialCalculatorModal entries={timeEntries} onClose={closeModal} />, <OverlayLoader />)}
      {modal === 'labels' &&
        (() => {
          const labelSpace = spaces.find((space) => space.id === currentPathSpaceId);
          const labelEntries = timeEntries.filter((entry) => entry.spaceId === currentPathSpaceId);

          if (!labelSpace) {
            return null;
          }

          return renderWithSuspense(
            <LabelsModal
              space={labelSpace}
              entries={labelEntries}
              onClose={closeModal}
              onRenameTag={handleRenameTag}
              onDeleteTag={handleDeleteTag}
              onBulkTag={handleBulkTag}
            />,
            <OverlayLoader />,
          );
        })()}
      {confirmState.isOpen &&
        renderWithSuspense(
          <ConfirmModal
            title={confirmState.title}
            message={confirmState.message}
            onConfirm={confirmState.onConfirm}
            onClose={() => setConfirmState((previous) => ({ ...previous, isOpen: false }))}
          />,
          <OverlayLoader />,
        )}
      {isInfoPanelOpen && <InfoPanel isOpen={isInfoPanelOpen} onClose={() => setInfoPanelOpen(false)} />}
    </>
  );

  if (isDesktop) {
    return (
      <>
        <div className="flex h-screen w-full overflow-hidden bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
          <DesktopSidebar
            spaces={spaces}
            timeEntries={timeEntries}
            onCreateSpace={handlers.onCreateSpace}
            onEditSpace={handlers.onEditSpace}
            onDeleteSpace={handlers.onDeleteSpace}
            onProfileClick={() => openModal('profile')}
            onInfoClick={() => setInfoPanelOpen(true)}
            isSyncing={isSyncing}
            onSyncClick={syncNow}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed((previous) => !previous)}
          />

          <div className="flex flex-1 flex-col overflow-hidden">
            {activeSpace && (
              <header className="flex h-12 flex-shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-2 text-sm">
                  <button
                    onClick={() => navigate('/spaces')}
                    className="flex items-center gap-1 font-medium text-slate-500 transition-colors hover:text-primary"
                  >
                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                    {t('spaces_label') || 'Spaces'}
                  </button>
                  <span className="text-slate-300 dark:text-slate-600">/</span>
                  <div className="flex items-center gap-1.5">
                    <div className={`size-4 rounded-md ${activeSpace.color}`} />
                    <span className="max-w-[180px] truncate font-semibold text-slate-800 dark:text-white">
                      {activeSpace.name}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => navigate(`/space/${activeSpaceId}`)}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                      !isStatsPath
                        ? 'bg-primary/10 text-primary'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">calendar_today</span>
                    {t('calendar') || 'Calendar'}
                  </button>
                  <button
                    onClick={() => navigate(`/space/${activeSpaceId}/stats`)}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                      isStatsPath
                        ? 'bg-primary/10 text-primary'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">bar_chart</span>
                    {t('statistics')}
                  </button>
                  <div className="mx-1 h-5 w-px bg-slate-200 dark:bg-slate-700" />
                  <button
                    onClick={() => openModal('labels')}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition-all hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                  >
                    <span className="material-symbols-outlined text-sm">label</span>
                    {t('labels')}
                  </button>
                </div>
              </header>
            )}

            <main className="flex-1 overflow-hidden">
              <Routes>
                <Route index element={<Redirector spaces={spaces} />} />
                <Route path="*" element={<Redirector spaces={spaces} />} />
                <Route
                  path="/welcome"
                  element={renderWithSuspense(<Welcome onNavigate={() => navigate('/spaces?modal=createSpace')} />)}
                />
                <Route
                  path="/spaces"
                  element={renderWithSuspense(
                    <DesktopSpaces
                      spaces={spaces}
                      timeEntries={timeEntries}
                      onSelectSpace={(id) => navigate(`/space/${id}`)}
                      onCreateSpace={handlers.onCreateSpace}
                      onEditSpace={handlers.onEditSpace}
                      onDeleteSpace={handlers.onDeleteSpace}
                      onViewEntryDetails={handlers.onViewDetails}
                    />,
                  )}
                />
                <Route
                  path="/space/:spaceId"
                  element={
                    <DesktopCalendarWrapper
                      spaces={spaces}
                      timeEntries={timeEntries}
                      onLogTime={handlers.onLogTime}
                      onEditEntry={handlers.onEditEntry}
                      onDeleteEntry={handlers.onDeleteEntry}
                      onViewDetails={handlers.onViewDetails}
                      onOpenLabels={handlers.onOpenLabels}
                    />
                  }
                />
                <Route
                  path="/space/:spaceId/stats"
                  element={<DesktopStatisticsWrapper spaces={spaces} timeEntries={timeEntries} />}
                />
              </Routes>
            </main>
          </div>
        </div>
        {sharedModals}
      </>
    );
  }

  const showHeader = ['/welcome', '/spaces'].includes(location.pathname);

  return (
    <div
      className="relative mx-auto flex h-[100dvh] w-full max-w-md flex-col overflow-hidden bg-white/50 text-slate-900 dark:bg-black/20 dark:text-slate-100"
    >
      {showHeader && (
        <Header
          onInfoClick={() => setInfoPanelOpen(true)}
          onProfileClick={() => openModal('profile')}
          isSyncing={isSyncing}
          onSyncClick={syncNow}
        />
      )}

      <div className="scrollable-content touch-pan-y flex-1 overflow-y-auto">
        <Routes>
          <Route index element={<Redirector spaces={spaces} />} />
          <Route path="*" element={<Redirector spaces={spaces} />} />
          <Route
            path="/welcome"
            element={renderWithSuspense(<Welcome onNavigate={() => navigate('/spaces?modal=createSpace')} />)}
          />
          <Route
            path="/spaces"
            element={renderWithSuspense(
              <SpacesView
                spaces={spaces}
                timeEntries={timeEntries}
                onSelectSpace={(id) => navigate(`/space/${id}`)}
                onCreateSpace={() => {
                  setEditingSpace(null);
                  openModal('createSpace');
                }}
                onEditSpace={(space) => {
                  setEditingSpace(space);
                  openModal('createSpace');
                }}
                onDeleteSpace={handleDeleteSpace}
                onViewEntryDetails={(entry) => openModal('details', { entryId: entry.id })}
              />,
            )}
          />
          <Route
            path="/space/:spaceId"
            element={
              <CalendarWrapper
                spaces={spaces}
                timeEntries={timeEntries}
                onLogTime={(date) => {
                  setLogDate(date);
                  setEditingEntry(null);
                  openModal('logTime');
                }}
                onEditEntry={(entry) => {
                  setLogDate(new Date(`${entry.date}T12:00`));
                  setEditingEntry(entry);
                  openModal('logTime');
                }}
                onDeleteEntry={(id) => handleDeleteEntry(id)}
                onViewDetails={(entry) => openModal('details', { entryId: entry.id })}
                onOpenLabels={() => openModal('labels')}
              />
            }
          />
          <Route path="/space/:spaceId/stats" element={<StatisticsWrapper spaces={spaces} timeEntries={timeEntries} />} />
        </Routes>
      </div>

      {sharedModals}
    </div>
  );
};

export default AppShell;
