export const mapAuthError = (error: string): string => {
    // Exact matches
    if (error === 'Invalid login credentials') return 'auth_error_invalid_credentials';
    if (error === 'User already registered') return 'auth_error_user_exist';
    if (error === 'Email not confirmed') return 'auth_error_email_not_confirmed';
    if (error.includes('Password should be at least')) return 'auth_error_password_length';
    if (error.includes('Database error saving new user')) return 'auth_error_database';

    // Fallback
    return error;
};
