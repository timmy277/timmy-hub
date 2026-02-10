'use client';

import { ActionIcon, Menu, Tooltip } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useThemeStore } from '@/stores/useThemeStore';
import { FlagVN, FlagUK } from '@/components/common';

export function LanguageSwitcher() {
    const { i18n } = useTranslation();
    const primaryColor = useThemeStore(state => state.primaryColor);

    const handleLanguageChange = (lang: string) => {
        i18n.changeLanguage(lang);
    };

    const currentLanguage = i18n.language || 'en';

    return (
        <Menu
            shadow="md"
            width={140}
            position="bottom-end"
            transitionProps={{ transition: 'pop-top-right' }}
        >
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
                    rightSection={
                        !currentLanguage.startsWith('vi') && (
                            <IconCheck
                                size={14}
                                color={`var(--mantine-color-${primaryColor}-filled)`}
                            />
                        )
                    }
                >
                    English
                </Menu.Item>
                <Menu.Item
                    leftSection={<FlagVN />}
                    onClick={() => handleLanguageChange('vi')}
                    rightSection={
                        currentLanguage.startsWith('vi') && (
                            <IconCheck
                                size={14}
                                color={`var(--mantine-color-${primaryColor}-filled)`}
                            />
                        )
                    }
                >
                    Tiếng Việt
                </Menu.Item>
            </Menu.Dropdown>
        </Menu>
    );
}
