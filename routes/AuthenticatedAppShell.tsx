import React from 'react';
import { AuthProvider } from '../context/AuthContext';
import AppShell from './AppShell';
import type { Space, TimeEntry } from '../types';

interface AuthenticatedAppShellProps {
  spaces: Space[];
  setSpaces: React.Dispatch<React.SetStateAction<Space[]>>;
  timeEntries: TimeEntry[];
  setTimeEntries: React.Dispatch<React.SetStateAction<TimeEntry[]>>;
}

const AuthenticatedAppShell: React.FC<AuthenticatedAppShellProps> = (props) => (
  <AuthProvider>
    <AppShell {...props} />
  </AuthProvider>
);

export default AuthenticatedAppShell;
