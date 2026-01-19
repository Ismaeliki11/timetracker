import React from 'react';
import { useLocalization } from '../context/AppProviders';

interface StatisticsInfoPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

const StatisticsInfoPanel: React.FC<StatisticsInfoPanelProps> = ({ isOpen, onClose }) => {
    const { t } = useLocalization();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-end justify-center animate-fade-in" onClick={onClose}>
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slide-up {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }
                .animate-fade-in { animation: fade-in 0.3s ease-out; }
                .animate-slide-up { animation: slide-up 0.3s ease-out; }
            `}</style>
            <div
                className="relative w-full max-w-md glass-pane rounded-t-2xl shadow-2xl flex flex-col p-6 animate-slide-up max-h-[85vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                {/* Drag Handle / Close indicator */}
                <div className="flex justify-center mb-4" onClick={onClose}>
                    <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                </div>

                <div className="flex items-center gap-3 mb-6">
                    <div className="h-12 w-12 flex items-center justify-center flex-shrink-0 bg-indigo-100 dark:bg-indigo-900/30 rounded-full text-indigo-600 dark:text-indigo-400">
                        <span className="material-symbols-outlined">analytics</span>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('stats_info_title') || "Statistics Guide"}</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{t('stats_info_subtitle') || "Understanding your data"}</p>
                    </div>
                </div>

                <div className="space-y-6 text-slate-700 dark:text-slate-300">

                    {/* Section 1: Overview */}
                    <div className="flex gap-3">
                        <span className="material-symbols-outlined text-slate-400 flex-shrink-0 mt-0.5">info</span>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1">{t('stats_info_overview_title') || "What is this?"}</h3>
                            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                                {t('stats_info_overview_text') || "Here you can see exactly how you've invested your time. The data is grouped to help you spot trends."}
                            </p>
                        </div>
                    </div>

                    {/* Section 2: Periods */}
                    <div className="flex gap-3">
                        <span className="material-symbols-outlined text-slate-400 flex-shrink-0 mt-0.5">calendar_today</span>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1">{t('stats_info_period_title') || "Periods"}</h3>
                            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                                {t('stats_info_period_text') || "Switch between Week, Month, or Custom ranges. The comparison (+/-) shows how this period compares to the previous one."}
                            </p>
                        </div>
                    </div>

                    {/* Section 3: Insights */}
                    <div className="flex gap-3">
                        <span className="material-symbols-outlined text-slate-400 flex-shrink-0 mt-0.5">lightbulb</span>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm mb-1">{t('stats_info_insights_title') || "Smart Insights"}</h3>
                            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                                {t('stats_info_insights_text') || "When we detect interesting patterns, an insight card will appear. If there's not enough data yet, it stays hidden."}
                            </p>
                        </div>
                    </div>

                    {/* Section 4: Actions */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700/50">
                        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">{t('stats_info_actions_title') || "Things you can do"}</h3>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-xs text-primary">check_circle</span>
                                <span>{t('stats_info_action_filter') || "Filter by custom dates"}</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-xs text-primary">check_circle</span>
                                <span>{t('stats_info_action_calculator') || "Convert time to earnings"}</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-xs text-primary">check_circle</span>
                                <span>{t('stats_info_action_analyze') || "Analyze top activities"}</span>
                            </li>
                        </ul>
                    </div>

                    {/* Footer / Disclaimer */}
                    <p className="text-xs text-slate-400 dark:text-slate-500 text-center pt-2 italic">
                        {t('stats_info_disclaimer') || "Data is based solely on your logged entries."}
                    </p>

                </div>

                <button
                    onClick={onClose}
                    className="mt-8 py-3 w-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl font-bold text-sm shadow-lg active:scale-[0.98] transition-all"
                >
                    {t('got_it') || "Got it"}
                </button>
            </div>
        </div>
    );
};

export default StatisticsInfoPanel;
