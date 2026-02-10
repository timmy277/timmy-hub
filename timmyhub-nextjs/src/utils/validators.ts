import { TFunction } from 'i18next';

/**
 * Validator factory functions for form validation
 * @author TimmyHub AI
 */

export const createRequiredValidator = (t: TFunction, fieldKey: string) => {
    return (value: string | undefined | null) => {
        if (!value || value.trim().length === 0) {
            return t('validation.required', { field: t(fieldKey) });
        }
        return null;
    };
};

export const createEmailValidator = (t: TFunction, fieldKey: string) => {
    return (value: string | undefined | null) => {
        if (!value) {
            return t('validation.required', { field: t(fieldKey) });
        }
        return /^\S+@\S+$/.test(value) ? null : t('validation.invalidEmail');
    };
};

export const createPasswordValidator = (
    t: TFunction,
    fieldKey: string,
    minLength: number = 6,
    isOptional: boolean = false,
) => {
    return (value: string | undefined | null) => {
        if (isOptional && !value) {
            return null;
        }
        if (!value) {
            return t('validation.required', { field: t(fieldKey) });
        }
        return value.length < minLength
            ? t('validation.passwordMinLength', { min: minLength })
            : null;
    };
};

export const createMinLengthValidator = (t: TFunction, fieldKey: string, minLength: number) => {
    return (value: string | undefined | null) => {
        if (!value) {
            return t('validation.required', { field: t(fieldKey) });
        }
        return value.length < minLength
            ? t('validation.minLength', { field: t(fieldKey), min: minLength })
            : null;
    };
};
