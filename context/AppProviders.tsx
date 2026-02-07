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