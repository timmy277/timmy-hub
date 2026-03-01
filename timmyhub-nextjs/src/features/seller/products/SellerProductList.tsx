'use client';

/**
 * Trang quản lý sản phẩm của Seller
 * Dùng ManagementPage + AG Grid, tương tự admin pages
 */
import { useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ColDef } from 'ag-grid-community';
import { IconPackage } from '@tabler/icons-react';
import { Badge, Group, ActionIcon, Tooltip } from '@mantine/core';
import { IconEye } from '@tabler/icons-react';
import { ICellRendererParams } from 'ag-grid-community';
import { Product } from '@/types/product';
import { createSellerProductColumns } from '@/constants/column';
import { ManagementPage } from '@/components/shared/ManagementPage';
import { useManagementTabs, TabItem } from '@/hooks/useManagementTabs';
import { ManagementTabType } from '@/types/enums';
import { useSellerProducts } from '@/hooks/useSellerProducts';
import { CreateSellerProduct } from './CreateSellerProduct';
import { SellerProductDetail } from './SellerProductDetail';

export function SellerProductList() {
    const { t } = useTranslation();
    const { data: response, isLoading, refetch } = useSellerProducts();

    const { activeTab, setActiveTab, openTabs, handleAction, closeTab } =
        useManagementTabs<Product>('Sản phẩm');

    const renderTabContent = useCallback(
        (tab: TabItem<Product>) => {
            switch (tab.type) {
                case ManagementTabType.CREATE:
                    return (
                        <CreateSellerProduct
                            key={tab.id}
                            onSuccess={() => setActiveTab(ManagementTabType.LIST)}
                            onCancel={() => closeTab(tab.id)}
                        />
                    );
                case ManagementTabType.DETAIL:
                    return tab.data ? (
                        <SellerProductDetail key={tab.id} product={tab.data} />
                    ) : null;
                default:
                    return null;
            }
        },
        [setActiveTab, closeTab],
    );

    const columnDefs = useMemo<ColDef<Product>[]>(
        () => [
            ...createSellerProductColumns({ t }),
            {
                headerName: t('table.columns.actions'),
                pinned: 'right' as const,
                width: 90,
                sortable: false,
                filter: false,
                suppressHeaderMenuButton: true,
                cellRenderer: (params: ICellRendererParams<Product>) => {
                    const product = params.data;
                    if (!product) return null;
                    return (
                        <Group gap={6} mt={8}>
                            <Tooltip label="Xem chi tiết">
                                <ActionIcon
                                    variant="light"
                                    color="blue"
                                    onClick={() => handleAction('Detail', product, product.name.slice(0, 15))}
                                >
                                    <IconEye size={16} />
                                </ActionIcon>
                            </Tooltip>
                        </Group>
                    );
                },
            },
        ],
        [t, handleAction],
    );

    return (
        <ManagementPage<Product>
            entityName="Sản phẩm"
            rowData={useMemo(() => response?.data ?? [], [response?.data])}
            columnDefs={columnDefs}
            isLoading={isLoading}
            onRefresh={refetch}
            onAdd={() => handleAction('Create')}
            renderTabContent={renderTabContent}
            searchPlaceholder="Tìm theo tên, SKU..."
            listIcon={<IconPackage size={16} />}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            openTabs={openTabs}
            closeTab={closeTab}
        />
    );
}
