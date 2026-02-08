import { useState, useCallback } from 'react';
import Cookies from 'js-cookie';

export function useCookie(
    key: string,
    initialValue: string | null = null,
    options?: Cookies.CookieAttributes
) {
    const [item, setItem] = useState<string | null>(() => {
        const cookie = Cookies.get(key);
        if (cookie) return cookie;
        return initialValue;
    });

    const updateItem = useCallback(
        (value: string, cookieOptions?: Cookies.CookieAttributes) => {
            setItem(value);
            Cookies.set(key, value, cookieOptions || options);
        },
        [key, options]
    );

    const removeItem = useCallback(() => {
        setItem(null);
        Cookies.remove(key);
    }, [key]);

    return [item, updateItem, removeItem] as const;
}
