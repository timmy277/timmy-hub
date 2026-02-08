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
    Pagination
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { DashboardShell } from '@/components/layout';
import { AgGridReact } from 'ag-grid-react';
import {
    GridApi,
    GridOptions,
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
    ValidationModule,
    themeQuartz,
    iconSetMaterial
} from 'ag-grid-community';
import {
    ColumnMenuModule,
    ColumnsToolPanelModule,
    ContextMenuModule,
    FiltersToolPanelModule,
    PivotModule,
    RowGroupingModule,
    SetFilterModule,
    ExcelExportModule,
} from 'ag-grid-enterprise';

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
    IconFileSpreadsheet
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import dayjs from 'dayjs';

// Register all community and enterprise modules
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
    ColumnsToolPanelModule,
    FiltersToolPanelModule,
    ColumnMenuModule,
    ContextMenuModule,
    RowGroupingModule,
    SetFilterModule,
    PivotModule,
    ExcelExportModule,
    ...(process.env.NODE_ENV !== "production" ? [ValidationModule] : []),
]);

const myTheme = themeQuartz
    .withPart(iconSetMaterial)
    .withParams({
        iconSize: 18,
    });

// --- Mock Data Generation ---
const CATEGORIES = ['Electronics', 'Clothing', 'Home & Garden', 'Books', 'Toys', 'Sports', 'Beauty'];
const STATUSES = ['Active', 'Pending', 'Rejected', 'Out of Stock'];

const generateMockData = (count: number) => {
    return Array.from({ length: count }).map((_, index) => {
        const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
        const status = STATUSES[Math.floor(Math.random() * STATUSES.length)];
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
        };
    });
};

export function DashboardPage() {
    // 1. State
    const [rowData, setRowData] = useState(generateMockData(200));
    const [gridApi, setGridApi] = useState<any>(null);
    const [quickFilterText, setQuickFilterText] = useState('');
    const [activePage, setActivePage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [totalPages, setTotalPages] = useState(10);

    // Modal State
    const [opened, { open, close }] = useDisclosure(false);
    const [editingItem, setEditingItem] = useState<any>(null);

    const form = useForm({
        initialValues: {
            name: '',
            category: '',
            price: 0,
            stock: 0,
            status: 'Active'
        },
    });

    // 2. Action Handlers
    const handleAction = useCallback((action: string, data: any) => {
        if (action === 'Update' || action === 'Create') {
            setEditingItem(action === 'Update' ? data : null);
            form.setValues(action === 'Update' ? data : {
                name: '', category: 'Electronics', price: 0, stock: 0, status: 'Active'
            });
            open();
            return;
        }

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

    const onGridReady = (params: any) => {
        setGridApi(params.api);
        params.api.sizeColumnsToFit();
        setTotalPages(params.api.paginationGetTotalPages());
    };

    const onPaginationChanged = useCallback((params: any) => {
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
            width: 100,
            filter: 'agTextColumnFilter',
        },
        {
            field: "name",
            headerName: "Product Name",
            flex: 2,
            minWidth: 200,
            filter: 'agTextColumnFilter',
        },
        {
            field: "category",
            headerName: "Category",
            width: 150,
            filter: 'agSetColumnFilter',
        },
        {
            field: "price",
            headerName: "Price",
            width: 120,
            filter: 'agNumberColumnFilter',
            valueFormatter: (params) => `$${params.value.toLocaleString()}`,
            cellStyle: { fontWeight: 'bold', display: 'flex', alignItems: 'center' } as CellStyle
        },
        {
            field: "stock",
            headerName: "Stock",
            width: 120,
            filter: 'agNumberColumnFilter',
            cellRenderer: (params: ICellRendererParams) => {
                return (
                    <Badge
                        color={params.value < 50 ? 'red' : params.value < 150 ? 'yellow' : 'blue'}
                        variant="light"
                    >
                        {params.value}
                    </Badge>
                )
            }
        },
        {
            field: "createdAt",
            headerName: "Date",
            width: 140,
            filter: 'agDateColumnFilter',
            filterParams: {
                comparator: (filterLocalDateAtMidnight: Date, cellValue: string) => {
                    const dateParts = cellValue.split("-");
                    const cellDate = new Date(
                        Number(dateParts[0]),
                        Number(dateParts[1]) - 1,
                        Number(dateParts[2])
                    );
                    if (cellDate < filterLocalDateAtMidnight) return -1;
                    if (cellDate > filterLocalDateAtMidnight) return 1;
                    return 0;
                }
            } as IDateFilterParams
        },
        {
            field: "status",
            headerName: "Status",
            width: 140,
            filter: 'agSetColumnFilter',
            cellRenderer: (params: ICellRendererParams) => {
                const colors: Record<string, string> = {
                    'Active': 'green',
                    'Pending': 'orange',
                    'Rejected': 'red',
                    'Out of Stock': 'gray'
                };
                return <Badge color={colors[params.value] || 'gray'} fullWidth>{params.value}</Badge>;
            }
        },
        {
            headerName: "Actions",
            width: 140,
            pinned: 'right',
            sortable: false,
            filter: false,
            cellStyle: { display: 'flex', alignItems: 'center', justifyContent: 'center' } as CellStyle,
            cellRenderer: (params: ICellRendererParams) => {
                return (
                    <Group gap={4} wrap="nowrap" justify="center">
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
        flex: 1,
        minWidth: 100,
        editable: true,
        enableRowGroup: true,
        enablePivot: true,
        enableValue: true,
        cellStyle: { display: 'flex', alignItems: 'center' } as CellStyle,
    }), []);

    return (
        <DashboardShell withFooter={false}>
            <Container size="xl" py="xl">
                <Stack gap="lg">
                    {/* Header Section */}
                    <Group justify="space-between" align="center">
                        <Stack gap={0}>
                            <Title order={2}>Product Management</Title>
                            <Text c="dimmed" size="sm">Manage your inventory, approve request, and track status.</Text>
                        </Stack>
                        <Group>
                        </Group>
                    </Group>

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
                                    }} leftSection={<IconSearch size={16} />}>
                                        Refresh Data
                                    </Button>
                                    <Button
                                        variant="outline"
                                        color="green"
                                        leftSection={<IconDownload size={16} />}
                                        onClick={() => {
                                            gridApi?.exportDataAsExcel();
                                            notifications.show({ message: 'Exporting to Excel...', color: 'green' });
                                        }}
                                    >
                                        Export Excel
                                    </Button>
                                    <Button
                                        leftSection={<IconPlus size={16} />}
                                        onClick={() => handleAction('Create', {})}
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
                                    theme={myTheme}
                                    suppressPaginationPanel={true}
                                    onPaginationChanged={onPaginationChanged}
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
