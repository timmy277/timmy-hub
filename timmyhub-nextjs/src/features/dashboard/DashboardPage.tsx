'use client';

import { useMemo, useState, useCallback } from 'react';
import {
    Container,
    Title,
    Text,
    Stack,
    Card,
    Group,
    Badge,
    Button,
    Paper,
    TextInput,
    ActionIcon,
    Tooltip,
    Tabs,
    CloseButton,
    Select,
    NumberInput,
    Pagination,
    Popover,
    Checkbox,
    useMantineColorScheme
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { DashboardShell } from '@/components/layout';
import { AgGridReact } from 'ag-grid-react';
import {
    GridApi,
    GridOptions,
    GridReadyEvent,
    FilterChangedEvent,
    PaginationChangedEvent,
    ColumnPinnedEvent,
    Column,
    ModuleRegistry,
    ColDef,
    ColGroupDef,
    ICellRendererParams,
    IDateFilterParams,
    CellStyle,
    NumberEditorModule,
    TextEditorModule,
    TextFilterModule,
    DateFilterModule,
    NumberFilterModule,
    ClientSideRowModelModule,
    PaginationModule,
    RowSelectionModule,
    CellStyleModule,
    DateEditorModule,
    ColumnAutoSizeModule,
    CsvExportModule,
    ColumnApiModule,
    ValidationModule,
    themeQuartz,
    iconSetMaterial,
    colorSchemeDarkBlue,
    QuickFilterModule
} from 'ag-grid-community';
import {
    IconSearch,
    IconPlus,
    IconEdit,
    IconTrash,
    IconEye,
    IconCheck,
    IconX,
    IconDownload,
    IconRefresh,
    IconFileSpreadsheet,
    IconFileText,
    IconColumns,
    IconPin,
    IconTable,
    IconPinnedOff,
    IconArrowBarToLeft,
    IconArrowBarToRight,
    IconRotateClockwise
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import dayjs from 'dayjs';

// Register all community modules
ModuleRegistry.registerModules([
    NumberEditorModule,
    TextEditorModule,
    TextFilterModule,
    DateFilterModule,
    NumberFilterModule,
    ClientSideRowModelModule,
    PaginationModule,
    RowSelectionModule,
    CellStyleModule,
    DateEditorModule,
    ColumnAutoSizeModule,
    CsvExportModule,
    ColumnApiModule,
    QuickFilterModule,
    ...(process.env.NODE_ENV !== "production" ? [ValidationModule] : []),
]);

// --- Mock Data Generation ---
const CATEGORIES = ['Electronics', 'Clothing', 'Home & Garden', 'Books', 'Toys', 'Sports', 'Beauty'];
const STATUSES = ['Active', 'Pending', 'Rejected', 'Out of Stock'];
const VARIANTS = ['Red - S', 'Blue - M', 'Black - L', 'White - XL', 'Green - S', 'Yellow - XXL'];
const SELLERS = ['Official Store', 'Global Trader', 'Local Shop', 'Best Choice', 'Mega Mall'];
const WAREHOUSES = ['Hanoi Hub', 'Da Nang Hub', 'HCMC Hub', 'Can Tho Hub'];

interface Product {
    id: string;
    name: string;
    category: string;
    price: number;
    stock: number;
    status: string;
    createdAt: string;
    variant: string;
    seller: string;
    sku: string;
    warehouse: string;
}

const generateMockData = (count: number): Product[] => {
    return Array.from({ length: count }).map((_, index) => {
        const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
        const status = STATUSES[Math.floor(Math.random() * STATUSES.length)];
        const variant = VARIANTS[Math.floor(Math.random() * VARIANTS.length)];
        const seller = SELLERS[Math.floor(Math.random() * SELLERS.length)];
        const warehouse = WAREHOUSES[Math.floor(Math.random() * WAREHOUSES.length)];
        const price = Math.floor(Math.random() * 1000) + 10;
        const stock = Math.floor(Math.random() * 500);
        const date = dayjs().subtract(Math.floor(Math.random() * 365), 'day').format('YYYY-MM-DD');

        return {
            id: `P-${index + 1000}`,
            name: `${category} Product ${index + 1}`,
            category,
            price,
            stock,
            status,
            createdAt: date,
            variant,
            seller,
            sku: `SKU-${index + 1000}-${Math.floor(Math.random() * 999)}`,
            warehouse,
        };
    });
};

interface TabItem {
    id: string;
    label: string;
    type: 'list' | 'create' | 'update' | 'detail';
    data?: Product;
}

// Separate component for Tab Content (Create/Update/Detail)
interface ProductFormValues extends Omit<Product, 'id' | 'createdAt'> {
    id?: string;
    createdAt?: string;
}

function ProductFormContent({
    initialData,
    mode,
    onSave,
    onCancel
}: {
    initialData?: Product;
    mode: 'create' | 'update' | 'detail';
    onSave: (values: ProductFormValues) => void;
    onCancel: () => void;
}) {
    const isDetail = mode === 'detail';

    const form = useForm({
        initialValues: initialData ? { ...initialData } : {
            name: '',
            category: 'Electronics',
            price: 0,
            stock: 0,
            status: 'Active',
            variant: 'Red - M',
            seller: 'Official Store',
            sku: `SKU-${Date.now()}`,
            warehouse: 'Hanoi Hub'
        },
    });

    return (
        <Paper withBorder p="xl" radius="md">
            <form onSubmit={form.onSubmit((values) => { if (!isDetail) onSave(values); })}>
                <Stack gap="md">
                    <Title order={3}>{mode === 'create' ? 'Add New Product' : mode === 'update' ? `Edit Product: ${initialData?.name}` : `Product Details: ${initialData?.name}`}</Title>

                    <Group grow>
                        <TextInput
                            label="Product Name"
                            placeholder="Enter name"
                            required
                            readOnly={isDetail}
                            variant={isDetail ? 'unstyled' : 'default'}
                            {...form.getInputProps('name')}
                        />
                        <Select
                            label="Category"
                            data={CATEGORIES}
                            readOnly={isDetail}
                            variant={isDetail ? 'unstyled' : 'default'}
                            {...form.getInputProps('category')}
                        />
                    </Group>

                    <Group grow>
                        <NumberInput
                            label="Price ($)"
                            min={0}
                            readOnly={isDetail}
                            variant={isDetail ? 'unstyled' : 'default'}
                            {...form.getInputProps('price')}
                        />
                        <NumberInput
                            label="Stock"
                            min={0}
                            readOnly={isDetail}
                            variant={isDetail ? 'unstyled' : 'default'}
                            {...form.getInputProps('stock')}
                        />
                    </Group>

                    <Group grow>
                        <Select
                            label="Status"
                            data={STATUSES}
                            readOnly={isDetail}
                            variant={isDetail ? 'unstyled' : 'default'}
                            {...form.getInputProps('status')}
                        />
                        <TextInput
                            label="SKU"
                            readOnly={isDetail}
                            variant={isDetail ? 'unstyled' : 'default'}
                            {...form.getInputProps('sku')}
                        />
                    </Group>

                    <Group grow>
                        <TextInput
                            label="Variant"
                            readOnly={isDetail}
                            variant={isDetail ? 'unstyled' : 'default'}
                            {...form.getInputProps('variant')}
                        />
                        <TextInput
                            label="Warehouse"
                            readOnly={isDetail}
                            variant={isDetail ? 'unstyled' : 'default'}
                            {...form.getInputProps('warehouse')}
                        />
                    </Group>

                    <Group justify="flex-end" mt="xl">
                        <Button variant="default" onClick={onCancel} leftSection={<IconX size={16} />}>
                            {isDetail ? 'Close Tab' : 'Cancel'}
                        </Button>
                        {!isDetail && (
                            <Button type="submit" color="blue" leftSection={mode === 'create' ? <IconPlus size={16} /> : <IconCheck size={16} />}>
                                {mode === 'create' ? 'Create Product' : 'Save Changes'}
                            </Button>
                        )}
                    </Group>
                </Stack>
            </form>
        </Paper>
    );
}

export function DashboardPage() {
    const { colorScheme } = useMantineColorScheme();

    // 1. State
    const [rowData, setRowData] = useState<Product[]>(generateMockData(200));
    const [gridApi, setGridApi] = useState<GridApi<Product> | null>(null);
    const [quickFilterText, setQuickFilterText] = useState('');
    const [activePage, setActivePage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(10);
    const [paginationStatus, setPaginationStatus] = useState({ from: 1, to: 20, total: 200 });
    const [columnPinnedState, setColumnPinnedState] = useState<Record<string, string | boolean | null | undefined>>({});

    // Dynamic Tabs State
    const [activeTab, setActiveTab] = useState<string | null>('list');
    const [openTabs, setOpenTabs] = useState<TabItem[]>([
        { id: 'list', label: 'Product List', type: 'list' }
    ]);

    const closeTab = useCallback((tabId: string) => {
        if (tabId === 'list') return;
        setOpenTabs(prev => {
            const newTabs = prev.filter(t => t.id !== tabId);
            if (activeTab === tabId) {
                const currentIdx = prev.findIndex(t => t.id === tabId);
                const nextTab = newTabs[currentIdx - 1] || newTabs[0];
                setActiveTab(nextTab?.id || 'list');
            }
            return newTabs;
        });
    }, [activeTab]);

    const addTab = useCallback((type: 'create' | 'update' | 'detail', data?: Product) => {
        const id = type === 'create' ? 'create' : `${type}-${data?.id}`;
        setOpenTabs(prev => {
            if (prev.find(t => t.id === id)) return prev;
            return [...prev, {
                id,
                type,
                data,
                label: type === 'create' ? 'New Product' : `${type === 'update' ? 'Edit' : 'Detail'}: ${data?.id}`
            }];
        });
        setActiveTab(id);
    }, []);

    // 2. Action Handlers
    const handleAction = useCallback((action: 'Create' | 'Update' | 'Detail' | 'Delete' | 'Approve' | 'Reject', data?: Product) => {
        if (action === 'Create' || action === 'Update' || action === 'Detail') {
            addTab(action.toLowerCase() as 'create' | 'update' | 'detail', data);
            return;
        }

        if (!data) return;

        notifications.show({
            title: `Action: ${action}`,
            message: `Performed ${action} on ${data.name} (${data.id})`,
            color: action === 'Delete' || action === 'Reject' ? 'red' :
                action === 'Approve' ? 'green' : 'blue',
        });

        if (action === 'Delete') {
            setRowData(prev => prev.filter(item => item.id !== data.id));
            closeTab(`update-${data.id}`);
            closeTab(`detail-${data.id}`);
        }
        if (action === 'Approve') {
            setRowData(prev => prev.map(item =>
                item.id === data.id ? { ...item, status: 'Active' } : item
            ));
        }
        if (action === 'Reject') {
            setRowData(prev => prev.map(item =>
                item.id === data.id ? { ...item, status: 'Rejected' } : item
            ));
        }
    }, [addTab, closeTab]);

    const handleTabSave = (values: ProductFormValues, type: 'create' | 'update', tabId: string) => {
        if (type === 'create') {
            const newItem = {
                ...values,
                id: `P-${Math.floor(Math.random() * 10000)}`,
                createdAt: dayjs().format('YYYY-MM-DD')
            };
            setRowData(prev => [newItem, ...prev]);
            notifications.show({ title: 'Success', message: 'Product created successfully', color: 'green' });
        } else {
            setRowData(prev => prev.map(item =>
                item.id === values.id ? { ...item, ...values } : item
            ));
            notifications.show({ title: 'Success', message: 'Product updated successfully', color: 'green' });
        }
        closeTab(tabId);
    };

    const updatePaginationInfo = useCallback((api: GridApi<Product>) => {
        const total = api.paginationGetRowCount();
        const currentPage = api.paginationGetCurrentPage();
        const size = api.paginationGetPageSize();
        const totalP = api.paginationGetTotalPages();
        const from = total === 0 ? 0 : (currentPage * size) + 1;
        const to = Math.min((currentPage + 1) * size, total);

        setPaginationStatus(prev => {
            if (prev.from === from && prev.to === to && prev.total === total) return prev;
            return { from, to, total };
        });

        setActivePage(prev => (prev === (currentPage + 1) ? prev : (currentPage + 1)));
        setTotalPages(prev => (prev === totalP ? prev : totalP));
        setPageSize(prev => (prev === size ? prev : size));
    }, []);

    const onGridReady = (params: GridReadyEvent<Product>) => {
        setGridApi(params.api);
        updatePaginationInfo(params.api);
        const colState: Record<string, string | boolean | null | undefined> = {};
        params.api.getAllGridColumns().forEach((col: Column) => {
            colState[col.getColId()] = col.getPinned();
        });
        setColumnPinnedState(colState);
    };

    const onPaginationChanged = useCallback((event: PaginationChangedEvent<Product>) => {
        updatePaginationInfo(event.api);
    }, [updatePaginationInfo]);

    const onFilterChanged = useCallback((event: FilterChangedEvent<Product>) => {
        updatePaginationInfo(event.api);
    }, [updatePaginationInfo]);

    const onColumnPinned = useCallback((event: ColumnPinnedEvent<Product>) => {
        const colState: Record<string, string | boolean | null | undefined> = {};
        event.api.getAllGridColumns().forEach((col: Column) => {
            colState[col.getColId()] = col.getPinned();
        });
        setColumnPinnedState(colState);
    }, []);

    const onPageChange = (page: number) => {
        if (gridApi) gridApi.paginationGoToPage(page - 1);
    };

    const onPageSizeChange = (val: string | null) => {
        if (gridApi && val) {
            const newSize = parseInt(val);
            if (pageSize !== newSize) {
                gridApi.setGridOption('paginationPageSize', newSize);
                setPageSize(newSize);
            }
        }
    };

    const onFilterTextBoxChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuickFilterText(e.target.value);
        gridApi?.setGridOption('quickFilterText', e.target.value);
    };

    const gridTheme = useMemo(() => {
        const base = themeQuartz.withPart(iconSetMaterial).withParams({ iconSize: 18 });
        return colorScheme === 'dark' ? base.withPart(colorSchemeDarkBlue) : base;
    }, [colorScheme]);

    const columnDefs = useMemo<ColDef[]>(() => [
        { field: "id", headerName: "ID", width: 90, filter: 'agTextColumnFilter' },
        { field: "sku", headerName: "SKU", width: 140, filter: 'agTextColumnFilter' },
        { field: "name", headerName: "Product Name", width: 220, filter: 'agTextColumnFilter' },
        { field: "variant", headerName: "Variant", width: 130, filter: 'agTextColumnFilter' },
        { field: "category", headerName: "Category", width: 140, filter: 'agTextColumnFilter' },
        { field: "seller", headerName: "Seller", width: 160, filter: 'agTextColumnFilter' },
        { field: "warehouse", headerName: "Warehouse", width: 140, filter: 'agTextColumnFilter' },
        { field: "price", headerName: "Price ($)", width: 110, filter: 'agNumberColumnFilter', cellStyle: { fontWeight: 'bold' } },
        {
            field: "stock", headerName: "Stock", width: 100, filter: 'agNumberColumnFilter',
            cellRenderer: (params: ICellRendererParams) => {
                const stock = params.value;
                const color = stock < 10 ? 'red' : stock < 50 ? 'orange' : 'green';
                return <Text c={color} fw={700}>{stock}</Text>;
            }
        },
        {
            field: "status", headerName: "Status", width: 130, filter: 'agTextColumnFilter',
            cellRenderer: (params: ICellRendererParams) => {
                const color = params.value === 'Active' ? 'green' :
                    params.value === 'Pending' ? 'yellow' :
                        params.value === 'Rejected' ? 'red' : 'gray';
                return <Badge color={color} variant="light">{params.value}</Badge>;
            }
        },
        { field: "createdAt", headerName: "Created At", width: 140, filter: 'agDateColumnFilter', valueFormatter: (params) => dayjs(params.value).format('DD/MM/YYYY') },
        {
            headerName: "Actions", colId: "actions", width: 140, pinned: 'right',
            cellRenderer: (params: ICellRendererParams) => {
                if (!params.data) return null;
                return (
                    <Group gap={4} wrap="nowrap">
                        <Tooltip label="View Details">
                            <ActionIcon variant="subtle" color="cyan" size="sm" onClick={() => handleAction('Detail', params.data)}>
                                <IconEye size={16} />
                            </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Edit">
                            <ActionIcon variant="subtle" color="blue" size="sm" onClick={() => handleAction('Update', params.data)}>
                                <IconEdit size={16} />
                            </ActionIcon>
                        </Tooltip>
                        {params.data.status === 'Pending' ? (
                            <>
                                <ActionIcon variant="subtle" color="green" size="sm" onClick={() => handleAction('Approve', params.data)}><IconCheck size={16} /></ActionIcon>
                                <ActionIcon variant="subtle" color="red" size="sm" onClick={() => handleAction('Reject', params.data)}><IconX size={16} /></ActionIcon>
                            </>
                        ) : (
                            <ActionIcon variant="subtle" color="red" size="sm" onClick={() => handleAction('Delete', params.data)}><IconTrash size={16} /></ActionIcon>
                        )}
                    </Group>
                );
            }
        }
    ], [handleAction]);

    const defaultColDef = useMemo<ColDef>(() => ({
        sortable: true, resizable: true, filter: true, flex: 1, minWidth: 140,
        cellStyle: { display: 'flex', alignItems: 'center' } as CellStyle,
    }), []);

    return (
        <DashboardShell withFooter={false}>
            <Container fluid px="1rem" py="md">
                <Tabs value={activeTab} onChange={setActiveTab} variant="outline" radius="md">
                    <Tabs.List mb="md">
                        {openTabs.map(tab => (
                            <Tabs.Tab
                                key={tab.id}
                                value={tab.id}
                                leftSection={tab.id === 'list' ? <IconTable size={16} /> : <IconFileText size={16} />}
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
                                                    id="dashboard-search-input"
                                                    placeholder="Search products..."
                                                    leftSection={<IconSearch size={16} stroke={1.5} />}
                                                    rightSection={quickFilterText ? <ActionIcon variant="transparent" c="dimmed" onClick={() => { setQuickFilterText(''); gridApi?.setGridOption('quickFilterText', ''); }}><IconX size={14} /></ActionIcon> : null}
                                                    value={quickFilterText}
                                                    onChange={onFilterTextBoxChanged}
                                                    w={350} radius="md" variant="filled"
                                                />
                                                <Group>
                                                    <Button variant="outline" onClick={() => setRowData(generateMockData(200))} leftSection={<IconRefresh size={16} />}>Refresh</Button>
                                                    <Button variant="outline" color="orange" onClick={() => {
                                                        if (gridApi) {
                                                            gridApi.setFilterModel(null);
                                                            gridApi.applyColumnState({ state: columnDefs.map(col => ({ colId: col.colId || (col.field as string), pinned: col.pinned as any, hide: false, width: col.width })), defaultState: { sort: null, pinned: null } });
                                                            notifications.show({ message: 'Layout reset', color: 'blue' });
                                                        }
                                                    }} leftSection={<IconRotateClockwise size={16} />}>Reset</Button>
                                                    <Popover width={300} position="bottom-end" withArrow shadow="md">
                                                        <Popover.Target><Button variant="outline" color="blue" leftSection={<IconColumns size={16} />}>Columns</Button></Popover.Target>
                                                        <Popover.Dropdown>
                                                            <Stack gap="xs">
                                                                {columnDefs.map(col => col.field ? (
                                                                    <Group key={col.field} justify="space-between">
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
                                                    <Button variant="outline" color="green" leftSection={<IconFileSpreadsheet size={16} />} onClick={() => gridApi?.exportDataAsCsv()}>Export</Button>
                                                    <Button leftSection={<IconPlus size={16} />} onClick={() => handleAction('Create')}>Add Product</Button>
                                                </Group>
                                            </Group>

                                            <div style={{ height: 'calc(100vh - 350px)', minHeight: 460, border: '1px solid var(--mantine-color-default-border)', borderRadius: 'var(--mantine-radius-md)', overflow: 'hidden' }}>
                                                <AgGridReact
                                                    rowData={rowData}
                                                    columnDefs={columnDefs}
                                                    defaultColDef={defaultColDef}
                                                    pagination={true}
                                                    paginationPageSize={pageSize}
                                                    onGridReady={onGridReady}
                                                    theme={gridTheme}
                                                    suppressPaginationPanel={true}
                                                    onPaginationChanged={onPaginationChanged}
                                                    onFilterChanged={onFilterChanged}
                                                    onColumnPinned={onColumnPinned}
                                                    animateRows={true}
                                                />
                                            </div>

                                            <Group justify="space-between">
                                                <Group gap="sm">
                                                    <Text size="sm" c="dimmed">Showing {paginationStatus.from} - {paginationStatus.to} of {paginationStatus.total} items</Text>
                                                    <Select size="xs" w={80} data={['10', '20', '50', '100']} value={pageSize.toString()} onChange={onPageSizeChange} />
                                                </Group>
                                                <Pagination total={totalPages} value={activePage} onChange={onPageChange} color="blue" size="sm" />
                                            </Group>
                                        </Stack>
                                    </Card>
                                </Stack>
                            ) : (
                                <ProductFormContent
                                    mode={tab.type as any}
                                    initialData={tab.data}
                                    onSave={(values) => handleTabSave(values, tab.type as any, tab.id)}
                                    onCancel={() => closeTab(tab.id)}
                                />
                            )}
                        </Tabs.Panel>
                    ))}
                </Tabs>
            </Container>
        </DashboardShell >
    );
}
