export const getWelcomeMessageKey = (isGuest: boolean): string => {
    const hour = new Date().getHours();

    let timeOfDay = 'default';
    if (hour >= 5 && hour < 12) timeOfDay = 'morning';
    else if (hour >= 12 && hour < 20) timeOfDay = 'afternoon';
    else timeOfDay = 'evening';

    // Different key sets for Guest vs User
    // Guest: Neutral, polite, inviting. NO NAMES.
    // User: Personalized, motivating.
    if (isGuest) {
        const guestKeys = {
            morning: ['guest_morning_1', 'guest_morning_2'],
            afternoon: ['guest_afternoon_1', 'guest_afternoon_2'],
            evening: ['guest_evening_1', 'guest_evening_2'],
            default: ['guest_default_1', 'guest_default_2']
        };
        const list = guestKeys[timeOfDay as keyof typeof guestKeys] || guestKeys.default;
        return list[Math.floor(Math.random() * list.length)];
    } else {
        const userKeys = {
            morning: ['motivational_morning_1', 'motivational_morning_2', 'motivational_morning_3'],
            afternoon: ['motivational_afternoon_1', 'motivational_afternoon_2', 'motivational_afternoon_3'],
            evening: ['motivational_evening_1', 'motivational_evening_2', 'motivational_evening_3'],
            default: ['motivational_default_1', 'motivational_default_2']
        };
        const list = userKeys[timeOfDay as keyof typeof userKeys] || userKeys.default;
        return list[Math.floor(Math.random() * list.length)];
    }
};
