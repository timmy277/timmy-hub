
const LOCALE_VND = 'vi-VN';
const LOCALE_USD = 'en-US';
const CURRENCY_VND = 'VND';
const CURRENCY_USD = 'USD';

interface FormatCurrencyOptions {
    locale?: string;
    currency?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
}

export function formatCurrency(
    amount: number,
    options: FormatCurrencyOptions = {},
): string {
    const {
        locale = LOCALE_VND,
        currency = CURRENCY_VND,
        minimumFractionDigits = 0,
        maximumFractionDigits = currency === CURRENCY_USD ? 2 : 0,
    } = options;

    const formatted = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits,
        maximumFractionDigits,
        signDisplay: 'never',
    }).format(Math.abs(amount));

    return currency === CURRENCY_VND ? `${formatted.replace(/[^\d.,\s]/g, '').trim()} đ` : formatted;
}

export function formatVND(amount: number): string {
    return formatCurrency(amount, { locale: LOCALE_VND, currency: CURRENCY_VND });
}

export function formatUSD(amount: number): string {
    return formatCurrency(amount, { locale: LOCALE_USD, currency: CURRENCY_USD });
}

export function formatCompact(amount: number, threshold = 1000): string {
    if (Math.abs(amount) < threshold) return amount.toLocaleString('vi-VN');

    const abs = Math.abs(amount);

    if (abs >= 1_000_000_000) return `${(abs / 1_000_000_000).toFixed(1).replace(/\.0$/, '')}B`;
    if (abs >= 1_000_000) return `${(abs / 1_000_000).toFixed(1).replace(/\.0$/, '')}TR`;
    if (abs >= 1_000) return `${(abs / 1_000).toFixed(1).replace(/\.0$/, '')}K`;

    return abs.toLocaleString('vi-VN');
}
