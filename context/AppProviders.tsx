import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

// --- TRANSLATIONS ---
const translations = {
  en: {
    // General
    'cancel': 'Cancel',
    'delete': 'Delete',
    'save_changes': 'Save Changes',
    'create': 'Create',
    'edit': 'Edit',
    'close': 'Close',
    'optional': '(Optional)',
    'options': 'Options',
    'previous_month': 'Previous month',
    'next_month': 'Next month',
    // App.tsx & Screens
    'welcome_user': 'Welcome, User!',
    'get_started_prompt': "Let's get started by creating a space to track your activities.",
    'create_new_space': 'Create New Space',
    'welcome_back': 'Welcome back!',
    'select_space_prompt': 'Select a space to continue tracking.',
    'tracked': 'tracked',
    // Header & Info Panel
    'app_description': 'A simple and elegant application to track time spent on various projects and activities. Create spaces, log your time, and visualize your progress.',
    'language': 'Language',
    // Motivational Messages (User)
    'motivational_morning_1': 'Good morning, {name}. Ready for a productive day?',
    'motivational_morning_2': 'Start with energy, {name}.',
    'motivational_morning_3': 'Let\'s achieve your goals today, {name}.',
    'motivational_afternoon_1': 'Keep the focus, {name}. Almost there.',
    'motivational_afternoon_2': 'You\'re doing great, {name}. Don\'t stop now.',
    'motivational_afternoon_3': 'Good afternoon, {name}. How is the progress?',
    'motivational_evening_1': 'Good evening, {name}. Time to review today\'s achievements.',
    'motivational_evening_2': 'Rest is important too, {name}.',
    'motivational_evening_3': 'Great job today, {name}. See you tomorrow.',
    'motivational_default_1': 'Welcome back, {name}.',
    'motivational_default_2': 'Ready to track your time, {name}?',
    'motivational_winning_1': 'Time is money, but tracking it is free.',
    'motivational_winning_2': 'Your time is your greatest asset; don\'t let it run into the red.',
    'motivational_winning_3': 'Your future self will thank you for this minute.',
    'motivational_winning_4': 'If time flies, make sure you\'re the pilot.',
    'motivational_winning_5': 'Focus on the step, not the mountain.',
    'motivational_winning_6': 'Don\'t count the days, make the days count.',
    'motivational_winning_7': 'Success is the sum of small efforts tracked.',
    'motivational_winning_8': 'The best time was yesterday. The second best is now.',
    'motivational_winning_9': 'Productivity isn\'t doing more, it\'s being more effective.',
    'motivational_winning_10': 'Every second is a chance to start over.',
    'motivational_winning_11': 'Time flies like an arrow; fruit flies like a banana. Track wisely!',
    'motivational_winning_12': 'I’m on a \'time-only\' diet. So far I’ve lost 3 hours today. Let\'s find them!',
    'motivational_winning_13': 'Be like a proton: stay positive and keep tracking.',
    'motivational_winning_14': 'The early bird gets the worm, but the second mouse gets the cheese. Just track your pace.',
    'motivational_winning_15': 'I have a lot of \'cents\' of time, but I\'m still broke. Let\'s make it count.',
    'motivational_winning_16': 'I\'m not lazy, I\'m just on energy saving mode until I hit \'Start\'.',
    'motivational_winning_17': 'My bed is a magical place where I suddenly remember everything I forgot to track.',
    'motivational_winning_18': 'Doing nothing is hard, you never know when you\'re finished. Better record something!',
    'motivational_winning_19': 'May your coffee be strong and your tracking be accurate.',
    'motivational_winning_20': 'Procrastination is the art of keeping up with yesterday. Stop it!',
    // Guest Messages (Neutral, No Name)
    'guest_morning_1': 'Good morning. Ready to organize your day?',
    'guest_morning_2': 'Welcome. Let\'s make today count.',
    'guest_afternoon_1': 'Good afternoon. Keep going.',
    'guest_afternoon_2': 'Stay focused on your goals.',
    'guest_evening_1': 'Good evening. Time to reflect.',
    'guest_evening_2': 'Hope you had a productive day.',
    'guest_default_1': 'Welcome to Time Tracker.',
    'guest_default_2': 'Ready to start tracking?',
    'logged_out_success': 'Logged out successfully. Local data cleared.',
    // CalendarView.tsx
    'add_new_entry': 'Add New Entry',
    'no_entries_for_day': 'No entries for this day.',
    'weekdays_short': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    // Modals.tsx
    // Confirm Modal
    'delete_space': 'Delete Space',
    'delete_space_confirm': 'Are you sure you want to delete "{spaceName}" and all its entries? This action cannot be undone.',
    'delete_entry': 'Delete Entry',
    'delete_entry_confirm': 'Are you sure you want to delete this time entry?',
    'confirm_delete': 'Confirm Delete',
    // Space Modal
    'edit_space': 'Edit Space',
    'space_name': 'Space Name',
    'space_name_placeholder': 'e.g., University Project',
    'space_color': 'Space Color',
    'icon': 'Icon',
    // Log Time Modal
    'log_time': 'Log Time',
    'edit_entry': 'Edit Entry',
    'duration': 'Duration',
    'time_range': 'Time Range',
    'duration_placeholder': 'e.g., 2:30 or 2.5',
    'start_time': 'Start Time',
    'end_time': 'End Time',
    'check_in': 'Check In',
    'check_out': 'Check Out',
    'finish': 'Finish',
    'description': 'Description',
    'description_placeholder': 'What did you work on?',
    'save': 'Save',
    'ongoing': 'Recording...',
    'untitled_space': 'Untitled Space',
    'untitled_entry': 'Untitled Entry',
    'check_in_out_hint': 'Will start a continuous recording from the indicated time.',
    // Details Modal
    'entry_details': 'Entry Details',
    'date': 'Date',
    'no_description_provided': 'No description provided.',
    // Statistics
    'statistics': 'Statistics',
    'last_7_days': 'Last 7 Days',
    'total_time': 'Total Time',
    'time_distribution': 'Time Distribution',
    'top_activities': 'Top Activities',
    'no_description': 'No Description',
    'no_data': 'No data available',
    // Tags
    'tags': 'Tags',
    'add_tag': 'Add Tag',
    'tag_placeholder': 'e.g. Design, Meeting',
    // Labels feature
    'labels': 'Labels',
    'manage_labels': 'Manage',
    'bulk_tag': 'Tag Multiple',
    'no_labels_in_space': 'No labels yet. Add tags to entries to see them here.',
    'edit_label': 'Edit label',
    'delete_label': 'Delete label',
    'delete_label_confirm': 'Delete "{label}"? It will be removed from all entries in this space.',
    'apply_tag': 'Apply Tag',
    'remove_tag': 'Remove Tag',
    'select_tag': 'Select a label',
    'select_entries': 'Select entries to tag',
    'entries_selected': '{count} selected',
    'select_all': 'Select all',
    'deselect_all': 'Clear',
    'tag_applied': 'Tag applied to {count} entries',
    'tag_removed_from': 'Tag removed from {count} entries',
    'select_label_first': 'Choose a label first',
    'no_entries_in_space': 'No entries in this space yet.',
    'day_select_all': 'All',
    'filter_all': 'All',
    'filter_has_tag': 'With tag',
    'filter_no_tag': 'Without tag',
    'bulk_no_changes': 'No changes',
    'bulk_add_action': 'Add tag to {count} entries',
    'bulk_remove_action': 'Remove tag from {count}',
    'bulk_mixed_action': '+{add} to add · −{remove} to remove',
    'bulk_mixed_done': '{add} added, {remove} removed',
    'no_entries_with_tag': 'No entries have this tag yet.',
    'no_entries_without_tag': 'All entries already have this tag.',
    // Stats Enhancements
    'week': 'Week',
    'month': 'Month',
    'vs_previous': 'vs previous period',
    'insight': 'Insight',
    'insight_focus': 'Laser focused on {tag} this period.',
    'insight_surge': 'You\'ve been extra active! +{diff}h more than usual.',
    'insight_drop': 'Taking it lighter? A drop in activity can be good for recharging.',
    'insight_shift': 'You\'re prioritizing {tag} much more than last period.',
    'insight_weekend': 'Burning the weekend oil. Significant activity this weekend.',
    'insight_consistency': 'Solid consistency. You\'re maintaining a steady rhythm.',
    'insight_unlabeled': 'Tip: Categorizing your time helps visualize where your effort goes.',
    // Financial Calculator
    'financial_calculator': 'Financial Calculator',
    'hourly_rate': 'Hourly Rate (€)',
    'calculate_earnings': 'Calculate Earnings',
    'total_earnings': 'Total Earnings',
    'projected_earnings': 'Projected Earnings',
    'projection_monthly': 'Monthly Projection',
    'projection_yearly': 'Yearly Projection',
    'projection_locked': 'Projection Locked',
    'insufficient_data_msg': 'More data needed for a reliable projection. Track at least a full week with distributed activity.',
    'custom_range': 'Custom',
    'select_period': 'Select Period',
    'select_tags': 'Filter by Tags',
    'all_tags': 'All Activity',
    'calculate': 'Calculate',
    'enter_rate': 'Enter rate...',
    'stats_info_title': 'Statistics Guide',
    'stats_info_subtitle': 'Understanding your data',
    'stats_info_overview_title': 'What is this?',
    'stats_info_overview_text': 'Here you can see exactly how you\'ve invested your time. The data is grouped to help you spot trends.',
    'stats_info_period_title': 'Periods',
    'stats_info_period_text': 'Switch between Week, Month, or Custom ranges. The comparison (+/-) shows how this period compares to the previous one.',
    'stats_info_insights_title': 'Smart Insights',
    'stats_info_insights_text': 'When we detect interesting patterns, an insight card will appear. If there\'s not enough data yet, it stays hidden.',
    'stats_info_actions_title': 'Things you can do',
    'stats_info_action_filter': 'Filter by custom dates',
    'stats_info_action_calculator': 'Convert time to earnings',
    'stats_info_action_analyze': 'Analyze top activities',
    'stats_info_disclaimer': 'Data is based solely on your logged entries.',
    'got_it': 'Got it',
    // Profile
    'profile': 'Profile',
    'export_all': 'Export All Data',
    'export_selected': 'Export Selected Spaces',
    'import_spaces': 'Import Spaces',
    // ... existing
    'data_migration': 'Data & Migration',
    'security': 'Security',
    'danger_zone': 'Danger Zone',
    'export_data': 'Export Data',
    'import_data': 'Import Data',
    'est_size': 'Est. Size',
    'delete_account': 'Delete Account',
    'delete_account_desc': 'Permanently remove your account and all data.',
    'delete_account_confirm': 'Are you sure you want to delete your account? This action cannot be undone.',
    'update_profile': 'Update Profile',
    'profile_updated': 'Profile updated successfully',
    'change_password': 'Change Password',
    // Detailed Profile Keys
    'display_name': 'Display Name',
    'reset_password_button': 'Reset Password',
    'send_recovery_link': 'Send a recovery link',
    'irreversible_actions': 'Irreversible actions',
    'delete_account_title': 'Delete Account?',
    'delete_account_warning': 'This will permanently erase all your spaces, entries, and settings.',
    'cannot_be_undone': 'This cannot be undone.',
    'type_delete_confirm': 'Type "DELETE" to confirm',
    'confirm': 'Confirm',
    'preferences': 'Preferences',
    'date_format': 'Date Format',
    'fmt_ddmm': '17/12',
    'fmt_mmdd': '12/17',
    'welcome_guest': 'Welcome!',
    'guest_name': 'Guest',
    'welcome_message_default': 'Keep the focus, {name}. Almost there.',
    'welcome_message_morning': 'Good morning, {name}. Ready to rock?',
    'welcome_message_evening': 'Good evening, {name}. Finishing up?',
    // Error & Notification Messages
    'error_sync_failed': 'Sync error. Check your connection.',
    'error_network_offline': 'No internet connection. Changes saved locally.',
    'error_save_failed': 'Save failed. Please try again.',
    'success_sync_complete': 'Sync completed successfully.',
    'info_network_online': 'Connection restored.',
    'error_unexpected': 'An unexpected problem occurred.',
    // Auth
    'auth_sync_backup': 'Sync & Backup',
    'auth_sync_desc': 'Sign in to sync your spaces across devices. Your local data will be merged automatically.',
    'auth_email': 'Email',
    'auth_password': 'Password',
    'auth_forgot_password': 'Forgot?',
    'auth_sign_in': 'Sign In',
    'auth_or': 'or',
    'auth_continue_guest': 'Continue as Guest',
    'auth_no_account': "Don't have an account?",
    'auth_create_account': 'Create Account',
    'auth_join_subtitle': 'Join Time Tracker today',
    'auth_keep_safe': 'Keep your data safe',
    'auth_keep_safe_desc': 'Creating an account will upload all your local spaces and time entries to the cloud so you never lose them.',
    'auth_full_name': 'Full Name',
    'auth_confirm_password': 'Confirm Password',
    'auth_already_have_account': 'Already have an account?',
    'auth_privacy_accept_pre': 'I accept the',
    'auth_privacy_policy': 'Privacy Policy',
    'auth_terms_of_service': 'Terms of Service',
    'auth_accept_connector': 'and',
    'auth_privacy_accept_post': '.',
    'passwords_mismatch': "Passwords don't match",
    'your_name': 'Your Name',
    // New Auth Flow Keys
    'auth_reset_link_sent': 'Reset link sent! Check your email.',
    'auth_forgot_password_title': 'Reset Password',
    'auth_forgot_password_desc': 'Enter your email to receive instructions.',
    'auth_send_link': 'Send Link',
    'auth_back_to_login': 'Back to Login',
    'auth_email_verified_title': 'Email Verified!',
    'auth_email_verified_desc': 'Your email has been successfully verified. You can now access all features of TimeTracker.',
    'auth_continue_app': 'Continue to App',
    'auth_sign_in_now': 'Sign In Now',
    'auth_password_updated': 'Password updated successfully!',
    'auth_update_password_title': 'Set New Password',
    'auth_update_password_desc': 'Please enter your new password below.',
    'auth_new_password': 'New Password',
    'auth_update_password': 'Update Password',
    // Auth Errors
    'auth_error_invalid_credentials': 'Invalid credentials or email not confirmed.',
    'auth_error_user_exist': 'User already registered.',
    'auth_error_email_not_confirmed': 'Email not confirmed. Please check your inbox.',
    'auth_error_password_length': 'Password must be at least 6 characters.',
    'auth_error_database': 'Error saving user. Please try again.',
    // Landing Page
    'landing_nav_app': 'Open App',
    'landing_hero_badge': '100% Free · No credit card',
    'landing_hero_title_1': 'Track your time.',
    'landing_hero_title_2': 'Effortlessly.',
    'landing_hero_subtitle': 'The free time tracker for work hours, study sessions, and client projects. Organize your time by project, activity, or client without adding extra complexity.',
    'landing_hero_supporting': 'Ideal if you need a simple app to log hours, review a calendar view, and check clear statistics from desktop or mobile.',
    'landing_cta_primary': 'Get started for free',
    'landing_features_label': 'Features',
    'landing_features_title': 'Everything you need, nothing you don\'t',
    'landing_features_subtitle': 'A focused time tracker for logging hours, reviewing your calendar, and checking statistics without clutter.',
    'landing_feat1_title': 'Custom Spaces',
    'landing_feat1_desc': 'Organize your time by project, client, or activity. Each space gets its own color and icon.',
    'landing_feat2_title': 'Calendar View',
    'landing_feat2_desc': 'Visualize all your entries in a monthly calendar. Edit, add, and review at a glance.',
    'landing_feat3_title': 'Stats & Earnings',
    'landing_feat3_desc': 'Discover your time patterns and calculate your earnings with the built-in financial calculator.',
    'landing_feat4_title': 'Sync Across Devices',
    'landing_feat4_desc': 'Start without an account, then sign in when you want cloud sync. Works smoothly on desktop and mobile browsers.',
    'landing_how_label': 'How it works',
    'landing_how_title': 'Three steps to take control',
    'landing_how_subtitle': 'Simple, fast, and designed to get out of your way.',
    'landing_step1_title': 'Create a space',
    'landing_step1_desc': 'Set up a space for each project or activity you want to track.',
    'landing_step2_title': 'Log your time',
    'landing_step2_desc': 'Add entries manually or use check-in / check-out for live tracking.',
    'landing_step3_title': 'Analyze your data',
    'landing_step3_desc': 'Review your stats, spot patterns, and calculate what your time is worth.',
    'landing_use_case_1': 'Freelance hours',
    'landing_use_case_2': 'Client projects',
    'landing_use_case_3': 'Study sessions',
    'landing_use_case_4': 'Personal tasks',
    'landing_preview_space_1': 'Dev Project',
    'landing_preview_space_2': 'Design',
    'landing_preview_item_1': 'UI review',
    'landing_preview_item_2': 'Client call',
    'landing_preview_item_3': 'Code review',
    'landing_preview_live': 'Live',
    'landing_free_badge': 'Free forever',
    'landing_free_title': 'No credit card. No limits. No tricks.',
    'landing_free_subtitle': 'Time Tracker is completely free. Start as a guest or create an account when you want your data synced across devices.',
    'landing_free_cta': 'Create free account',
    'landing_footer_cookies': 'Cookies',
    'landing_footer_copy': 'All rights reserved.',
    // Desktop-specific
    'spaces_label': 'Spaces',
    'today_label': 'Today',
    'this_week_label': 'This week',
    'week_short': 'Week',
    'open_calendar': 'Open Calendar',
    'month_summary': 'Month Summary',
    'days_worked': 'days worked',
    'add_entry_hint': 'Click "Add New Entry" to start tracking',
    'calendar': 'Calendar',
    'daily_avg': 'Daily avg',
    'active_days': 'Active days',
    'best_day': 'Best day',
    'activities': 'Activities',
    // Desktop Statistics — new sections
    'activity_heatmap': 'Activity Heatmap',
    'last_52_weeks': 'Last 52 weeks',
    'day_pattern': 'By Day of Week',
    'weekly_trend': 'Weekly Trend',
    'current_streak': 'Current Streak',
    'longest_streak': 'Best Streak',
    'days_suffix': 'days',
    'all_time_label': 'All-time',
    'total_logged_days': 'Days Logged',
    'no_activity_heatmap': 'No activity recorded yet.',
    'avg_active_day': 'Avg / active day',
  },
  es: {
    // General
    'cancel': 'Cancelar',
    'delete': 'Eliminar',
    'save_changes': 'Guardar Cambios',
    'create': 'Crear',
    'edit': 'Editar',
    'close': 'Cerrar',
    'optional': '(Opcional)',
    'options': 'Opciones',
    'previous_month': 'Mes anterior',
    'next_month': 'Mes siguiente',
    // App.tsx & Screens
    'welcome_user': '¡Bienvenido, Usuario!',
    'get_started_prompt': 'Empecemos creando un espacio para registrar tus actividades.',
    'create_new_space': 'Crear Nuevo Espacio',
    'welcome_back': '¡Bienvenido de nuevo!',
    'select_space_prompt': 'Selecciona un espacio para continuar registrando.',
    'tracked': 'registrados',
    // Header & Info Panel
    'app_description': 'Una aplicación simple y elegante para registrar el tiempo dedicado a diversos proyectos y actividades. Crea espacios, registra tu tiempo y visualiza tu progreso.',
    'language': 'Idioma',
    // Mensajes Motivacionales (Usuario)
    'motivational_morning_1': 'Buenos días, {name}. ¿Listo para un día productivo?',
    'motivational_morning_2': 'Comienza con energía, {name}.',
    'motivational_morning_3': 'Vamos a cumplir tus metas hoy, {name}.',
    'motivational_afternoon_1': 'Mantén el foco, {name}. Ya queda menos.',
    'motivational_afternoon_2': 'Lo estás haciendo genial, {name}. No pares ahora.',
    'motivational_afternoon_3': 'Buenas tardes, {name}. ¿Cómo va el progreso?',
    'motivational_evening_1': 'Buenas noches, {name}. Hora de revisar los logros de hoy.',
    'motivational_evening_2': 'El descanso también es importante, {name}.',
    'motivational_evening_3': 'Gran trabajo hoy, {name}. Hasta mañana.',
    'motivational_default_1': 'Bienvenido de nuevo, {name}.',
    'motivational_default_2': '¿Listo para registrar tu tiempo, {name}?',
    'motivational_winning_1': 'El tiempo es oro, pero rastrearlo es gratis.',
    'motivational_winning_2': 'Tu tiempo es tu mayor activo; no lo dejes en números rojos.',
    'motivational_winning_3': 'Tu "yo" del futuro te agradecerá este minuto.',
    'motivational_winning_4': 'Si el tiempo vuela, asegúrate de ser el piloto.',
    'motivational_winning_5': 'Céntrate en el paso, no en la montaña.',
    'motivational_winning_6': 'No cuentes los días, haz que los días cuenten.',
    'motivational_winning_7': 'El éxito es la suma de pequeños esfuerzos registrados.',
    'motivational_winning_8': 'El mejor momento fue ayer. El segundo mejor es ahora.',
    'motivational_winning_9': 'La productividad no es hacer más, es ser más efectivo.',
    'motivational_winning_10': 'Cada segundo es una oportunidad de empezar de nuevo.',
    'motivational_winning_11': 'A quien madruga, el TimeTracker le ayuda.',
    'motivational_winning_12': 'No dejes para mañana lo que puedas trackear hoy.',
    'motivational_winning_13': 'Dime qué registras y te diré quién eres (y qué procrastinas).',
    'motivational_winning_14': 'Procrastinar es el arte de arruinar el mañana usando el tiempo de hoy.',
    'motivational_winning_15': 'Tus horas son los ladrillos de tu imperio. Asegúrate de que cada uno esté bien colocado.',
    'motivational_winning_16': 'No necesitas más tiempo, necesitas más intención. Y la intención empieza con un registro.',
    'motivational_winning_17': 'Lo que no se registra, se olvida. Lo que se mide, se domina.',
    'motivational_winning_18': 'Tu futuro se diseña hoy, minuto a minuto. No dejes que el azar lleve el mando.',
    'motivational_winning_19': 'El tiempo es el único capital que no admite préstamos. ¡Haz que cada minuto rinda intereses!',
    'motivational_winning_20': 'El reloj no es tu enemigo, es el árbitro que te recuerda que cada jugada cuenta.',
    // Mensajes Invitado (Neutros, Sin Nombre)
    'guest_morning_1': 'Buenos días. ¿Listo para organizar tu día?',
    'guest_morning_2': 'Bienvenido. Haz que hoy cuente.',
    'guest_afternoon_1': 'Buenas tardes. Sigue adelante.',
    'guest_afternoon_2': 'Mantén el foco en tus objetivos.',
    'guest_evening_1': 'Buenas noches. Hora de reflexionar.',
    'guest_evening_2': 'Esperamos que hayas tenido un gran día.',
    'guest_default_1': 'Bienvenido a Time Tracker.',
    'guest_default_2': '¿Listo para empezar a registrar?',
    'logged_out_success': 'Sesión cerrada correctamente. Datos locales limpiados.',
    // CalendarView.tsx
    'add_new_entry': 'Añadir Nueva Entrada',
    'no_entries_for_day': 'No hay entradas para este día.',
    'weekdays_short': ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    // Modals.tsx
    // Confirm Modal
    'delete_space': 'Eliminar Espacio',
    'delete_space_confirm': '¿Estás seguro de que quieres eliminar "{spaceName}" y todas sus entradas? Esta acción no se puede deshacer.',
    'delete_entry': 'Eliminar Entrada',
    'delete_entry_confirm': '¿Estás seguro de que quieres eliminar esta entrada de tiempo?',
    'confirm_delete': 'Confirmar',
    // Space Modal
    'edit_space': 'Editar Espacio',
    'space_name': 'Nombre del Espacio',
    'space_name_placeholder': 'Ej: Proyecto Universitario',
    'space_color': 'Color del Espacio',
    'icon': 'Icono',
    // Log Time Modal
    'log_time': 'Registrar Tiempo',
    'edit_entry': 'Editar Entrada',
    'duration': 'Duración',
    'time_range': 'Rango de Tiempo',
    'duration_placeholder': 'Ej: 2:30 o 2.5',
    'start_time': 'Hora de Inicio',
    'end_time': 'Hora de Fin',
    'check_in': 'Entrada',
    'check_out': 'Salida',
    'finish': 'Finalizar',
    'description': 'Descripción',
    'description_placeholder': '¿En qué trabajaste?',
    'save': 'Guardar',
    'ongoing': 'En curso...',
    'untitled_space': 'Espacio sin nombre',
    'untitled_entry': 'Entrada sin nombre',
    'check_in_out_hint': 'Iniciará un registro continuo desde la hora indicada.',
    // Details Modal
    'entry_details': 'Detalles de la Entrada',
    'date': 'Fecha',
    'no_description_provided': 'No se proporcionó descripción.',
    // Statistics
    'statistics': 'Estadísticas',
    'last_7_days': 'Últimos 7 días',
    'total_time': 'Tiempo Total',
    'time_distribution': 'Distribución del Tiempo',
    'top_activities': 'Actividades Principales',
    'no_description': 'Sin Descripción',
    'no_data': 'No hay datos disponibles',
    // Tags
    'tags': 'Etiquetas',
    'add_tag': 'Añadir',
    'tag_placeholder': 'Ej: Diseño, Reunión',
    // Labels feature
    'labels': 'Etiquetas',
    'manage_labels': 'Gestionar',
    'bulk_tag': 'Etiquetar',
    'no_labels_in_space': 'Aún no hay etiquetas. Añade etiquetas a tus entradas para verlas aquí.',
    'edit_label': 'Editar etiqueta',
    'delete_label': 'Eliminar etiqueta',
    'delete_label_confirm': '¿Eliminar "{label}"? Se quitará de todas las entradas de este espacio.',
    'apply_tag': 'Etiquetar',
    'remove_tag': 'Quitar etiqueta',
    'select_tag': 'Elige una etiqueta',
    'select_entries': 'Selecciona entradas',
    'entries_selected': '{count} seleccionadas',
    'select_all': 'Todas',
    'deselect_all': 'Ninguna',
    'tag_applied': 'Etiqueta aplicada a {count} entradas',
    'tag_removed_from': 'Etiqueta quitada de {count} entradas',
    'select_label_first': 'Primero elige una etiqueta',
    'no_entries_in_space': 'No hay entradas en este espacio todavía.',
    'day_select_all': 'Todos',
    'filter_all': 'Todas',
    'filter_has_tag': 'Con etiqueta',
    'filter_no_tag': 'Sin etiqueta',
    'bulk_no_changes': 'Sin cambios',
    'bulk_add_action': 'Añadir etiqueta a {count} entradas',
    'bulk_remove_action': 'Quitar etiqueta de {count}',
    'bulk_mixed_action': '+{add} para añadir · −{remove} para quitar',
    'bulk_mixed_done': '{add} añadidas, {remove} quitadas',
    'no_entries_with_tag': 'Ninguna entrada tiene esta etiqueta aún.',
    'no_entries_without_tag': 'Todas las entradas ya tienen esta etiqueta.',
    // Stats Enhancements
    'week': 'Semana',
    'month': 'Mes',
    'vs_previous': 'vs periodo anterior',
    'insight': 'Insight',
    // New Insight Keys
    'insight_focus': 'Muy centrado en {tag} durante este periodo.',
    'insight_surge': '¡Has estado muy activo! +{diff}h más de lo habitual.',
    'insight_drop': '¿Bajando el ritmo? Viene bien para recargar pilas.',
    'insight_shift': 'Estás priorizando {tag} mucho más que en el periodo anterior.',
    'insight_weekend': 'Trabajando en finde. Gran parte de tu actividad ha sido estos días.',
    'insight_consistency': 'Consistencia sólida. Mantienes un ritmo muy estable.',
    'insight_unlabeled': 'Tip: Categorizar tu tiempo ayuda a visualizar mejor tu esfuerzo.',
    // Financial Calculator
    'financial_calculator': 'Calculadora Financiera',
    'hourly_rate': 'Tarifa por Hora (€)',
    'calculate_earnings': 'Calcular Ganancias',
    'total_earnings': 'Ganancias Totales',
    'projected_earnings': 'Proyección de Ganancias',
    'projection_monthly': 'Proyección Mensual',
    'projection_yearly': 'Proyección Anual',
    'projection_locked': 'Proyección Bloqueada',
    'insufficient_data_msg': 'Se necesitan más datos para una proyección fiable. Registra al menos una semana completa con actividad distribuida.',
    'custom_range': 'Personalizado',
    'select_period': 'Seleccionar Periodo',
    'select_tags': 'Filtrar por Etiquetas',
    'all_tags': 'Toda la Actividad',
    'calculate': 'Calcular',
    'enter_rate': 'Introduce tarifa...',
    // Stats Info Panel
    'stats_info_title': 'Guía de Estadísticas',
    'stats_info_subtitle': 'Entiende tus datos',
    'stats_info_overview_title': '¿Qué es esto?',
    'stats_info_overview_text': 'Aquí puedes ver cómo has invertido tu tiempo. Los datos se agrupan para ayudarte a ver tendencias.',
    'stats_info_period_title': 'Periodos',
    'stats_info_period_text': 'Cambia entre Semana, Mes o Personalizado. La comparación (+/-) muestra cómo este periodo se compara con el anterior.',
    'stats_info_insights_title': 'Insights Inteligentes',
    'stats_info_insights_text': 'Cuando detectamos patrones interesantes, aparecerá una tarjeta de insight. Si no hay suficientes datos, permanece oculta.',
    'stats_info_actions_title': 'Cosas que puedes hacer',
    'stats_info_action_filter': 'Filtrar por fechas personalizadas',
    'stats_info_action_calculator': 'Convertir tiempo en ganancias',
    'stats_info_action_analyze': 'Analizar actividades principales',
    'stats_info_disclaimer': 'Los datos se basan únicamente en tus entradas registradas.',
    'got_it': 'Entendido',
    'unlabeled_activity': 'Actividad sin etiquetar',
    'no_data_period': 'No hay datos disponibles para este periodo.',
    // Profile
    'profile': 'Perfil',
    'export_all': 'Exportar Todo',
    'export_selected': 'Exportar Selección',
    'import_spaces': 'Importar Espacios',
    // ... existing 
    'data_migration': 'Datos y Migración',
    'security': 'Seguridad',
    'danger_zone': 'Zona de Peligro',
    'export_data': 'Exportar Datos',
    'import_data': 'Importar Datos',
    'est_size': 'Tam. Est.',
    'delete_account': 'Eliminar Cuenta',
    'delete_account_desc': 'Elimina permanentemente tu cuenta y todos los datos.',
    'delete_account_confirm': '¿Estás seguro de que quieres eliminar tu cuenta? Esta acción es irreversible.',
    'update_profile': 'Actualizar Perfil',
    'profile_updated': 'Perfil actualizado correctamente',
    'change_password': 'Cambiar Contraseña',
    // Detailed Profile Keys
    'display_name': 'Nombre para mostrar',
    'reset_password_button': 'Restablecer Contraseña',
    'send_recovery_link': 'Enviar enlace de recuperación',
    'irreversible_actions': 'Acciones irreversibles',
    'delete_account_title': '¿Eliminar Cuenta?',
    'delete_account_warning': 'Esto borrará permanentemente tus espacios, entradas y ajustes.',
    'cannot_be_undone': 'Esto no se puede deshacer.',
    'type_delete_confirm': 'Escribe "DELETE" para confirmar',
    'confirm': 'Confirmar',
    'preferences': 'Preferencias',
    'date_format': 'Formato de Fecha',
    'fmt_ddmm': '17/12',
    'fmt_mmdd': '12/17',
    'welcome_guest': '¡Bienvenido!',
    'guest_name': 'Invitado',
    'welcome_message_default': 'Mantén el foco, {name}. Ya queda menos.',
    'welcome_message_morning': 'Buenos días, {name}. ¿Listo para empezar?',
    'welcome_message_evening': 'Buenas noches, {name}. ¿Terminando por hoy?',
    // Mensajes de Error y Notificación
    'error_sync_failed': 'Error de sincronización. Comprueba tu conexión.',
    'error_network_offline': 'Sin conexión a internet. Los cambios se guardarán localmente.',
    'error_save_failed': 'Error al guardar. Inténtalo de nuevo.',
    'success_sync_complete': 'Sincronización completada correctamente.',
    'info_network_online': 'Conexión restablecida.',
    'error_unexpected': 'Ha ocurrido un problema inesperado.',
    // Auth
    'auth_sync_backup': 'Sincronización y Copia',
    'auth_sync_desc': 'Inicia sesión para sincronizar tus espacios en todos tus dispositivos. Tus datos locales se fusionarán automáticamente.',
    'auth_email': 'Correo Electrónico',
    'auth_password': 'Contraseña',
    'auth_forgot_password': '¿Olvidaste la contraseña?',
    'auth_sign_in': 'Iniciar Sesión',
    'auth_or': 'o',
    'auth_continue_guest': 'Continuar como Invitado',
    'auth_no_account': '¿No tienes cuenta?',
    'auth_create_account': 'Crear Cuenta',
    'auth_join_subtitle': 'Únete a Time Tracker hoy',
    'auth_keep_safe': 'Mantén tus datos seguros',
    'auth_keep_safe_desc': 'Crear una cuenta subirá todos tus espacios y entradas a la nube para que nunca los pierdas.',
    'auth_full_name': 'Nombre Completo',
    'auth_confirm_password': 'Confirmar Contraseña',
    'auth_already_have_account': '¿Ya tienes una cuenta?',
    'auth_privacy_accept_pre': 'Acepto la',
    'auth_privacy_policy': 'Política de Privacidad',
    'auth_terms_of_service': 'Términos y Condiciones',
    'auth_accept_connector': 'y',
    'auth_privacy_accept_post': '.',
    'passwords_mismatch': 'Las contraseñas no coinciden',
    'your_name': 'Tu Nombre',
    // Nuevas claves de Auth Flow
    'auth_reset_link_sent': '¡Enlace enviado! Revisa tu correo.',
    'auth_forgot_password_title': 'Restablecer Contraseña',
    'auth_forgot_password_desc': 'Introduce tu correo para recibir instrucciones.',
    'auth_send_link': 'Enviar Enlace',
    'auth_back_to_login': 'Volver a Iniciar Sesión',
    'auth_email_verified_title': '¡Correo Verificado!',
    'auth_email_verified_desc': 'Tu correo ha sido verificado correctamente. Ya puedes acceder a todas las funciones de TimeTracker.',
    'auth_continue_app': 'Continuar a la App',
    'auth_sign_in_now': 'Iniciar Sesión Ahora',
    'auth_password_updated': '¡Contraseña actualizada correctamente!',
    'auth_update_password_title': 'Nueva Contraseña',
    'auth_update_password_desc': 'Por favor, introduce tu nueva contraseña a continuación.',
    'auth_new_password': 'Nueva Contraseña',
    'auth_update_password': 'Actualizar Contraseña',
    // Auth Errors
    'auth_error_invalid_credentials': 'Credenciales incorrectas o email no confirmado.',
    'auth_error_user_exist': 'El usuario ya está registrado.',
    'auth_error_email_not_confirmed': 'Email no confirmado. Revisa tu bandeja de entrada.',
    'auth_error_password_length': 'La contraseña debe tener al menos 6 caracteres.',
    'auth_error_database': 'Error al guardar el usuario. Inténtalo de nuevo.',
    // Página de Landing
    'landing_nav_app': 'Abrir App',
    'landing_hero_badge': '100% Gratis · Sin tarjeta de crédito',
    'landing_hero_title_1': 'Registra tu tiempo.',
    'landing_hero_title_2': 'Sin complicaciones.',
    'landing_hero_subtitle': 'El time tracker gratis para registrar horas de trabajo, estudio y proyectos con claridad. Organiza tu tiempo por proyecto, actividad o cliente sin añadir complejidad.',
    'landing_hero_supporting': 'Ideal si buscas una app sencilla para llevar control horario, revisar un calendario y consultar estadísticas claras desde escritorio o móvil.',
    'landing_cta_primary': 'Empezar gratis',
    'landing_features_label': 'Funcionalidades',
    'landing_features_title': 'Todo lo que necesitas, nada más',
    'landing_features_subtitle': 'Un rastreador de tiempo enfocado en registrar horas, revisar tu calendario y consultar estadísticas sin ruido.',
    'landing_feat1_title': 'Espacios personalizados',
    'landing_feat1_desc': 'Organiza tu tiempo por proyecto, cliente o actividad. Cada espacio tiene su propio color e icono.',
    'landing_feat2_title': 'Vista de Calendario',
    'landing_feat2_desc': 'Visualiza todas tus entradas en un calendario mensual. Edita, añade y revisa de un vistazo.',
    'landing_feat3_title': 'Estadísticas y Ganancias',
    'landing_feat3_desc': 'Descubre tus patrones de tiempo y calcula tus ganancias con la calculadora financiera integrada.',
    'landing_feat4_title': 'Sincronización en la nube',
    'landing_feat4_desc': 'Empieza sin cuenta y entra cuando quieras sincronización en la nube. Funciona muy bien en navegadores de escritorio y móvil.',
    'landing_how_label': 'Cómo funciona',
    'landing_how_title': 'Tres pasos para tomar el control',
    'landing_how_subtitle': 'Simple, rápido y diseñado para no estorbarte.',
    'landing_step1_title': 'Crea un espacio',
    'landing_step1_desc': 'Configura un espacio para cada proyecto o actividad que quieras registrar.',
    'landing_step2_title': 'Registra tu tiempo',
    'landing_step2_desc': 'Añade entradas manualmente o usa entrada / salida para seguimiento en tiempo real.',
    'landing_step3_title': 'Analiza tus datos',
    'landing_step3_desc': 'Revisa tus estadísticas, descubre tendencias y calcula cuánto vale tu tiempo.',
    'landing_use_case_1': 'Horas freelance',
    'landing_use_case_2': 'Proyectos de clientes',
    'landing_use_case_3': 'Sesiones de estudio',
    'landing_use_case_4': 'Tareas personales',
    'landing_preview_space_1': 'Proyecto dev',
    'landing_preview_space_2': 'Diseño',
    'landing_preview_item_1': 'Revisión UI',
    'landing_preview_item_2': 'Llamada con cliente',
    'landing_preview_item_3': 'Revisión de código',
    'landing_preview_live': 'En vivo',
    'landing_free_badge': 'Gratis para siempre',
    'landing_free_title': 'Sin tarjeta. Sin límites. Sin trampa.',
    'landing_free_subtitle': 'Time Tracker es completamente gratuito. Empieza como invitado o crea una cuenta cuando quieras sincronizar tus datos entre dispositivos.',
    'landing_free_cta': 'Crear cuenta gratuita',
    'landing_footer_cookies': 'Cookies',
    'landing_footer_copy': 'Todos los derechos reservados.',
    // Desktop-specific
    'spaces_label': 'Espacios',
    'today_label': 'Hoy',
    'this_week_label': 'Esta semana',
    'week_short': 'Semana',
    'open_calendar': 'Abrir Calendario',
    'month_summary': 'Resumen del Mes',
    'days_worked': 'días trabajados',
    'add_entry_hint': 'Pulsa "Nueva Entrada" para empezar a registrar',
    'calendar': 'Calendario',
    'daily_avg': 'Media diaria',
    'active_days': 'Días activos',
    'best_day': 'Mejor día',
    'activities': 'Actividades',
    // Desktop Statistics — new sections
    'activity_heatmap': 'Mapa de Actividad',
    'last_52_weeks': 'Últimas 52 semanas',
    'day_pattern': 'Por día de la semana',
    'weekly_trend': 'Tendencia semanal',
    'current_streak': 'Racha actual',
    'longest_streak': 'Mejor racha',
    'days_suffix': 'días',
    'all_time_label': 'Histórico',
    'total_logged_days': 'Días registrados',
    'no_activity_heatmap': 'Aún no hay actividad registrada.',
    'avg_active_day': 'Media / día activo',
  },
};

