
export const formatDate = (
    date: string | Date | null | undefined, 
    fallback = '01/01/2024'
): string => {
    if (!date) return fallback;
    
    try {
        return new Date(date).toLocaleDateString();
    } catch {
        return fallback;
    }
};

export const formatDateWithOptions = (
    date: string | Date | null | undefined,
    options: Intl.DateTimeFormatOptions = {},
    fallback = 'N/A'
): string => {
    if (!date) return fallback;
    
    try {
        return new Date(date).toLocaleDateString(undefined, options);
    } catch {
        return fallback;
    }
};

export const toISOString = (date: string | Date | null | undefined): string | null => {
    if (!date) return null;
    
    try {
        return new Date(date).toISOString();
    } catch {
        return null;
    }
};

export const isValidDate = (date: string | Date | null | undefined): boolean => {
    if (!date) return false;
    
    try {
        const d = new Date(date);
        return !isNaN(d.getTime());
    } catch {
        return false;
    }
};
