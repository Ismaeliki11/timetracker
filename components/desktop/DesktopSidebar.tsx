import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import type { Space, TimeEntry } from '../../types';
import { useLocalization, useTheme } from '../../context/AppProviders';
import { useAuth } from '../../context/AuthContext';

interface DesktopSidebarProps {
  spaces: Space[];
  timeEntries: TimeEntry[];
  onCreateSpace: () => void;
  onEditSpace: (space: Space) => void;
  onDeleteSpace: (id: string, name: string) => void;
  onProfileClick: () => void;
  onInfoClick: () => void;
  isSyncing: boolean;
  onSyncClick: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const formatDuration = (hours: number): string => {
  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}:${String(m).padStart(2, '0')}`;
};

const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  spaces, timeEntries,
  onCreateSpace, onEditSpace, onDeleteSpace,
  onProfileClick, onInfoClick,
  isSyncing, onSyncClick,
  collapsed, onToggleCollapse,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLocalization();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  const activeSpaceId = location.pathname.match(/\/space\/([^/]+)/)?.[1];

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || '';
  const initial = displayName ? displayName[0].toUpperCase() : '?';
  const avatarUrl = user?.user_metadata?.avatar_url;

  const totalHoursBySpace = useMemo(() => {
    const totals: Record<string, number> = {};
    spaces.forEach(s => (totals[s.id] = 0));
    timeEntries.forEach(e => {
      if (totals[e.spaceId] !== undefined) totals[e.spaceId] += e.duration;
    });
    return totals;
  }, [spaces, timeEntries]);

  return (
    <aside className={`${collapsed ? 'w-14' : 'w-60'} flex-shrink-0 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden transition-all duration-200`}>
      {/* App Header */}
      <div className="h-14 flex items-center px-2 border-b border-slate-200 dark:border-slate-800 flex-shrink-0 gap-2">
        <button 
          onClick={() => navigate('/spaces')}
          className={`flex items-center gap-2 hover:opacity-70 transition-opacity cursor-pointer ${collapsed ? 'mx-auto' : 'flex-1'}`}
        >
          {!collapsed && (
            <>
              <span className="material-symbols-outlined text-primary text-xl ml-2">timer</span>
              <span className="font-black text-base text-slate-900 dark:text-white tracking-tight">TimeTracker</span>
            </>
          )}
          {collapsed && <span className="material-symbols-outlined text-primary text-xl">timer</span>}
        </button>
        <button
          onClick={onToggleCollapse}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={`p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-all flex-shrink-0 ${collapsed ? 'hidden' : ''}`}
        >
          <span className="material-symbols-outlined text-base">left_panel_close</span>
        </button>
      </div>

      {/* Collapse toggle button when collapsed */}
      {collapsed && (
        <button
          onClick={onToggleCollapse}
          title="Expand sidebar"
          className="mx-auto mt-2 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-all"
        >
          <span className="material-symbols-outlined text-base">left_panel_open</span>
        </button>
      )}

      {/* Spaces List */}
      <div className="flex-1 overflow-y-auto py-3 px-2">
        {!collapsed && (
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400 px-2 mb-2 mt-1">
            {t('spaces_label') || 'Spaces'}
          </p>
        )}

        {spaces.map(space => (
          <SidebarSpaceItem
            key={space.id}
            space={space}
            totalHours={totalHoursBySpace[space.id] || 0}
            isActive={activeSpaceId === space.id}
            onSelect={() => navigate(`/space/${space.id}`)}
            onEdit={() => onEditSpace(space)}
            onDelete={() => onDeleteSpace(space.id, space.name)}
            t={t}
            collapsed={collapsed}
          />
        ))}

        {!collapsed && (
          <button
            onClick={onCreateSpace}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-all mt-1 group"
          >
            <div className="size-7 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 flex items-center justify-center flex-shrink-0 transition-colors">
              <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 text-sm">add</span>
            </div>
            <span className="text-sm font-medium truncate">{t('create_new_space')}</span>
          </button>
        )}
        {collapsed && (
          <button
            onClick={onCreateSpace}
            title={t('create_new_space')}
            className="w-full flex items-center justify-center py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-all mt-1"
          >
            <span className="material-symbols-outlined text-sm">add</span>
          </button>
        )}
      </div>

      {/* Bottom Section */}
      <div className="border-t border-slate-200 dark:border-slate-800 p-2 flex-shrink-0">
        {collapsed ? (
          <div className="flex flex-col items-center gap-1">
            <button onClick={onInfoClick} title="Info" className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-all">
              <span className="material-symbols-outlined text-base">info</span>
            </button>
            <button onClick={toggleTheme} title={theme === 'light' ? 'Dark mode' : 'Light mode'} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-all">
              <span className="material-symbols-outlined text-base">{theme === 'light' ? 'dark_mode' : 'light_mode'}</span>
            </button>
            <button onClick={onSyncClick} disabled={isSyncing} title="Sync" className={`p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-all ${isSyncing ? 'opacity-40 cursor-not-allowed' : ''}`}>
              <span className={`material-symbols-outlined text-base ${isSyncing ? 'animate-spin' : ''}`}>sync</span>
            </button>
            <button onClick={onProfileClick} title={displayName || 'Profile'} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
              <div className="size-7 rounded-full overflow-hidden ring-2 ring-slate-200 dark:ring-slate-700">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-primary text-white flex items-center justify-center font-bold text-xs">{initial}</div>
                )}
              </div>
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-1 mb-2">
              <button
                onClick={onInfoClick}
                title={t('language') || 'Settings'}
                className="flex-1 flex items-center justify-start gap-1.5 px-2 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs transition-all"
              >
                <span className="material-symbols-outlined text-base">info</span>
                <span className="text-xs font-medium">Info</span>
              </button>
              <button
                onClick={toggleTheme}
                title={theme === 'light' ? 'Dark mode' : 'Light mode'}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-all"
              >
                <span className="material-symbols-outlined text-base">
                  {theme === 'light' ? 'dark_mode' : 'light_mode'}
                </span>
              </button>
              <button
                onClick={onSyncClick}
                disabled={isSyncing}
                title="Sync"
                className={`p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-all ${isSyncing ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                <span className={`material-symbols-outlined text-base ${isSyncing ? 'animate-spin' : ''}`}>sync</span>
              </button>
            </div>
            <button
              onClick={onProfileClick}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              <div className="size-7 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-slate-200 dark:ring-slate-700">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-primary text-white flex items-center justify-center font-bold text-xs">
                    {initial}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-semibold text-slate-800 dark:text-white truncate leading-tight">
                  {displayName || 'Guest'}
                </p>
                <p className="text-[10px] text-slate-400 truncate leading-tight">{user?.email || 'Not signed in'}</p>
              </div>
            </button>
          </>
        )}
      </div>
    </aside>
  );
};

