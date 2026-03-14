'use client';

import { useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { systemLogsService, type SystemLog } from '@/services/system-logs.service';
import { Flex, Code, Text } from '@mantine/core';
import Iconify from '@/components/iconify/Iconify';
import { ManagementPage } from '@/components/shared/ManagementPage';
import { useManagementTabs, TabItem } from '@/hooks/useManagementTabs';
import { ManagementTabType } from '@/types/enums';
import { createSystemLogColumns } from '@/constants/column';
import { QUERY_KEYS } from '@/constants';

export default function SystemLogsPage() {
    const { data: res, isLoading, refetch } = useQuery({
        queryKey: QUERY_KEYS.ADMIN_SYSTEM_LOGS,
        queryFn: () => systemLogsService.getLogs({ page: 1, limit: 1000 }),
    });

    const logs = useMemo(() => res?.data || [], [res?.data]);

    const { activeTab, setActiveTab, openTabs, closeTab, handleAction } =
        useManagementTabs<SystemLog>('System Log');

    const renderTabContent = useCallback((tab: TabItem<SystemLog>) => {
        if (tab.type === ManagementTabType.DETAIL && tab.data) {
            return (
                <Flex direction="column" gap="md" p="md">
                    <Text fw={600}>Chi tiết System Log: {tab.data.action}</Text>
                    <Code block>{JSON.stringify(tab.data, null, 2)}</Code>
                </Flex>
            );
        }
        return null;
    }, []);

    const columnDefs = useMemo(
        () => createSystemLogColumns(log => handleAction('Detail', log)),
        [handleAction],
    );

    return (
        <ManagementPage<SystemLog>
            entityName="System Log"
            rowData={logs as SystemLog[]}
            columnDefs={columnDefs}
            isLoading={isLoading}
            onRefresh={refetch}
            renderTabContent={renderTabContent}
            searchPlaceholder="Tìm kiếm logs..."
            listIcon={<Iconify icon="tabler:activity" width={16} />}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            openTabs={openTabs}
            closeTab={closeTab}
        />
    );
}