type Language = 'en' | 'es';
type Theme = 'light' | 'dark';

// --- THEME ---
interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useLocalStorage<Theme>('theme', 'light');

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// --- LOCALIZATION ---
type TranslateFunction = (key: string, replacements?: { [key: string]: string }) => string;

interface LocalizationContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: TranslateFunction;
  locale: 'en-US' | 'es-ES';
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

const LocalizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useLocalStorage<Language>('language', 'es');

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = useMemo(() => (key: string, replacements?: { [key: string]: string }) => {
    let translation = translations[language][key] || translations['en'][key] || key;
    if (replacements) {
      Object.keys(replacements).forEach(rKey => {
        translation = translation.replace(`{${rKey}}`, replacements[rKey]);
      });
    }
    return translation;
  }, [language]);

  const locale = useMemo(() => (language === 'es' ? 'es-ES' : 'en-US'), [language]);

  return (
    <LocalizationContext.Provider value={{ language, setLanguage, t, locale }}>
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocalization = () => {
  const context = useContext(LocalizationContext);
  if (context === undefined) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  return context;
};

// --- DATE FORMAT ---
export type DateFormat = 'DD/MM/YYYY' | 'MM/DD/YYYY';

interface DateFormatContextType {
  dateFormat: DateFormat;
  toggleDateFormat: () => void;
}
const DateFormatContext = createContext<DateFormatContextType | undefined>(undefined);

const DateFormatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dateFormat, setDateFormat] = useLocalStorage<DateFormat>('dateFormat', 'DD/MM/YYYY');

  const toggleDateFormat = () => {
    setDateFormat(prev => (prev === 'DD/MM/YYYY' ? 'MM/DD/YYYY' : 'DD/MM/YYYY'));
  };

  return (
    <DateFormatContext.Provider value={{ dateFormat, toggleDateFormat }}>
      {children}
    </DateFormatContext.Provider>
  );
};

export const useDateFormat = () => {
  const context = useContext(DateFormatContext);
  if (context === undefined) {
    throw new Error('useDateFormat must be used within a DateFormatProvider');
  }
  return context;
};

// --- COMBINED PROVIDER ---
import { AuthProvider } from './AuthContext';
import { NotificationProvider } from './NotificationContext';

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <LocalizationProvider>
      <DateFormatProvider>
        <ThemeProvider>
          <NotificationProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </NotificationProvider>
        </ThemeProvider>
      </DateFormatProvider>
    </LocalizationProvider>
  );
};
