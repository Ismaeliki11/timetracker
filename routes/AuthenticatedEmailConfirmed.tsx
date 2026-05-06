import React from 'react';
import { AuthProvider } from '../context/AuthContext';
import EmailConfirmed from '../pages/EmailConfirmed';

const AuthenticatedEmailConfirmed: React.FC = () => (
  <AuthProvider>
    <EmailConfirmed />
  </AuthProvider>
);

export default AuthenticatedEmailConfirmed;
