import { TimeEntry } from '../types';

export type InsightType = 'focus' | 'surge' | 'drop' | 'shift' | 'weekend' | 'consistency' | 'attention';

export interface InsightResult {
    textKey: string;
    textParams?: Record<string, string>;
    icon: string;
    type: InsightType;
}

// Helper to check if a day is weekend
const isWeekend = (dateStr: string): boolean => {
    const d = new Date(dateStr + 'T12:00:00');
    const day = d.getDay();
    return day === 0 || day === 6; // 0=Sun, 6=Sat
};

export const generateInsight = (
    currentEntries: TimeEntry[],
    previousEntries: TimeEntry[],
    totalHours: number,
    previousHours: number,
    t: (key: string, params?: any) => string // Pass translation function for strict key checking impact
): InsightResult | null => {

    // --- 0. ZERO NOISE POLICY (Global Thresholds) ---
    // If there is very little data, say nothing.
    if (totalHours < 2) return null;

    const diffHours = totalHours - previousHours;
    const diffPercent = previousHours > 0 ? (diffHours / previousHours) * 100 : 100;

    // Helper: Summarize by Tag
    const tagSummary: Record<string, number> = {};
    let unlabeledHours = 0;

    currentEntries.forEach(e => {
        if (e.tags && e.tags.length > 0) {
            e.tags.forEach(tag => {
                tagSummary[tag] = (tagSummary[tag] || 0) + e.duration;
            });
        } else {
            unlabeledHours += e.duration;
        }
    });

    const entriesByTag = Object.entries(tagSummary).sort((a, b) => b[1] - a[1]);
    const topTag = entriesByTag[0]; // [name, hours]

    // --- 1. DEEP FOCUS (The Specialist) ---
    // Trigger: One tag dominates (>60%) AND meaningful volume (>5h total)
    if (totalHours >= 5 && topTag) {
        const percentage = (topTag[1] / totalHours);
        if (percentage >= 0.60) {
            return {
                textKey: 'insight_focus',
                textParams: { tag: topTag[0] },
                icon: 'center_focus_strong',
                type: 'focus'
            };
        }
    }

    // --- 2. PRODUCTIVITY SURGE (The Hard Worker) ---
    // Trigger: Significant absolute increase (>2h) AND significant relative increase (>20%)
    if (diffHours >= 2 && diffPercent >= 20) {
        return {
            textKey: 'insight_surge',
            textParams: { diff: Math.round(diffHours).toString() },
            icon: 'trending_up',
            type: 'surge'
        };
    }

    // --- 3. DECOMPRESSION (Resting) ---
    // Trigger: Significant drops (-30%) after a busy prev period (>10h)
    // "Resting is part of the work"
    if (previousHours > 10 && diffPercent <= -30 && diffHours <= -3) {
        return {
            textKey: 'insight_drop',
            icon: 'battery_charging_full',
            type: 'drop'
        };
    }

    // --- 4. BEHAVIOR SHIFT (New Priority) ---
    // Trigger: A tag apparently increased a lot absolute wise (>2h) compared to prev period
    // Only if total hours didn't surge crazy amounts (to distinguish from just "working more")
    if (topTag && totalHours >= 5) {
        // Find this tag in previous period
        let prevTagHours = 0;
        previousEntries.forEach(e => {
            if (e.tags && e.tags.includes(topTag[0])) prevTagHours += e.duration;
        });

        const tagDiff = topTag[1] - prevTagHours;

        // If this tag grew by > 2 hours AND it represents a "Shift" (it wasn't already huge)
        // Check if prevTagHours was small strictly
        if (tagDiff >= 2 && (prevTagHours < 2 || tagDiff / prevTagHours > 0.5)) {
            return {
                textKey: 'insight_shift',
                textParams: { tag: topTag[0] },
                icon: 'swap_vert', // or 'priority_high'
                type: 'shift'
            };
        }
    }

    // --- 5. WEEKEND WARRIOR (Weekends) ---
    // Check if substantial work happened on Sat/Sun
    if (totalHours >= 5) {
        let weekendHours = 0;
        currentEntries.forEach(e => {
            if (isWeekend(e.date)) weekendHours += e.duration;
        });

        if (weekendHours / totalHours >= 0.30) {
            return {
                textKey: 'insight_weekend',
                icon: 'weekend',
                type: 'weekend'
            };
        }
    }

    // --- 6. CONSISTENCY (The Fallback) ---
    // Only if enough data (>10h) and very stable (±10%)
    if (totalHours >= 10 && Math.abs(diffPercent) <= 10) {
        return {
            textKey: 'insight_consistency',
            icon: 'fitness_center', // Strength/stability
            type: 'consistency'
        };
    }

    // --- NOISE FILTER: Unlabeled logic ---
    // If we have nothing else, and Unlabeled is HUGE (>80%) and volume is high (>5h)
    // Maybe a gentle nudge?
    // User said: "Indirect suggestion". 
    if (totalHours >= 5 && (unlabeledHours / totalHours) > 0.8) {
        return {
            textKey: 'insight_unlabeled',
            icon: 'label_off',
            type: 'attention'
        };
    }

    // Default: Silence is golden.
    return null;
};
