import React from 'react';
import { LegalPageLayout } from '../../components/LegalPageLayout';

const TermsOfService = () => {
    return (
        <LegalPageLayout title="Términos y Condiciones" lastUpdated="07/02/2026">
            <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded-r mb-8">
                <p className="text-amber-900 dark:text-amber-100 text-sm m-0">
                    <strong>Resumen rápido:</strong> Esta es una aplicación de portafolio personal ("hobby project"). Úsala libremente para mejorar tu productividad, pero ten en cuenta que se ofrece "tal cual" y sin garantías comerciales.
                </p>
            </div>

            <section className="mb-8">
                <h3 className="flex items-center gap-2 text-xl font-semibold mb-4 text-slate-800 dark:text-slate-100">
                    <span className="material-symbols-outlined text-primary">description</span>
                    1. Descripción del Servicio
                </h3>
                <p>
                    Time Tracker es una herramienta de productividad diseñada para ayudar a los usuarios a registrar y gestionar su tiempo. Se ofrece como un proyecto de código abierto y educativo.
                </p>
            </section>

            <section className="mb-8">
                <h3 className="flex items-center gap-2 text-xl font-semibold mb-4 text-slate-800 dark:text-slate-100">
                    <span className="material-symbols-outlined text-primary">do_not_touch</span>
                    2. Uso Aceptable
                </h3>
                <p>
                    Usted se compromete a utilizar el servicio de manera ética. Queda prohibido:
                </p>
                <ul className="list-disc pl-5 space-y-1 mt-2">
                    <li>Utilizar el servicio para fines ilegales.</li>
                    <li>Intentar vulnerar la seguridad de la aplicación o de otros usuarios.</li>
                    <li>Realizar ingeniería inversa o abusar de la API de sincronización (spamming).</li>
                </ul>
            </section>

            <section className="mb-8">
                <h3 className="flex items-center gap-2 text-xl font-semibold mb-4 text-slate-800 dark:text-slate-100">
                    <span className="material-symbols-outlined text-primary">vpn_key</span>
                    3. Cuentas y Seguridad
                </h3>
                <p>
                    Usted es responsable de mantener la confidencialidad de su contraseña. Recomendamos usar contraseñas seguras y únicas. No nos hacemos responsables de pérdidas derivadas de un uso no autorizado de su cuenta si la brecha de seguridad se debe a un descuido en la custodia de sus credenciales.
                </p>
            </section>

            <section className="mb-8">
                <h3 className="flex items-center gap-2 text-xl font-semibold mb-4 text-slate-800 dark:text-slate-100">
                    <span className="material-symbols-outlined text-primary">copyright</span>
                    4. Propiedad Intelectual y Licencia
                </h3>
                <p>
                    El código fuente de este proyecto se comparte bajo una licencia <strong>No Comercial</strong>.
                </p>
                <div className="flex flex-col gap-2 mt-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                        <span className="material-symbols-outlined text-sm">check</span>
                        <span className="text-sm font-medium">Puedes: Usar, estudiar y modificar el código para uso personal/educativo.</span>
                    </div>
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                        <span className="material-symbols-outlined text-sm">close</span>
                        <span className="text-sm font-medium">No puedes: Vender, redistribuir comercialmente o lucrarte con esta obra.</span>
                    </div>
                </div>
            </section>

            <section className="mb-8">
                <h3 className="flex items-center gap-2 text-xl font-semibold mb-4 text-slate-800 dark:text-slate-100">
                    <span className="material-symbols-outlined text-primary">warning</span>
                    5. Limitación de Responsabilidad
                </h3>
                <p className="text-justify">
                    En la máxima medida permitida por la ley, Time Tracker y su desarrollador no serán responsables de daños indirectos, pérdida de datos o interrupciones del servicio.
                </p>
                <p className="mt-2 text-sm text-slate-500 italic border-l-2 border-slate-300 pl-3">
                    "El software se proporciona 'tal cual', sin garantía de ningún tipo, expresa o implícita..."
                </p>
            </section>

            <section className="mb-8">
                <h3 className="flex items-center gap-2 text-xl font-semibold mb-4 text-slate-800 dark:text-slate-100">
                    <span className="material-symbols-outlined text-primary">gavel</span>
                    6. Legislación y Jurisdicción
                </h3>
                <p>
                    Estos términos se rigen por la legislación española. Para cualquier controversia que pudiera surgir, ambas partes se someten a los juzgados y tribunales de <strong>Totana (Murcia)</strong>, renunciando a cualquier otro fuero que pudiera corresponderles.
                </p>
            </section>

            <section>
                <h3 className="flex items-center gap-2 text-xl font-semibold mb-4 text-slate-800 dark:text-slate-100">
                    <span className="material-symbols-outlined text-primary">edit</span>
                    7. Modificaciones
                </h3>
                <p>
                    Nos reservamos el derecho de modificar estos términos. Notificaremos cambios importantes, pero es su responsabilidad revisar esta página periódicamente.
                </p>
            </section>
        </LegalPageLayout>
    );
};

export default TermsOfService;
