'use client';

import { useState, ReactNode } from 'react';
import { useMounted } from '@mantine/hooks';
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
    Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
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
    CsvExportModule,
    EventApiModule,
} from 'ag-grid-community';
import { BaseDataTable } from '@/components/tables/BaseDataTable';
import { DashboardShell } from '@/components/layout';
import { TabItem } from '@/hooks/useManagementTabs';
import { ManagementTabType } from '@/types/enums';

// Ensure modules are registered for API usage
ModuleRegistry.registerModules([ColumnApiModule, CsvExportModule, EventApiModule]);

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
    closeTab,
}: ManagementPageProps<T>) {
    // ===== Hooks & Context =====
    const mounted = useMounted();
    const baseId = entityName.toLowerCase();
    const [gridApi, setGridApi] = useState<GridApi<T> | null>(null);
    const [quickFilterText, setQuickFilterText] = useState('');
    const [columnPinnedState, setColumnPinnedState] = useState<
        Record<string, boolean | 'left' | 'right' | null | undefined>
    >({});

    // ===== Component Logic =====
    const onGridReady = (params: GridReadyEvent<T>) => {
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
    };

    // ===== Event Handlers =====
    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const val = event.currentTarget.value;
        setQuickFilterText(val);
        if (gridApi) {
            gridApi.setGridOption('quickFilterText', val);
        }
    };

    const handleRefresh = () => {
        onRefresh();
        notifications.show({
            title: 'Đã làm mới',
            message: 'Dữ liệu đang được cập nhật...',
            color: 'blue',
        });
    };

    const handleReset = () => {
        setQuickFilterText('');
        if (gridApi) {
            gridApi.setGridOption('quickFilterText', '');
            gridApi.setFilterModel(null);

            // Only apply column state if we have valid column defs
            try {
                const defaultState = columnDefs
                    .map(col => ({
                        colId: col.colId || (col.field as string),
                        pinned: col.pinned,
                        hide: false,
                        width: col.width,
                    }))
                    .filter(state => state.colId); // Ensure we have a colId

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
    };

    // ===== Final Render =====
    if (!mounted) return null;

    return (
        <DashboardShell withFooter={false}>
            <Container fluid px="1rem" py="md">
                <Title order={2} mb="xl">
                    {title}
                </Title>
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
                                    <Card shadow="sm" radius="md" withBorder padding="lg">
                                        <Stack gap="md">
                                            <Group justify="space-between">
                                                <TextInput
                                                    id={`${baseId}-search`}
                                                    placeholder={searchPlaceholder}
                                                    leftSection={
                                                        <IconSearch size={16} stroke={1.5} />
                                                    }
                                                    rightSection={
                                                        quickFilterText ? (
                                                            <ActionIcon
                                                                variant="transparent"
                                                                c="dimmed"
                                                                onClick={() => {
                                                                    setQuickFilterText('');
                                                                    gridApi?.setGridOption(
                                                                        'quickFilterText',
                                                                        '',
                                                                    );
                                                                }}
                                                            >
                                                                <IconX size={14} />
                                                            </ActionIcon>
                                                        ) : null
                                                    }
                                                    value={quickFilterText}
                                                    onChange={handleSearchChange}
                                                    w={350}
                                                    radius="md"
                                                    variant="filled"
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
                                                        leftSection={
                                                            <IconRotateClockwise size={16} />
                                                        }
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
                                                                leftSection={
                                                                    <IconColumns size={16} />
                                                                }
                                                            >
                                                                Cột
                                                            </Button>
                                                        </Popover.Target>
                                                        <Popover.Dropdown>
                                                            <Stack gap="xs">
                                                                {columnDefs.map(col =>
                                                                    col.field ? (
                                                                        <Group
                                                                            key={
                                                                                col.colId ||
                                                                                (col.field as string)
                                                                            }
                                                                            justify="space-between"
                                                                        >
                                                                            <Checkbox
                                                                                label={
                                                                                    col.headerName
                                                                                }
                                                                                defaultChecked
                                                                                onChange={e =>
                                                                                    gridApi?.setColumnsVisible(
                                                                                        [
                                                                                            col.colId ||
                                                                                                (col.field as string),
                                                                                        ],
                                                                                        e
                                                                                            .currentTarget
                                                                                            .checked,
                                                                                    )
                                                                                }
                                                                                style={{ flex: 1 }}
                                                                            />
                                                                            <Group gap={4}>
                                                                                <ActionIcon
                                                                                    variant={
                                                                                        columnPinnedState[
                                                                                            col.colId ||
                                                                                                (col.field as string)
                                                                                        ] === 'left'
                                                                                            ? 'filled'
                                                                                            : 'subtle'
                                                                                    }
                                                                                    color={
                                                                                        columnPinnedState[
                                                                                            col.colId ||
                                                                                                (col.field as string)
                                                                                        ] === 'left'
                                                                                            ? 'blue'
                                                                                            : 'gray'
                                                                                    }
                                                                                    size="sm"
                                                                                    onClick={() =>
                                                                                        gridApi?.applyColumnState(
                                                                                            {
                                                                                                state: [
                                                                                                    {
                                                                                                        colId:
                                                                                                            col.colId ||
                                                                                                            (col.field as string),
                                                                                                        pinned: 'left',
                                                                                                    },
                                                                                                ],
                                                                                            },
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    <IconArrowBarToLeft
                                                                                        size={16}
                                                                                    />
                                                                                </ActionIcon>
                                                                                <ActionIcon
                                                                                    variant={
                                                                                        !columnPinnedState[
                                                                                            col.colId ||
                                                                                                (col.field as string)
                                                                                        ]
                                                                                            ? 'filled'
                                                                                            : 'subtle'
                                                                                    }
                                                                                    color={
                                                                                        !columnPinnedState[
                                                                                            col.colId ||
                                                                                                (col.field as string)
                                                                                        ]
                                                                                            ? 'gray'
                                                                                            : 'gray'
                                                                                    }
                                                                                    size="sm"
                                                                                    onClick={() =>
                                                                                        gridApi?.applyColumnState(
                                                                                            {
                                                                                                state: [
                                                                                                    {
                                                                                                        colId:
                                                                                                            col.colId ||
                                                                                                            (col.field as string),
                                                                                                        pinned: null,
                                                                                                    },
                                                                                                ],
                                                                                            },
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    <IconPinnedOff
                                                                                        size={16}
                                                                                    />
                                                                                </ActionIcon>
                                                                                <ActionIcon
                                                                                    variant={
                                                                                        columnPinnedState[
                                                                                            col.colId ||
                                                                                                (col.field as string)
                                                                                        ] ===
                                                                                        'right'
                                                                                            ? 'filled'
                                                                                            : 'subtle'
                                                                                    }
                                                                                    color={
                                                                                        columnPinnedState[
                                                                                            col.colId ||
                                                                                                (col.field as string)
                                                                                        ] ===
                                                                                        'right'
                                                                                            ? 'blue'
                                                                                            : 'gray'
                                                                                    }
                                                                                    size="sm"
                                                                                    onClick={() =>
                                                                                        gridApi?.applyColumnState(
                                                                                            {
                                                                                                state: [
                                                                                                    {
                                                                                                        colId:
                                                                                                            col.colId ||
                                                                                                            (col.field as string),
                                                                                                        pinned: 'right',
                                                                                                    },
                                                                                                ],
                                                                                            },
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    <IconArrowBarToRight
                                                                                        size={16}
                                                                                    />
                                                                                </ActionIcon>
                                                                            </Group>
                                                                        </Group>
                                                                    ) : null,
                                                                )}
                                                            </Stack>
                                                        </Popover.Dropdown>
                                                    </Popover>
                                                    <Button
                                                        variant="outline"
                                                        color="green"
                                                        leftSection={
                                                            <IconFileSpreadsheet size={16} />
                                                        }
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
