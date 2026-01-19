import React from 'react';
import { useLocalization } from '../context/AppProviders';

interface PrivacyPolicyModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
    const { language, t } = useLocalization();

    if (!isOpen) return null;

    // Content mapping
    const content = {
        en: {
            title: "Privacy Policy",
            intro: "Your privacy is important to us. This policy explains how we handle your data.",
            sections: [
                {
                    heading: "1. Data Collection",
                    text: "We collect your email address and basic profile information (name, avatar) to provide account services. We also store your Time Tracking data (spaces, time entries) to synchronize them across your devices."
                },
                {
                    heading: "2. Data Usage",
                    text: "Your data is used solely to provide the Time Tracking service. We do not sell your personal data to third parties."
                },
                {
                    heading: "3. Data Storage & Security",
                    text: "Your data is stored securely using Supabase (a backend-as-a-service provider). We use industry-standard encryption for data in transit and at rest."
                },
                {
                    heading: "4. Your Rights",
                    text: "You have the right to access, correct, or delete your data at any time. You can export your data or delete your account permanently through the Profile settings."
                }
            ]
        },
        es: {
            title: "Política de Privacidad",
            intro: "Tu privacidad es importante para nosotros. Esta política explica cómo manejamos tus datos.",
            sections: [
                {
                    heading: "1. Recopilación de Datos",
                    text: "Recopilamos tu dirección de correo electrónico e información básica de perfil (nombre, avatar) para proporcionar servicios de cuenta. También almacenamos tus datos de seguimiento de tiempo (espacios, registros) para sincronizarlos entre tus dispositivos."
                },
                {
                    heading: "2. Uso de Datos",
                    text: "Tus datos se utilizan únicamente para proporcionar el servicio de Time Tracker. No vendemos tus datos personales a terceros."
                },
                {
                    heading: "3. Almacenamiento y Seguridad",
                    text: "Tus datos se almacenan de forma segura utilizando Supabase (proveedor de backend como servicio). Utilizamos cifrado estándar de la industria para datos en tránsito y en reposo."
                },
                {
                    heading: "4. Tus Derechos",
                    text: "Tienes derecho a acceder, corregir o eliminar tus datos en cualquier momento. Puedes exportar tus datos o eliminar tu cuenta permanentemente a través de la configuración del Perfil."
                }
            ]
        }
    };

    const currentContent = language === 'es' ? content.es : content.en;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[80vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-scale-up border border-white/20" onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{currentContent.title}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto custom-scrollbar">
                    <p className="text-slate-600 dark:text-slate-300 mb-6 text-lg leading-relaxed">
                        {currentContent.intro}
                    </p>

                    <div className="space-y-6">
                        {currentContent.sections.map((section, index) => (
                            <div key={index}>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{section.heading}</h3>
                                <p className="text-slate-600 dark:text-gray-400 leading-relaxed text-sm">
                                    {section.text}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-black font-bold rounded-xl hover:opacity-90 transition-opacity"
                    >
                        {language === 'es' ? 'Entendido' : 'Understood'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicyModal;
