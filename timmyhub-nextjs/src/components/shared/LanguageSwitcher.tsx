'use client';

import {
    ActionIcon,
    Menu,
    rem,
    Tooltip,
} from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useThemeStore } from '@/stores/useThemeStore';

const FlagVN = () => (
    <svg viewBox="0 0 30 20" style={{ width: rem(20), height: rem(14), borderRadius: rem(2) }}>
        <rect width="30" height="20" fill="#da251d" />
        <polygon
            fill="#ffff00"
            points="15,4 16.12,8.47 20.75,8.47 17.01,11.23 18.13,15.71 14.39,12.95 10.65,15.71 11.77,11.23 8.03,8.47 12.66,8.47"
        />
    </svg>
);

const FlagUK = () => (
    <svg viewBox="0 0 60 30" style={{ width: rem(20), height: rem(14), borderRadius: rem(2) }}>
        <clipPath id="s">
            <path d="M0,0 v30 h60 v-30 z" />
        </clipPath>
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#012169" strokeWidth="4" />
        <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
        <path d="M30,0 v30 M0,15 h60" stroke="#c8102e" strokeWidth="6" />
        <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#s)" stroke="#c8102e" strokeWidth="2" />
    </svg>
);

export function LanguageSwitcher() {
    const { i18n } = useTranslation();
    const primaryColor = useThemeStore((state) => state.primaryColor);

    const handleLanguageChange = (lang: string) => {
        i18n.changeLanguage(lang);
    };

    const currentLanguage = i18n.language || 'en';

    return (
        <Menu shadow="md" width={140} position="bottom-end" transitionProps={{ transition: 'pop-top-right' }}>
            <Menu.Target>
                <Tooltip label="Change language">
                    <ActionIcon variant="default" size="lg" radius="md">
                        {currentLanguage.startsWith('vi') ? <FlagVN /> : <FlagUK />}
                    </ActionIcon>
                </Tooltip>
            </Menu.Target>

            <Menu.Dropdown>
                <Menu.Label>Select Language</Menu.Label>
                <Menu.Item
                    leftSection={<FlagUK />}
                    onClick={() => handleLanguageChange('en')}
                    rightSection={!currentLanguage.startsWith('vi') && <IconCheck size={14} color={`var(--mantine-color-${primaryColor}-filled)`} />}
                >
                    English
                </Menu.Item>
                <Menu.Item
                    leftSection={<FlagVN />}
                    onClick={() => handleLanguageChange('vi')}
                    rightSection={currentLanguage.startsWith('vi') && <IconCheck size={14} color={`var(--mantine-color-${primaryColor}-filled)`} />}
                >
                    Tiếng Việt
                </Menu.Item>
            </Menu.Dropdown>
        </Menu>
    );
}
