export const formatDate = (
    date: string | Date | null | undefined,
    fallback = '01/01/2024',
): string => {
    if (!date) return fallback;

    const dateObj = typeof date === 'string' ? new Date(date) : date;
    try {
        if (isNaN(dateObj.getTime())) return fallback;
        return dateObj.toLocaleDateString();
    } catch {
        return fallback;
    }
};

export const formatDateTime = (
    date: string | Date | null | undefined,
    fallback = 'N/A',
): string => {
    if (!date) return fallback;

    const dateObj = typeof date === 'string' ? new Date(date) : date;
    try {
        if (isNaN(dateObj.getTime())) {
            return fallback;
        }
        return dateObj.toLocaleString();
    } catch {
        return fallback;
    }
};

export const getRelativeTime = (date: string | Date): string => {
    const now = new Date();
    const past = typeof date === 'string' ? new Date(date) : date;
    const diffInMs = now.getTime() - past.getTime();

    const seconds = Math.floor(diffInMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (years > 0) return `${years} year${years > 1 ? 's' : ''} ago`;
    if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`;
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
};