interface SidebarSpaceItemProps {
  space: Space;
  totalHours: number;
  isActive: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  t: (key: string, params?: any) => string;
  collapsed?: boolean;
}

const SidebarSpaceItem: React.FC<SidebarSpaceItemProps> = ({
  space, totalHours, isActive, onSelect, onEdit, onDelete, t, collapsed,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (collapsed) {
    return (
      <button
        onClick={onSelect}
        title={space.name}
        className={`w-full flex items-center justify-center py-2 rounded-xl mb-0.5 transition-all ${isActive ? 'bg-primary/10' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
      >
        <div className={`size-7 rounded-lg ${space.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
          <span className="material-symbols-outlined text-white text-sm">{space.icon || 'timer'}</span>
        </div>
      </button>
    );
  }

  return (
    <div className={`relative flex items-center rounded-xl mb-0.5 group transition-all ${isActive ? 'bg-primary/10' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
      <button
        onClick={onSelect}
        className="flex items-center gap-2.5 px-2.5 py-2 flex-1 min-w-0 text-left"
      >
        <div className={`size-7 rounded-lg ${space.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
          <span className="material-symbols-outlined text-white text-sm">{space.icon || 'timer'}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold truncate ${isActive ? 'text-primary' : 'text-slate-700 dark:text-slate-300'}`}>
            {space.name}
          </p>
          <p className="text-[10px] text-slate-400 truncate">
            {formatDuration(totalHours)} {t('tracked')}
          </p>
        </div>
      </button>

      <div className="relative flex-shrink-0 pr-1" ref={menuRef}>
        <button
          onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
          className={`p-1 rounded-lg transition-all text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700
            ${menuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
        >
          <span className="material-symbols-outlined text-sm">more_vert</span>
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50">
            <button
              onClick={() => { onEdit(); setMenuOpen(false); }}
              className="w-full text-left px-3 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-t-xl flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">edit</span>
              {t('edit')}
            </button>
            <button
              onClick={() => { onDelete(); setMenuOpen(false); }}
              className="w-full text-left px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-b-xl flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">delete</span>
              {t('delete')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DesktopSidebar;
