'use client';

import { useState, useCallback } from 'react';
import { ManagementTabType } from '@/types/enums';

export interface TabItem<T> {
    id: string;
    label: string;
    type: ManagementTabType;
    data?: T;
}

export const useManagementTabs = <T extends { id: string }>(entityName: string) => {
    const [activeTab, setActiveTab] = useState<string | null>(ManagementTabType.LIST);
    const [openTabs, setOpenTabs] = useState<TabItem<T>[]>([
        { id: ManagementTabType.LIST, label: `${entityName} List`, type: ManagementTabType.LIST },
    ]);

    const closeTab = useCallback(
        (tabId: string) => {
            if (tabId === ManagementTabType.LIST) return;
            setOpenTabs(prev => {
                const newTabs = prev.filter(t => t.id !== tabId);
                if (activeTab === tabId) {
                    const currentIdx = prev.findIndex(t => t.id === tabId);
                    const nextTab = newTabs[currentIdx - 1] || newTabs[0];
                    setActiveTab(nextTab?.id || ManagementTabType.LIST);
                }
                return newTabs;
            });
        },
        [activeTab],
    );

    const addTab = useCallback(
        (type: ManagementTabType, data?: T, idSuffix?: string) => {
            const id =
                type === ManagementTabType.CREATE
                    ? ManagementTabType.CREATE
                    : `${type}-${idSuffix || data?.id}`;
            setOpenTabs(prev => {
                if (prev.find(t => t.id === id)) return prev;
                return [
                    ...prev,
                    {
                        id,
                        type,
                        data,
                        label:
                            type === ManagementTabType.CREATE
                                ? `New ${entityName}`
                                : `${type.charAt(0).toUpperCase() + type.slice(1)}: ${idSuffix || data?.id}`,
                    },
                ];
            });
            setActiveTab(id);
        },
        [entityName],
    );

    const handleAction = useCallback(
        (action: 'Create' | 'Update' | 'Detail' | 'Edit', data?: T, idSuffix?: string) => {
            const typeMap: Record<string, ManagementTabType> = {
                Create: ManagementTabType.CREATE,
                Update: ManagementTabType.UPDATE,
                Edit: ManagementTabType.UPDATE,
                Detail: ManagementTabType.DETAIL,
            };
            addTab(typeMap[action], data, idSuffix);
        },
        [addTab],
    );

    return {
        activeTab,
        setActiveTab,
        openTabs,
        addTab,
        closeTab,
        handleAction,
    };
};
