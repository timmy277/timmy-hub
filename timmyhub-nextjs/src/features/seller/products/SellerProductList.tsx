'use client';

/**
 * Trang quản lý sản phẩm của Seller
 * Dùng ManagementPage + AG Grid
 */
import { useMemo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ColDef } from 'ag-grid-community';
import Iconify from '@/components/iconify/Iconify';
import { Group, ActionIcon, Tooltip, Modal, Text, Button } from '@mantine/core';
import { ICellRendererParams } from 'ag-grid-community';
import { Product } from '@/types/product';
import { createSellerProductColumns } from '@/constants/column';
import { ManagementPage } from '@/components/shared/ManagementPage';
import { useManagementTabs, TabItem } from '@/hooks/useManagementTabs';
import { ManagementTabType } from '@/types/enums';
import { useSellerProducts, useDeleteSellerProduct } from '@/hooks/useSellerProducts';
import { SellerProductForm } from './SellerProductForm';
import { SellerProductDetail } from './SellerProductDetail';

export function SellerProductList() {
    const { t } = useTranslation();
    const { data: response, isLoading, refetch } = useSellerProducts();
    const deleteMutation = useDeleteSellerProduct();

    const { activeTab, setActiveTab, openTabs, handleAction, closeTab } =
        useManagementTabs<Product>(t('seller.products'));

    const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);

    const renderTabContent = useCallback(
        (tab: TabItem<Product>) => {
            switch (tab.type) {
                case ManagementTabType.CREATE:
                    return (
                        <SellerProductForm
                            key={tab.id}
                            onSuccess={() => {
                                setActiveTab(ManagementTabType.LIST);
                                closeTab(tab.id);
                            }}
                            onCancel={() => closeTab(tab.id)}
                        />
                    );
                case ManagementTabType.UPDATE:
                    return tab.data ? (
                        <SellerProductForm
                            key={tab.id}
                            product={tab.data}
                            onSuccess={() => {
                                setActiveTab(ManagementTabType.LIST);
                                closeTab(tab.id);
                                refetch();
                            }}
                            onCancel={() => closeTab(tab.id)}
                        />
                    ) : null;
                case ManagementTabType.DETAIL:
                    return tab.data ? (
                        <SellerProductDetail key={tab.id} product={tab.data} />
                    ) : null;
                default:
                    return null;
            }
        },
        [setActiveTab, closeTab, refetch],
    );

    const columnDefs = useMemo<ColDef<Product>[]>(
        () => [
            ...createSellerProductColumns({ t }),
            {
                headerName: t('table.columns.actions'),
                pinned: 'right' as const,
                width: 140,
                sortable: false,
                filter: false,
                suppressHeaderMenuButton: true,
                cellRenderer: (params: ICellRendererParams<Product>) => {
                    const product = params.data;
                    if (!product) return null;
                    return (
                        <Group gap={4} mt={8}>
                            <Tooltip label={t('table.actions.edit')}>
                                <ActionIcon
                                    variant="light"
                                    color="blue"
                                    onClick={() => handleAction('Update', product, product.name.slice(0, 15))}
                                >
                                    <Iconify icon="tabler:edit" width={16} />
                                </ActionIcon>
                            </Tooltip>
                            <Tooltip label={t('table.actions.delete')}>
                                <ActionIcon
                                    variant="light"
                                    color="red"
                                    onClick={() => setDeleteProduct(product)}
                                    disabled={(product.soldCount ?? 0) > 0}
                                >
                                    <Iconify icon="tabler:trash" width={16} />
                                </ActionIcon>
                            </Tooltip>
                            <Tooltip label={t('table.actions.view')}>
                                <ActionIcon
                                    variant="light"
                                    color="green"
                                    onClick={() => handleAction('Detail', product, product.name.slice(0, 15))}
                                >
                                    <Iconify icon="tabler:eye" width={16} />
                                </ActionIcon>
                            </Tooltip>
                        </Group>
                    );
                },
            },
        ],
        [t, handleAction],
    );

    const handleDeleteConfirm = () => {
        if (deleteProduct) {
            deleteMutation.mutate(deleteProduct.id, {
                onSuccess: () => {
                    refetch();
                    setDeleteProduct(null);
                },
            });
        }
    };

    return (
        <>
            <ManagementPage<Product>
                entityName={t('seller.products')}
                rowData={useMemo(() => response?.data ?? [], [response?.data])}
                columnDefs={columnDefs}
                isLoading={isLoading}
                onRefresh={refetch}
                onAdd={() => handleAction('Create')}
                renderTabContent={renderTabContent}
                searchPlaceholder={t('seller.searchByNameSku')}
                listIcon={<Iconify icon="tabler:package" width={16} />}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                openTabs={openTabs}
                closeTab={closeTab}
            />

            <Modal
                opened={!!deleteProduct}
                onClose={() => setDeleteProduct(null)}
                title={t('seller.deleteProductTitle')}
                centered
            >
                {deleteProduct && (
                    <div>
                        <p>
                            {t('seller.deleteProductConfirm')}{' '}
                            <strong>{deleteProduct.name}</strong>?
                        </p>
                        {(deleteProduct.soldCount ?? 0) > 0 && (
                            <Text c="red">
                                ⚠️ Sản phẩm này đã có {deleteProduct.soldCount} đơn hàng. Không thể xóa.
                            </Text>
                        )}
                        <Group justify="flex-end" mt="md">
                            <Button
                                onClick={() => setDeleteProduct(null)}
                                disabled={deleteMutation.isPending}
                                style={{ padding: '8px 16px', cursor: 'pointer' }}
                            >
                                {t('common.cancel')}
                            </Button>
                            <Button
                                onClick={handleDeleteConfirm}
                                disabled={deleteMutation.isPending || (deleteProduct.soldCount ?? 0) > 0}
                                style={{
                                    padding: '8px 16px',
                                    cursor: 'pointer',
                                    background: deleteMutation.isPending ? '#ccc' : '#e53935',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                }}
                            >
                                {deleteMutation.isPending ? t('seller.deleting') : t('common.delete')}
                            </Button>
                        </Group>
                    </div>
                )}
            </Modal>
        </>
    );
}
