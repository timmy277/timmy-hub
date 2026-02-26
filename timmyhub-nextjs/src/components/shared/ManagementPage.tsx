'use client';

import { useState, ReactNode, useCallback } from 'react';
import { useMounted } from '@mantine/hooks';
import {
    Container,
    Tabs,
    Stack,
    Group,
    Button,
    ActionIcon,
    Popover,
    Paper,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
    IconPlus,
    IconRefresh,
    IconX,
    IconColumns,
    IconFileSpreadsheet,
    IconRotateClockwise,
    IconFileText,
} from '@tabler/icons-react';
import {
    GridApi,
    GridReadyEvent,
    ColDef,
    Column,
    ModuleRegistry,
    ColumnApiModule,
    CsvExportModule,
    EventApiModule,
} from 'ag-grid-community';
import { BaseDataTable } from '@/components/tables/BaseDataTable';
import { DashboardShell } from '@/components/layout';
import { TabItem } from '@/hooks/useManagementTabs';
import { ManagementTabType } from '@/types/enums';

// Sub-components
import { SearchInput } from './management/SearchInput';
import { ColumnManagement } from './management/ColumnManagement';

// Ensure modules are registered for API usage
ModuleRegistry.registerModules([ColumnApiModule, CsvExportModule, EventApiModule]);

interface ManagementPageProps<T> {
    entityName: string;
    rowData: T[];
    columnDefs: ColDef<T>[];
    isLoading?: boolean;
    onRefresh: () => void;
    onAdd?: () => void;
    renderTabContent: (tab: TabItem<T>) => ReactNode;
    searchPlaceholder?: string;
    listIcon?: ReactNode;

    // Controlled Tabs
    activeTab: string | null;
    setActiveTab: (val: string | null) => void;
    openTabs: TabItem<T>[];
    closeTab: (id: string) => void;
}

