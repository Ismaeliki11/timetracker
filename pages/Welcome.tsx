import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocalization } from '../context/AppProviders';
import { useAuth } from '../context/AuthContext';
import { WelcomeIcon } from '../constants'; // Ensure this import path is correct

interface WelcomeScreenProps {
    onNavigate?: () => void; // Optional if we use internal navigation
}

const Welcome: React.FC<WelcomeScreenProps> = ({ onNavigate }) => {
    const { t } = useLocalization();
    const navigate = useNavigate();
    const { user } = useAuth();

    // Get display name from metadata or email
    const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || t('user') || 'User';

    const handleCreateSpace = () => {
        if (onNavigate) {
            onNavigate();
        } else {
            navigate('/spaces?modal=createSpace');
        }
    };

    const welcomeMessage = t('welcome_back') === 'welcome_back'
        ? `Welcome back, ${displayName}!`
        : t('welcome_back').replace('{name}', displayName);

    return (
        <main className="flex flex-col flex-grow items-center justify-center p-4 h-full">
            <div className="flex flex-col items-center gap-8 text-center w-full max-w-sm">
                <WelcomeIcon />
                <div className="flex w-full flex-col items-center gap-2">
                    <h2 className="text-2xl font-bold tracking-tight text-black dark:text-white">
                        {welcomeMessage}
                    </h2>
                    <p className="text-base font-normal text-slate-600 dark:text-gray-300">
                        {t('get_started_prompt')}
                    </p>
                </div>
                <button
                    onClick={handleCreateSpace}
                    className="flex w-full cursor-pointer items-center justify-center rounded-lg h-12 px-4 bg-primary text-white text-base font-bold shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all"
                >
                    <span className="truncate">{t('create_new_space')}</span>
                </button>
            </div>
        </main>
    );
};

export default Welcome;
