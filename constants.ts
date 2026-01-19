import React from 'react';

export const SPACE_COLORS = [
    'bg-rose-500',
    'bg-pink-500',
    'bg-fuchsia-600',
    'bg-purple-600',
    'bg-violet-600',
    'bg-indigo-500',
    'bg-blue-500',
    'bg-sky-500',
    'bg-cyan-500',
    'bg-teal-500',
    'bg-emerald-500',
    'bg-lime-600',
    'bg-amber-500',
    'bg-orange-500',
    'bg-slate-500',
    'bg-neutral-500',
];

export const ICONS = [
    'brush',
    'build',
    'code',
    'description',
    'directions_run',
    'edit_note',
    'favorite',
    'finance',
    'fitness_center',
    'flight',
    'groups',
    'headset_mic',
    'home',
    'language',
    'lightbulb',
    'local_cafe',
    'local_dining',
    'menu_book',
    'movie',
    'music_note',
    'palette',
    'park',
    'pets',
    'phone',
    'piano',
    'school',
    'science',
    'self_improvement',
    'shopping_cart',
    'sports_esports',
    'store',
    'videocam',
    'volunteer_activism',
    'work'
].sort();

// FIX: Replaced JSX with React.createElement to resolve parsing errors in a .ts file.
export const WelcomeIcon = () => (
    React.createElement('div', {
        className: "flex items-center justify-center w-64 h-64 bg-primary/10 rounded-full"
    }, React.createElement('span', {
        className: "material-symbols-outlined text-primary text-9xl"
    }, 'timer'))
);