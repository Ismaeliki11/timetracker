import React from 'react';
import { LegalPageLayout } from '../../components/LegalPageLayout';

const PrivacyPolicy = () => {
    return (
        <LegalPageLayout title="Política de Privacidad" lastUpdated="07/02/2026">
            <div className="intro-text mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-primary">
                <p className="m-0">
                    En <strong>Time Tracker</strong> ("nosotros", "nuestro"), valoramos profundamente su privacidad. Esta Política explica de forma transparente cómo tratamos su información.
                </p>
            </div>

            <section className="mb-8">
                <h3 className="flex items-center gap-2 text-xl font-semibold mb-4 text-slate-800 dark:text-slate-100">
                    <span className="material-symbols-outlined text-primary">security</span>
                    1. Responsable del Tratamiento
                </h3>
                <p>
                    El responsable del tratamiento de sus datos es <strong>Ismael Flores Andreo (Ismaeliki)</strong>.<br />
                    Para cualquier duda relacionada con la privacidad, puede contactar en: <a href="mailto:ismaeliki11@gmail.com" className="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded hover:underline text-primary">ismaeliki11@gmail.com</a>
                </p>
            </section>

            <section className="mb-8">
                <h3 className="flex items-center gap-2 text-xl font-semibold mb-4 text-slate-800 dark:text-slate-100">
                    <span className="material-symbols-outlined text-primary">folder_shared</span>
                    2. Información que Recopilamos
                </h3>
                <p>Recopilamos únicamente la información necesaria para que la aplicación funcione:</p>
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                        <strong className="block text-primary mb-1">Información de Cuenta</strong>
                        <span className="text-sm">Dirección de correo electrónico y contraseña (esta última encriptada) al registrarse.</span>
                    </div>
                    <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                        <strong className="block text-primary mb-1">Datos de Uso</strong>
                        <span className="text-sm">Sus entradas de tiempo, nombres de espacios ("Spaces") y configuraciones personales.</span>
                    </div>
                    <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 md:col-span-2">
                        <strong className="block text-primary mb-1">Datos Técnicos</strong>
                        <span className="text-sm">Dirección IP y metadatos de conexión necesarios para la seguridad y sincronización con Supabase.</span>
                    </div>
                </div>
            </section>

            <section className="mb-8">
                <h3 className="flex items-center gap-2 text-xl font-semibold mb-4 text-slate-800 dark:text-slate-100">
                    <span className="material-symbols-outlined text-primary">target</span>
                    3. Finalidad del Tratamiento
                </h3>
                <p>Usamos sus datos exclusivamente para:</p>
                <ul className="list-none pl-0 space-y-2 mt-2">
                    <li className="flex gap-2">
                        <span className="material-symbols-outlined text-green-500 text-sm mt-1">check_circle</span>
                        <span>Proporcionar, mantener y mejorar el servicio de seguimiento de tiempo.</span>
                    </li>
                    <li className="flex gap-2">
                        <span className="material-symbols-outlined text-green-500 text-sm mt-1">check_circle</span>
                        <span>Sincronizar sus datos entre todos sus dispositivos en tiempo real.</span>
                    </li>
                    <li className="flex gap-2">
                        <span className="material-symbols-outlined text-green-500 text-sm mt-1">check_circle</span>
                        <span>Autenticar su acceso seguro a la cuenta.</span>
                    </li>
                </ul>
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/10 text-red-800 dark:text-red-200 text-sm rounded border border-red-100 dark:border-red-900/30 font-medium text-center">
                    No vendemos ni compartimos sus datos con terceros con fines publicitarios.
                </div>
            </section>

            <section className="mb-8">
                <h3 className="flex items-center gap-2 text-xl font-semibold mb-4 text-slate-800 dark:text-slate-100">
                    <span className="material-symbols-outlined text-primary">dns</span>
                    4. Almacenamiento de Datos
                </h3>
                <p>
                    Sus datos se almacenan de forma segura en los servidores de <strong>Supabase</strong> (nuestro proveedor de base de datos). Puede consultar su política de privacidad en <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">supabase.com/privacy</a>.
                </p>
            </section>

            <section className="mb-8">
                <h3 className="flex items-center gap-2 text-xl font-semibold mb-4 text-slate-800 dark:text-slate-100">
                    <span className="material-symbols-outlined text-primary">gavel</span>
                    5. Sus Derechos (RGPD)
                </h3>
                <p>
                    Usted tiene control total sobre sus datos. Tiene derecho a:
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                    <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-xs font-medium">Acceso</span>
                    <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-xs font-medium">Rectificación</span>
                    <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-xs font-medium">Supresión (Olvido)</span>
                    <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-xs font-medium">Portabilidad</span>
                </div>
                <p className="mt-4 text-sm text-slate-500">
                    Puede ejercer estos derechos contactándonos directamente o utilizando las herramientas de eliminación de cuenta dentro de la aplicación.
                </p>
            </section>

            <section>
                <h3 className="flex items-center gap-2 text-xl font-semibold mb-4 text-slate-800 dark:text-slate-100">
                    <span className="material-symbols-outlined text-primary">update</span>
                    6. Cambios en esta Política
                </h3>
                <p>
                    Podemos actualizar esta política ocasionalmente. Le notificaremos sobre cambios significativos a través de la aplicación o por correo electrónico.
                </p>
            </section>
        </LegalPageLayout>
    );
};

export default PrivacyPolicy;
