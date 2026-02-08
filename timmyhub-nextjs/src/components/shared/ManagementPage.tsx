'use client';

import { useState, useCallback, ReactNode, useId } from 'react';
import {
    Container,
    Tabs,
    Stack,
    Card,
    Group,
    TextInput,
    Button,
    ActionIcon,
    Popover,
    Checkbox,
    Text,
} from '@mantine/core';
import {
    IconSearch,
    IconPlus,
    IconRefresh,
    IconX,
    IconColumns,
    IconFileSpreadsheet,
    IconRotateClockwise,
    IconFileText,
    IconArrowBarToLeft,
    IconArrowBarToRight,
    IconPinnedOff,
} from '@tabler/icons-react';
import {
    GridApi,
    GridReadyEvent,
    ColDef,
    Column,
    ModuleRegistry,
    ColumnApiModule,
    CsvExportModule
} from 'ag-grid-community';
import { BaseDataTable } from '@/components/tables/BaseDataTable';
import { DashboardShell } from '@/components/layout';
import { TabItem } from '@/hooks/useManagementTabs';

// Ensure modules are registered for API usage
ModuleRegistry.registerModules([
    ColumnApiModule,
    CsvExportModule
]);

interface ManagementPageProps<T> {
    title: string;
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

/**
 * Component dùng chung cho các trang quản trị (CRUD)
 * Refactored từ DashboardPage theo yêu cầu
 * @author TimmyHub AI
 */
export function ManagementPage<T>({
    title,
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
    closeTab
}: ManagementPageProps<T>) {
    const baseId = useId();
    const [gridApi, setGridApi] = useState<GridApi<T> | null>(null);
    const [quickFilterText, setQuickFilterText] = useState('');
    const [columnPinnedState, setColumnPinnedState] = useState<Record<string, any>>({});

    const onGridReady = (params: GridReadyEvent<T>) => {
        setGridApi(params.api);
        const colState: Record<string, any> = {};
        params.api.getAllGridColumns().forEach((col: Column) => {
            colState[col.getColId()] = col.getPinned();
        });
        setColumnPinnedState(colState);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setQuickFilterText(val);
        gridApi?.setGridOption('quickFilterText', val);
    };

    const handleReset = () => {
        if (gridApi) {
            gridApi.setFilterModel(null);
            gridApi.applyColumnState({
                state: columnDefs.map(col => ({
                    colId: col.colId || (col.field as string),
                    pinned: col.pinned as any,
                    hide: false,
                    width: col.width
                })),
                defaultState: { sort: null, pinned: null }
            });
        }
    };

    return (
        <DashboardShell withFooter={false}>
            <Container fluid px="1rem" py="md">
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
                                leftSection={tab.id === 'list' ? (listIcon || <IconFileText size={16} />) : <IconFileText size={16} />}
                                rightSection={
                                    tab.id !== 'list' ? (
                                        <ActionIcon
                                            size="sm"
                                            variant="subtle"
                                            color="gray"
                                            component="div"
                                            onClick={(e) => {
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
                            {tab.id === 'list' ? (
                                <Stack gap="lg" mt="md">
                                    <Card shadow="sm" radius="md" withBorder padding="lg">
                                        <Stack gap="md">
                                            <Group justify="space-between">
                                                <TextInput
                                                    id={`${baseId}-search`}
                                                    placeholder={searchPlaceholder}
                                                    leftSection={<IconSearch size={16} stroke={1.5} />}
                                                    rightSection={quickFilterText ? (
                                                        <ActionIcon variant="transparent" c="dimmed" onClick={() => {
                                                            setQuickFilterText('');
                                                            gridApi?.setGridOption('quickFilterText', '');
                                                        }}>
                                                            <IconX size={14} />
                                                        </ActionIcon>
                                                    ) : null}
                                                    value={quickFilterText}
                                                    onChange={handleSearchChange}
                                                    w={350} radius="md" variant="filled"
                                                />
                                                <Group>
                                                    <Button variant="outline" onClick={onRefresh} leftSection={<IconRefresh size={16} />} loading={isLoading}>
                                                        Làm mới
                                                    </Button>
                                                    <Button variant="outline" color="orange" onClick={handleReset} leftSection={<IconRotateClockwise size={16} />}>
                                                        Reset
                                                    </Button>
                                                    <Popover id={`${baseId}-columns-popover`} width={300} position="bottom-end" withArrow shadow="md">
                                                        <Popover.Target>
                                                            <Button variant="outline" color="blue" leftSection={<IconColumns size={16} />}>Cột</Button>
                                                        </Popover.Target>
                                                        <Popover.Dropdown>
                                                            <Stack gap="xs">
                                                                {columnDefs.map(col => col.field ? (
                                                                    <Group key={col.field as string} justify="space-between">
                                                                        <Checkbox label={col.headerName} defaultChecked onChange={(e) => gridApi?.setColumnsVisible([col.field as string], e.currentTarget.checked)} style={{ flex: 1 }} />
                                                                        <Group gap={4}>
                                                                            <ActionIcon variant={columnPinnedState[col.field as string] === 'left' ? "filled" : "subtle"} size="sm" onClick={() => gridApi?.applyColumnState({ state: [{ colId: col.field as string, pinned: 'left' }], defaultState: { pinned: null } })}><IconArrowBarToLeft size={16} /></ActionIcon>
                                                                            <ActionIcon variant={!columnPinnedState[col.field as string] ? "filled" : "subtle"} size="sm" onClick={() => gridApi?.applyColumnState({ state: [{ colId: col.field as string, pinned: null }] })}><IconPinnedOff size={16} /></ActionIcon>
                                                                            <ActionIcon variant={columnPinnedState[col.field as string] === 'right' ? "filled" : "subtle"} size="sm" onClick={() => gridApi?.applyColumnState({ state: [{ colId: col.field as string, pinned: 'right' }], defaultState: { pinned: null } })}><IconArrowBarToRight size={16} /></ActionIcon>
                                                                        </Group>
                                                                    </Group>
                                                                ) : null)}
                                                            </Stack>
                                                        </Popover.Dropdown>
                                                    </Popover>
                                                    <Button variant="outline" color="green" leftSection={<IconFileSpreadsheet size={16} />} onClick={() => gridApi?.exportDataAsCsv()}>Xuất CSV</Button>
                                                    {onAdd && (
                                                        <Button leftSection={<IconPlus size={16} />} onClick={onAdd}>
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
                                    </Card>
                                </Stack>
                            ) : (
                                renderTabContent(tab)
                            )}
                        </Tabs.Panel>
                    ))}
                </Tabs>
            </Container>
        </DashboardShell>
    );
}
