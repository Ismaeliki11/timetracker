import React from 'react';
import { LegalPageLayout } from '../../components/LegalPageLayout';

const CookiesPolicy = () => {
    return (
        <LegalPageLayout title="Política de Cookies" lastUpdated="07/02/2026">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-8">
                <p className="m-0 text-blue-900 dark:text-blue-100 flex items-center gap-2">
                    <span className="material-symbols-outlined">info</span>
                    <strong>En resumen:</strong> Solo usamos las cookies estrictamente necesarias para que la app funcione. No hay rastreadores publicitarios.
                </p>
            </div>

            <section className="mb-8">
                <h3 className="flex items-center gap-2 text-xl font-semibold mb-4 text-slate-800 dark:text-slate-100">
                    <span className="material-symbols-outlined text-primary">help</span>
                    1. ¿Qué son las Cookies?
                </h3>
                <p>
                    Las cookies son pequeños archivos de texto que los sitios web guardan en su dispositivo. Son como "notas adhesivas" digitales que permiten recordar quién es usted y sus preferencias.
                </p>
            </section>

            <section className="mb-8">
                <h3 className="flex items-center gap-2 text-xl font-semibold mb-4 text-slate-800 dark:text-slate-100">
                    <span className="material-symbols-outlined text-primary">cookie</span>
                    2. Tipos de Cookies que utilizamos
                </h3>
                <p className="mb-4">
                    Time Tracker utiliza <strong>exclusivamente cookies técnicas</strong>. Estas son vitales para el funcionamiento de la aplicación:
                </p>

                <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 hover:border-primary/30 transition-colors pointer-events-none">
                        <div className="p-2 bg-white dark:bg-slate-700 rounded shadow-sm text-primary">
                            <span className="material-symbols-outlined">vpn_key</span>
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1">Cookies de Sesión (Supabase)</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Gestionan su identidad segura. Sin ellas, tendría que introducir su contraseña en cada acción que realice.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 hover:border-primary/30 transition-colors pointer-events-none">
                        <div className="p-2 bg-white dark:bg-slate-700 rounded shadow-sm text-primary">
                            <span className="material-symbols-outlined">settings</span>
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1">Almacenamiento Local (Local Storage)</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Guardamos sus preferencias visuales (Modo Oscuro) y su configuración de idioma en su propio navegador para que no tenga que reconfigurarlas cada vez.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mb-8">
                <h3 className="flex items-center gap-2 text-xl font-semibold mb-4 text-slate-800 dark:text-slate-100">
                    <span className="material-symbols-outlined text-primary">settings_applications</span>
                    3. Gestión de Cookies
                </h3>
                <p>
                    Dado que solo utilizamos cookies clasificadas como "estrictamente necesarias" por la normativa europea (LSSI), no requerimos un banner de consentimiento previo.
                </p>
                <p className="mt-2">
                    Si desea, puede bloquear estas cookies desde la configuración de su navegador, pero le advertimos que <strong>la aplicación dejará de funcionar correctamente</strong> (no podrá iniciar sesión).
                </p>
            </section>
        </LegalPageLayout>
    );
};

export default CookiesPolicy;
