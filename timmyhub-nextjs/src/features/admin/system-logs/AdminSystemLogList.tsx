'use client';

import { useMemo, useCallback, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { systemLogsService, type SystemLog, type SystemLogDetail } from '@/services/system-logs.service';
import { Flex, Text, Loader, Center } from '@mantine/core';
import Iconify from '@/components/iconify/Iconify';
import { ManagementPage } from '@/components/shared/ManagementPage';
import { useManagementTabs, TabItem } from '@/hooks/useManagementTabs';
import { ManagementTabType } from '@/types/enums';
import { createSystemLogColumns } from '@/constants/column';
import { QUERY_KEYS } from '@/constants';
import { SystemLogDetailView } from './SystemLogDetail';

export function AdminSystemLogList() {
    const { data: res, isLoading, refetch } = useQuery({
        queryKey: QUERY_KEYS.ADMIN_SYSTEM_LOGS,
        queryFn: () => systemLogsService.getLogs({ page: 1, limit: 1000 }),
    });

    const logs = useMemo(() => res?.data || [], [res?.data]);

    const { activeTab, setActiveTab, openTabs, closeTab, handleAction } =
        useManagementTabs<SystemLog>('System Log');

    const [loadingDetails, setLoadingDetails] = useState<Record<string, boolean>>({});
    const [logDetails, setLogDetails] = useState<Record<string, SystemLogDetail>>({});

    // Get the active detail tab's log ID
    const activeDetailLogId = useMemo(() => {
        const activeTabData = openTabs.find(tab => tab.id === activeTab);
        if (activeTabData?.type === ManagementTabType.DETAIL && activeTabData.data) {
            return activeTabData.data.id;
        }
        return null;
    }, [activeTab, openTabs]);

    // Load detail when a detail tab becomes active
    useEffect(() => {
        if (!activeDetailLogId) return;

        // If already loaded or loading, skip
        if (logDetails[activeDetailLogId] || loadingDetails[activeDetailLogId]) {
            return;
        }

        // Load the detail
        const loadDetail = async () => {
            setLoadingDetails(prev => ({ ...prev, [activeDetailLogId]: true }));
            try {
                const detail = await systemLogsService.getLogDetail(activeDetailLogId);
                setLogDetails(prev => ({ ...prev, [activeDetailLogId]: detail }));
            } catch (error) {
                console.error('Failed to load log detail:', error);
            } finally {
                setLoadingDetails(prev => ({ ...prev, [activeDetailLogId]: false }));
            }
        };

        loadDetail();
    }, [activeDetailLogId, logDetails, loadingDetails]);

    const renderTabContent = useCallback((tab: TabItem<SystemLog>) => {
        if (tab.type === ManagementTabType.DETAIL && tab.data) {
            const detail = logDetails[tab.data.id];
            const isLoading = loadingDetails[tab.data.id];

            if (isLoading) {
                return (
                    <Center h={400}>
                        <Loader size="lg" />
                    </Center>
                );
            }

            if (!detail) {
                return (
                    <Flex direction="column" gap="md" p="md">
                        <Text c="dimmed">Đang tải dữ liệu...</Text>
                    </Flex>
                );
            }

            return <SystemLogDetailView log={detail} />;
        }
        return null;
    }, [logDetails, loadingDetails]);

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
