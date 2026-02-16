'use client';

import { ActionIcon, Menu, Tooltip } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useThemeStore } from '@/stores/useThemeStore';
import { FlagVN, FlagUK } from '@/components/common';

// ===== Data =====
const languages = [
    { code: 'en', label: 'English', flag: <FlagUK /> },
    { code: 'vi', label: 'Tiếng Việt', flag: <FlagVN /> },
];

export function LanguageSwitcher() {
    // ===== Hooks & Context =====
    const { i18n, t } = useTranslation();
    const primaryColor = useThemeStore(state => state.primaryColor);

    // ===== Event Handlers =====
    const handleLanguageChange = (lang: string) => {
        i18n.changeLanguage(lang);
    };

    // ===== Component Logic =====
    const currentLanguage = i18n.language || 'en';

    // ===== Final Render =====
    return (
        <Menu
            shadow="md"
            width={160}
            position="bottom-end"
            transitionProps={{ transition: 'pop-top-right' }}
        >
            <Menu.Target>
                <Tooltip label={t('Change language') || 'Change language'}>
                    <ActionIcon variant="default" size="lg" radius="md">
                        {currentLanguage.startsWith('vi') ? <FlagVN /> : <FlagUK />}
                    </ActionIcon>
                </Tooltip>
            </Menu.Target>

            <Menu.Dropdown>
                <Menu.Label>{t('Select Language') || 'Select Language'}</Menu.Label>
                {languages.map(lang => {
                    const isActive = currentLanguage.startsWith(lang.code);
                    return (
                        <Menu.Item
                            key={lang.code}
                            leftSection={lang.flag}
                            onClick={() => handleLanguageChange(lang.code)}
                            classNames={{
                                itemLabel: 'whitespace-nowrap',
                            }}
                            rightSection={
                                isActive && (
                                    <IconCheck
                                        size={14}
                                        color={`var(--mantine-color-${primaryColor}-filled)`}
                                    />
                                )
                            }
                        >
                            {lang.label}
                        </Menu.Item>
                    );
                })}
            </Menu.Dropdown>
        </Menu>
    );
}
