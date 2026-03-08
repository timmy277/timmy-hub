'use client';

import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { systemLogsService, GetSystemLogsParams } from '@/services/system-logs.service';
import { Flex, Badge, Code, ActionIcon, Text } from '@mantine/core';
import { IconInfoCircle, IconActivity } from '@tabler/icons-react';
import { ColDef } from 'ag-grid-community';
import dayjs from 'dayjs';
import { ManagementPage } from '@/components/shared/ManagementPage';
import { useManagementTabs, TabItem } from '@/hooks/useManagementTabs';
import { ManagementTabType } from '@/types/enums';

// We may define a type or interface SystemLog to be clear.
interface SystemLog {
    id: string;
    createdAt: string;
    user?: { profile?: { lastName: string, firstName: string }, email: string };
    action: string;
    entityType: string;
    entityId: string;
    status: string;
    ipAddress: string;
    metadata: Record<string, unknown>;
}

export default function SystemLogsPage() {
    const [params] = useState<GetSystemLogsParams>({ page: 1, limit: 1000 }); // Increase limit since ManagementPage handles filtering via agGrid

    const { data: { data: result } = {}, isLoading, refetch } = useQuery({
        queryKey: ['system-logs', params],
        queryFn: () => systemLogsService.getLogs(params),
    });

    const logs = useMemo(() => result?.data || [], [result?.data]);

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

    const columnDefs: ColDef<SystemLog>[] = useMemo(() => [
        {
            field: 'createdAt',
            headerName: 'Thời gian',
            width: 170,
            valueFormatter: (params) =>
                params.value ? dayjs(params.value).format('DD/MM/YYYY HH:mm:ss') : '',
        },
        {
            field: 'user',
            headerName: 'Người thực hiện',
            width: 250,
            cellRenderer: (params: { data: SystemLog }) => {
                if (!params.data?.user) return <Text size="sm" c="dimmed">Hệ thống</Text>;
                return (
                    <Flex direction="column">
                        <Text size="sm" fw={500}>
                            {params.data.user.profile?.lastName} {params.data.user.profile?.firstName}
                        </Text>
                        <Text size="xs" c="dimmed">{params.data.user.email}</Text>
                    </Flex>
                );
            },
        },
        { field: 'action', headerName: 'Hành động', width: 220 },
        { field: 'entityType', headerName: 'Loại Data', width: 140 },
        { field: 'entityId', headerName: 'Data ID', width: 200 },
        {
            field: 'status',
            headerName: 'Trạng thái',
            width: 140,
            cellRenderer: (params: { value: string }) => (
                <Badge color={params.value === 'SUCCESS' ? 'green' : 'red'}>
                    {params.value}
                </Badge>
            ),
        },
        { field: 'ipAddress', headerName: 'IP', width: 150 },
        {
            field: 'metadata',
            headerName: 'Chi tiết (Metadata)',
            width: 180,
            cellRenderer: (params: { value: Record<string, unknown>, data: SystemLog }) => {
                if (!params.value || Object.keys(params.value).length === 0) return '-';
                return (
                    <ActionIcon variant="light" color="blue" onClick={(e) => {
                        e.stopPropagation();
                        handleAction('Detail', params.data);
                    }}>
                        <IconInfoCircle size="1rem" />
                    </ActionIcon>
                );
            },
        },
    ], [handleAction]);

    return (
        <ManagementPage<SystemLog>
            entityName="System Log"
            rowData={logs as SystemLog[]}
            columnDefs={columnDefs}
            isLoading={isLoading}
            onRefresh={() => refetch()}
            renderTabContent={renderTabContent}
            searchPlaceholder="Tìm kiếm logs..."
            listIcon={<IconActivity size={16} />}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            openTabs={openTabs}
            closeTab={closeTab}
        />
    );
}
