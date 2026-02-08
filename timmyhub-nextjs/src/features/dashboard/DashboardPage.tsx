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
    Modal,
    NumberInput,
    Select,
    Pagination,
    Popover,
    Checkbox,
    useMantineColorScheme
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { DashboardShell } from '@/components/layout';
import { AgGridReact } from 'ag-grid-react';
import {
    GridApi,
    GridOptions,
    GridReadyEvent,
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
    colorSchemeDarkBlue
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

export function DashboardPage() {
    const { colorScheme } = useMantineColorScheme();

    // 1. State
    const [rowData, setRowData] = useState<Product[]>(generateMockData(200));
    const [gridApi, setGridApi] = useState<GridApi<Product> | null>(null);
    const [quickFilterText, setQuickFilterText] = useState('');
    const [activePage, setActivePage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [totalPages, setTotalPages] = useState(10);

    // Modal State
    const [opened, { open, close }] = useDisclosure(false);
    const [editingItem, setEditingItem] = useState<Product | null>(null);

    const form = useForm({
        initialValues: {
            name: '',
            category: '',
            price: 0,
            stock: 0,
            status: 'Active',
            variant: '',
            seller: '',
            sku: '',
            warehouse: ''
        },
    });

    // 2. Action Handlers
    const handleAction = useCallback((action: string, data?: Product) => {
        if (action === 'Update' || action === 'Create') {
            setEditingItem(action === 'Update' && data ? data : null);
            form.setValues(action === 'Update' && data ? data : {
                name: '', category: 'Electronics', price: 0, stock: 0, status: 'Active', id: '', createdAt: dayjs().format('YYYY-MM-DD'),
                variant: 'Red - M', seller: 'Official Store', sku: `SKU-${Date.now()}`, warehouse: 'Hanoi Hub'
            });
            open();
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
    }, [open, form]);


    const handleSave = (values: typeof form.values) => {
        if (editingItem) {
            // Update existing
            setRowData(prev => prev.map(item =>
                item.id === editingItem.id ? { ...item, ...values } : item
            ));
            notifications.show({ title: 'Success', message: 'Product updated successfully', color: 'green' });
        } else {
            // Create new
            const newItem = {
                id: `P-${Math.floor(Math.random() * 10000)}`,
                ...values,
                createdAt: dayjs().format('YYYY-MM-DD')
            };
            setRowData(prev => [newItem, ...prev]);
            notifications.show({ title: 'Success', message: 'Product created successfully', color: 'green' });
        }
        close();
    };

    const [columnPinnedState, setColumnPinnedState] = useState<Record<string, string | boolean | null | undefined>>({});

    const onColumnPinned = useCallback((event: ColumnPinnedEvent<Product>) => {
        const colState: Record<string, string | boolean | null | undefined> = {};
        event.api.getAllGridColumns().forEach((col: Column) => {
            colState[col.getColId()] = col.getPinned();
        });
        setColumnPinnedState(colState);
    }, []);

    // Dynamic Theme
    const gridTheme = useMemo(() => {
        const base = themeQuartz.withPart(iconSetMaterial).withParams({ iconSize: 18 });
        return colorScheme === 'dark' ? base.withPart(colorSchemeDarkBlue) : base;
    }, [colorScheme]);

    // Initial state on grid ready
    const onGridReady = (params: GridReadyEvent<Product>) => {
        setGridApi(params.api);
        // params.api.sizeColumnsToFit();
        setTotalPages(params.api.paginationGetTotalPages());

        // Initialize column state
        const colState: Record<string, string | boolean | null | undefined> = {};
        params.api.getAllGridColumns().forEach((col: Column) => {
            colState[col.getColId()] = col.getPinned();
        });
        setColumnPinnedState(colState);
    };

    const onPaginationChanged = useCallback((params: PaginationChangedEvent<Product>) => {
        if (params.api) {
            setActivePage(params.api.paginationGetCurrentPage() + 1);
            setTotalPages(params.api.paginationGetTotalPages());
            setPageSize(params.api.paginationGetPageSize());
        }
    }, []);

    const onPageChange = (page: number) => {
        if (gridApi) {
            gridApi.paginationGoToPage(page - 1);
            setActivePage(page);
        }
    };

    const onFilterTextBoxChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuickFilterText(e.target.value);
        gridApi?.setGridOption('quickFilterText', e.target.value);
    };

    // 3. Column Definitions
    const columnDefs = useMemo<ColDef[]>(() => [
        {
            field: "id",
            headerName: "ID",
            width: 90,
            filter: 'agTextColumnFilter',
            pinned: 'left'
        },
        {
            field: "sku",
            headerName: "SKU",
            width: 140,
            filter: 'agTextColumnFilter',
        },
        {
            field: "name",
            headerName: "Product Name",
            width: 220,
            filter: 'agTextColumnFilter',
        },
        {
            field: "variant",
            headerName: "Variant",
            width: 130,
            filter: 'agTextColumnFilter',
        },
        {
            field: "category",
            headerName: "Category",
            width: 140,
            filter: 'agTextColumnFilter',
        },
        {
            field: "seller",
            headerName: "Seller",
            width: 160,
            filter: 'agTextColumnFilter',
        },
        {
            field: "warehouse",
            headerName: "Warehouse",
            width: 140,
            filter: 'agTextColumnFilter',
        },
        {
            field: "price",
            headerName: "Price ($)",
            width: 110,
            filter: 'agNumberColumnFilter',
            cellStyle: { fontWeight: 'bold' }
        },
        {
            field: "stock",
            headerName: "Stock",
            width: 100,
            filter: 'agNumberColumnFilter',
            cellRenderer: (params: ICellRendererParams) => {
                const stock = params.value;
                const color = stock < 10 ? 'red' : stock < 50 ? 'orange' : 'green';
                return <Text c={color} fw={700}>{stock}</Text>;
            }
        },
        {
            field: "status",
            headerName: "Status",
            width: 130,
            filter: 'agTextColumnFilter',
            cellRenderer: (params: ICellRendererParams) => {
                const color = params.value === 'Active' ? 'green' :
                    params.value === 'Pending' ? 'yellow' :
                        params.value === 'Rejected' ? 'red' : 'gray';
                return <Badge color={color} variant="light">{params.value}</Badge>;
            }
        },
        {
            field: "createdAt",
            headerName: "Created At",
            width: 140,
            filter: 'agDateColumnFilter',
            valueFormatter: (params) => dayjs(params.value).format('DD/MM/YYYY'),
        },
        {
            headerName: "Actions",
            colId: "actions",
            width: 140,
            pinned: 'right',
            cellRenderer: (params: ICellRendererParams) => {
                if (!params.data) return null; // Loading rows
                return (
                    <Group gap={4} wrap="nowrap">
                        <Tooltip label="Edit">
                            <ActionIcon variant="subtle" color="blue" size="sm" onClick={() => handleAction('Update', params.data)}>
                                <IconEdit size={16} />
                            </ActionIcon>
                        </Tooltip>
                        {params.data.status === 'Pending' ? (
                            <>
                                <Tooltip label="Approve">
                                    <ActionIcon variant="subtle" color="green" size="sm" onClick={() => handleAction('Approve', params.data)}>
                                        <IconCheck size={16} />
                                    </ActionIcon>
                                </Tooltip>
                                <Tooltip label="Reject">
                                    <ActionIcon variant="subtle" color="red" size="sm" onClick={() => handleAction('Reject', params.data)}>
                                        <IconX size={16} />
                                    </ActionIcon>
                                </Tooltip>
                            </>
                        ) : (
                            <Tooltip label="Delete">
                                <ActionIcon variant="subtle" color="red" size="sm" onClick={() => handleAction('Delete', params.data)}>
                                    <IconTrash size={16} />
                                </ActionIcon>
                            </Tooltip>
                        )}
                    </Group>
                );
            }
        }
    ], [handleAction]);

    const defaultColDef = useMemo<ColDef>(() => ({
        sortable: true,
        resizable: true,
        filter: true,
        flex: 1, // Allow columns to fill available space
        minWidth: 140, // Minimum width to enforce horizontal scroll if too narrow
        editable: true,
        cellStyle: { display: 'flex', alignItems: 'center' } as CellStyle,
    }), []);

    return (
        <DashboardShell withFooter={false}>
            <Container fluid px="1rem" py="md">
                <Stack gap="lg">
                    {/* Filters & Grid Section */}
                    <Card shadow="sm" padding="lg" radius="md" withBorder>
                        <Stack gap="md">
                            {/* Toolbar */}
                            <Group justify="space-between">
                                <TextInput
                                    placeholder="Search anything..."
                                    leftSection={<IconSearch size={16} />}
                                    value={quickFilterText}
                                    onChange={onFilterTextBoxChanged}
                                    w={300}
                                />
                                <Group>
                                    <Button variant="outline" onClick={() => {
                                        setRowData(generateMockData(200));
                                        notifications.show({ message: 'Data refreshed!', color: 'green' });
                                    }} leftSection={<IconRefresh size={16} />}>
                                        Refresh Data
                                    </Button>
                                    <Button variant="outline" color="orange" onClick={() => {
                                        if (gridApi) {
                                            gridApi.setFilterModel(null);
                                            // Reset column state (order, visibility, pinned, sort, width)
                                            gridApi.applyColumnState({
                                                state: columnDefs.map(col => ({
                                                    colId: col.colId || (col.field as string),
                                                    pinned: col.pinned as 'left' | 'right' | null | undefined,
                                                    hide: false,
                                                    width: col.width,
                                                    // sort: null // handled by defaultState
                                                })),
                                                defaultState: { sort: null, pinned: null }
                                            });

                                            // Reset local pinned state
                                            const colState: Record<string, string | boolean | null | undefined> = {};
                                            gridApi.getAllGridColumns().forEach((col: Column) => {
                                                colState[col.getColId()] = col.getPinned();
                                            });
                                            setColumnPinnedState(colState);

                                            notifications.show({ message: 'Layout reset to default', color: 'blue' });
                                        }
                                    }} leftSection={<IconRotateClockwise size={16} />}>
                                        Reset Layout
                                    </Button>
                                    <Popover width={300} position="bottom-end" withArrow shadow="md">
                                        <Popover.Target>
                                            <Button variant="outline" color="blue" leftSection={<IconColumns size={16} />}>
                                                Columns
                                            </Button>
                                        </Popover.Target>
                                        <Popover.Dropdown>
                                            <Stack gap="xs">
                                                <Text size="xs" fw={500} c="dimmed">Manage Columns (Visibility & Pinning)</Text>
                                                {columnDefs.map(col => (
                                                    col.field ? (
                                                        <Group key={col.field} justify="space-between" wrap="nowrap">
                                                            <Checkbox
                                                                label={col.headerName}
                                                                defaultChecked={true}
                                                                onChange={(event) => {
                                                                    gridApi?.setColumnsVisible([col.field as string], event.currentTarget.checked);
                                                                }}
                                                                style={{ flex: 1 }}
                                                            />
                                                            <Group gap={4}>
                                                                <Tooltip label="Pin Left">
                                                                    <ActionIcon
                                                                        variant={columnPinnedState[col.field as string] === 'left' ? "filled" : "subtle"}
                                                                        size="sm"
                                                                        color={columnPinnedState[col.field as string] === 'left' ? undefined : "gray"}
                                                                        onClick={() => gridApi?.applyColumnState({
                                                                            state: [{ colId: col.field as string, pinned: 'left' }],
                                                                            defaultState: { pinned: null }
                                                                        })}
                                                                    >
                                                                        <IconArrowBarToLeft size={16} />
                                                                    </ActionIcon>
                                                                </Tooltip>
                                                                <Tooltip label="Unpin">
                                                                    <ActionIcon
                                                                        variant={!columnPinnedState[col.field as string] ? "filled" : "subtle"}
                                                                        size="sm"
                                                                        color={!columnPinnedState[col.field as string] ? undefined : "gray"}
                                                                        onClick={() => gridApi?.applyColumnState({
                                                                            state: [{ colId: col.field as string, pinned: null }]
                                                                        })}
                                                                    >
                                                                        <IconPinnedOff size={16} />
                                                                    </ActionIcon>
                                                                </Tooltip>
                                                                <Tooltip label="Pin Right">
                                                                    <ActionIcon
                                                                        variant={columnPinnedState[col.field as string] === 'right' ? "filled" : "subtle"}
                                                                        size="sm"
                                                                        color={columnPinnedState[col.field as string] === 'right' ? undefined : "gray"}
                                                                        onClick={() => gridApi?.applyColumnState({
                                                                            state: [{ colId: col.field as string, pinned: 'right' }],
                                                                            defaultState: { pinned: null }
                                                                        })}
                                                                    >
                                                                        <IconArrowBarToRight size={16} />
                                                                    </ActionIcon>
                                                                </Tooltip>
                                                            </Group>
                                                        </Group>
                                                    ) : null
                                                ))}
                                            </Stack>
                                        </Popover.Dropdown>
                                    </Popover>
                                    <Button
                                        variant="outline"
                                        color="green"
                                        leftSection={<IconFileSpreadsheet size={16} />}
                                        onClick={() => {
                                            gridApi?.exportDataAsCsv();
                                            notifications.show({ message: 'Exporting to CSV...', color: 'green' });
                                        }}
                                    >
                                        Export CSV
                                    </Button>
                                    <Button
                                        leftSection={<IconPlus size={16} />}
                                        onClick={() => handleAction('Create')}
                                    >
                                        Add New Product
                                    </Button>
                                </Group>
                            </Group>

                            {/* AG Grid */}
                            <Paper withBorder radius="md" style={{ height: 'calc(100vh - 320px)', minHeight: 500, width: '100%' }}>
                                <AgGridReact
                                    rowData={rowData}
                                    columnDefs={columnDefs}
                                    defaultColDef={defaultColDef}
                                    pagination={true}
                                    paginationPageSize={pageSize}
                                    paginationPageSizeSelector={[20, 50, 100]}
                                    onGridReady={onGridReady}
                                    rowSelection="multiple"
                                    animateRows={true}
                                    rowHeight={48}
                                    theme={gridTheme}
                                    suppressPaginationPanel={true}
                                    onPaginationChanged={onPaginationChanged}
                                    onColumnPinned={onColumnPinned}
                                />
                            </Paper>

                            <Group justify="space-between">
                                <Text size="sm" c="dimmed">
                                    {rowData.length > 0 && !isNaN(activePage) && !isNaN(pageSize) ? (
                                        `Showing ${((activePage - 1) * pageSize) + 1} - ${Math.min(activePage * pageSize, rowData.length)} of ${rowData.length} items`
                                    ) : (
                                        'Loading...'
                                    )}
                                </Text>
                                <Pagination
                                    total={totalPages}
                                    value={activePage}
                                    onChange={onPageChange}
                                    color="blue"
                                    size="sm"
                                />
                            </Group>
                        </Stack>
                    </Card>
                </Stack>
            </Container>

            {/* Edit/Create Modal */}
            <Modal opened={opened} onClose={close} title={editingItem ? "Edit Product" : "Create New Product"} centered>
                <form onSubmit={form.onSubmit(handleSave)}>
                    <Stack>
                        <TextInput label="Product Name" placeholder="Enter name" required {...form.getInputProps('name')} />
                        <Select label="Category" data={CATEGORIES} {...form.getInputProps('category')} />
                        <Group grow>
                            <NumberInput label="Price ($)" min={0} {...form.getInputProps('price')} />
                            <NumberInput label="Stock" min={0} {...form.getInputProps('stock')} />
                        </Group>
                        <Select label="Status" data={STATUSES} {...form.getInputProps('status')} />

                        <Group justify="flex-end" mt="md">
                            <Button variant="default" onClick={close}>Cancel</Button>
                            <Button type="submit">{editingItem ? "Update" : "Create"}</Button>
                        </Group>
                    </Stack>
                </form>
            </Modal>
        </DashboardShell >
    );
}
