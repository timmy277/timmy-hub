'use client';

import { useMemo, useState, useCallback } from 'react';
import { Badge, Group, ActionIcon, Tooltip, Text } from '@mantine/core';
import { IconEye, IconEdit, IconTrash } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import dayjs from 'dayjs';
import { ManagementPage } from '@/components/shared/ManagementPage';
import { useManagementTabs, TabItem } from '@/hooks/useManagementTabs';
import { ColDef, ICellRendererParams } from 'ag-grid-community';

// --- Mock Data Generation ---
const CATEGORIES = [
    'Electronics',
    'Clothing',
    'Home & Garden',
    'Books',
    'Toys',
    'Sports',
    'Beauty',
];
const STATUSES = ['Active', 'Pending', 'Rejected', 'Out of Stock'];

interface Product {
    id: string;
    name: string;
    category: string;
    price: number;
    stock: number;
    status: string;
    createdAt: string;
    sku: string;
}

const generateMockData = (count: number): Product[] => {
    return Array.from({ length: count }).map((_, index) => {
        const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
        const status = STATUSES[Math.floor(Math.random() * STATUSES.length)];
        return {
            id: `P-${index + 1000}`,
            name: `${category} Product ${index + 1}`,
            category,
            price: Math.floor(Math.random() * 1000) + 10,
            stock: Math.floor(Math.random() * 500),
            status,
            createdAt: dayjs()
                .subtract(Math.floor(Math.random() * 365), 'day')
                .format('YYYY-MM-DD'),
            sku: `SKU-${index + 1000}-${Math.floor(Math.random() * 999)}`,
        };
    });
};

export function DashboardPage() {
    const [rowData, setRowData] = useState<Product[]>(generateMockData(200));
    const { activeTab, setActiveTab, openTabs, closeTab, handleAction } =
        useManagementTabs<Product>('Product');

    const columnDefs = useMemo<ColDef<Product>[]>(
        () => [
            { field: 'id', headerName: 'ID', width: 90 },
            { field: 'sku', headerName: 'SKU', width: 140 },
            { field: 'name', headerName: 'Product Name', width: 220 },
            { field: 'category', headerName: 'Category', width: 140 },
            { field: 'price', headerName: 'Price ($)', width: 110 },
            {
                field: 'stock',
                headerName: 'Stock',
                width: 100,
                cellRenderer: (params: ICellRendererParams) => (
                    <Text c={params.value < 10 ? 'red' : 'green'} fw={700}>
                        {params.value}
                    </Text>
                ),
            },
            {
                field: 'status',
                headerName: 'Status',
                width: 130,
                cellRenderer: (params: ICellRendererParams) => {
                    const colors: Record<string, string> = {
                        Active: 'green',
                        Pending: 'yellow',
                        Rejected: 'red',
                    };
                    return (
                        <Badge color={colors[params.value] || 'gray'} variant="light" mt={8}>
                            {params.value}
                        </Badge>
                    );
                },
            },
            { field: 'createdAt', headerName: 'Created At', width: 140 },
            {
                headerName: 'Actions',
                pinned: 'right',
                width: 150,
                cellRenderer: (params: ICellRendererParams<Product>) => (
                    <Group gap={4} mt={4}>
                        <ActionIcon
                            variant="subtle"
                            color="cyan"
                            size="sm"
                            onClick={() => handleAction('Detail', params.data!)}
                        >
                            <IconEye size={16} />
                        </ActionIcon>
                        <ActionIcon
                            variant="subtle"
                            color="blue"
                            size="sm"
                            onClick={() => handleAction('Update', params.data!)}
                        >
                            <IconEdit size={16} />
                        </ActionIcon>
                        <ActionIcon
                            variant="subtle"
                            color="red"
                            size="sm"
                            onClick={() => {
                                setRowData(prev => prev.filter(p => p.id !== params.data?.id));
                                notifications.show({ message: 'Product deleted', color: 'red' });
                            }}
                        >
                            <IconTrash size={16} />
                        </ActionIcon>
                    </Group>
                ),
            },
        ],
        [handleAction],
    );

    const renderTabContent = (tab: TabItem<Product>) => (
        <Group p="xl">
            <Text>
                Content for {tab.label} ({tab.type})
            </Text>
        </Group>
    );

    return (
        <ManagementPage<Product>
            entityName="Product"
            rowData={rowData}
            columnDefs={columnDefs}
            onRefresh={() => setRowData(generateMockData(200))}
            renderTabContent={renderTabContent}
            onAdd={() => handleAction('Create')}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            openTabs={openTabs}
            closeTab={closeTab}
        />
    );
}