export function ManagementPage<T>({
    entityName,
    rowData,
    columnDefs,
    isLoading = false,
    onRefresh,
    onAdd,
    renderTabContent,
    searchPlaceholder = 'Tìm kiếm...',
    listIcon = null,
    activeTab,
    setActiveTab,
    openTabs,
    closeTab,
}: ManagementPageProps<T>) {
    // ===== Hooks & Context =====
    const mounted = useMounted();
    const baseId = entityName.toLowerCase();
    const [gridApi, setGridApi] = useState<GridApi<T> | null>(null);
    const [columnPinnedState, setColumnPinnedState] = useState<
        Record<string, boolean | 'left' | 'right' | null | undefined>
    >({});

    // ===== Callbacks =====
    const onGridReady = useCallback((params: GridReadyEvent<T>) => {
        setGridApi(params.api);

        const updatePinnedState = () => {
            const colState: Record<string, boolean | 'left' | 'right' | null | undefined> = {};
            params.api.getAllGridColumns().forEach((col: Column) => {
                colState[col.getColId()] = col.getPinned();
            });
            setColumnPinnedState(colState);
        };

        updatePinnedState();
        params.api.addEventListener('columnPinned', updatePinnedState);
    }, []);

    const handleSearch = useCallback((val: string) => {
        if (gridApi) {
            gridApi.setGridOption('quickFilterText', val);
        }
    }, [gridApi]);

    const handleRefresh = useCallback(() => {
        onRefresh();
        notifications.show({
            title: 'Đã làm mới',
            message: 'Dữ liệu đang được cập nhật...',
            color: 'blue',
        });
    }, [onRefresh]);

    const handleReset = useCallback(() => {
        if (gridApi) {
            gridApi.setGridOption('quickFilterText', '');
            gridApi.setFilterModel(null);

            const defaultState = columnDefs.flatMap(col => {
                let colId = col.colId;
                if (!colId && col.field) colId = col.field as string;
                if (!colId) return [];
                return [{ colId, pinned: col.pinned, hide: false as const, width: col.width }];
            });

            try {
                if (defaultState.length > 0) {
                    gridApi.applyColumnState({
                        state: defaultState,
                        defaultState: { sort: null, pinned: null },
                    });
                }
            } catch (error) {
                console.error('Error resetting column state:', error);
            }
        }
    }, [gridApi, columnDefs]);

    // ===== Final Render =====
    if (!mounted) return null;

    return (
        <DashboardShell withFooter={false}>
            <Container fluid px="1rem" py="md">
                <Paper shadow="md" radius="md" withBorder p="md">
                    <Tabs
                        id={`${baseId}-tabs`}
                        value={activeTab}
                        onChange={setActiveTab}
                        variant="outline"
                        radius="md"
                    >
                        <Tabs.List mb="md">
                            {openTabs.map(tab => (
                                <Tabs.Tab
                                    key={tab.id}
                                    value={tab.id}
                                    leftSection={
                                        tab.id === ManagementTabType.LIST ? (
                                            listIcon || <IconFileText size={16} />
                                        ) : (
                                            <IconFileText size={16} />
                                        )
                                    }
                                    rightSection={
                                        tab.id !== ManagementTabType.LIST ? (
                                            <ActionIcon
                                                size="sm"
                                                variant="subtle"
                                                color="gray"
                                                component="div"
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    closeTab(tab.id);
                                                }}
                                            >
                                                <IconX size={14} />
                                            </ActionIcon>
                                        ) : null
                                    }
                                >
                                    {tab.label}
                                </Tabs.Tab>
                            ))}
                        </Tabs.List>

                        {openTabs.map(tab => (
                            <Tabs.Panel key={tab.id} value={tab.id}>
                                {tab.id === ManagementTabType.LIST ? (
                                    <Stack gap="lg" mt="md">
                                        <Group justify="space-between">
                                            <SearchInput
                                                placeholder={searchPlaceholder}
                                                onSearch={handleSearch}
                                                baseId={baseId}
                                            />
                                            <Group>
                                                <Button
                                                    variant="outline"
                                                    onClick={handleRefresh}
                                                    leftSection={<IconRefresh size={16} />}
                                                    loading={isLoading}
                                                >
                                                    Làm mới
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    color="orange"
                                                    onClick={handleReset}
                                                    leftSection={<IconRotateClockwise size={16} />}
                                                >
                                                    Reset
                                                </Button>
                                                <Popover
                                                    id={`${baseId}-columns-popover`}
                                                    width={300}
                                                    position="bottom-end"
                                                    withArrow
                                                    shadow="md"
                                                >
                                                    <Popover.Target>
                                                        <Button
                                                            variant="outline"
                                                            color="blue"
                                                            leftSection={<IconColumns size={16} />}
                                                        >
                                                            Cột
                                                        </Button>
                                                    </Popover.Target>
                                                    <Popover.Dropdown>
                                                        <ColumnManagement
                                                            columnDefs={columnDefs}
                                                            gridApi={gridApi}
                                                            columnPinnedState={columnPinnedState}
                                                        />
                                                    </Popover.Dropdown>
                                                </Popover>
                                                <Button
                                                    variant="outline"
                                                    color="green"
                                                    leftSection={<IconFileSpreadsheet size={16} />}
                                                    onClick={() => gridApi?.exportDataAsCsv()}
                                                >
                                                    Xuất CSV
                                                </Button>
                                                {onAdd && (
                                                    <Button
                                                        leftSection={<IconPlus size={16} />}
                                                        onClick={onAdd}
                                                    >
                                                        Thêm {entityName}
                                                    </Button>
                                                )}
                                            </Group>
                                        </Group>

                                        <BaseDataTable
                                            rowData={rowData}
                                            columnDefs={columnDefs}
                                            onGridReady={onGridReady}
                                            isLoading={isLoading}
                                            height="calc(100vh - 350px)"
                                        />
                                    </Stack>
                                ) : (
                                    renderTabContent(tab)
                                )}
                            </Tabs.Panel>
                        ))}
                    </Tabs>
                </Paper>
            </Container>
        </DashboardShell>
    );
}
