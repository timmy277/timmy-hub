'use client';

import { useMemo, useState, useCallback, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Modal,
    Textarea,
    Button,
    Group,
    Stack,
    Box,
} from '@mantine/core';
import Iconify from '@/components/iconify/Iconify';
import { useAdminProducts } from '@/hooks/useProducts';
import { useAction } from 'next-safe-action/hooks';
import { approveProductAction, rejectProductAction, createProductAction } from '@/actions/product.actions';
import { Product } from '@/types/product';
import { ManagementPage } from '@/components/shared/ManagementPage';
import { useManagementTabs, TabItem } from '@/hooks/useManagementTabs';
import { ManagementTabType } from '@/types/enums';
import { createProductColumns, createActionColumn } from '@/constants/column';
import { ProductDetail } from './ProductDetail';
import { ProductForm, ProductFormValues } from './ProductForm';
import { notifications } from '@mantine/notifications';
/**
 * Trang quản lý sản phẩm cho Admin (Sử dụng ManagementPage pattern)
 */
export function ProductList() {
    const { t } = useTranslation();
    const { data: response, isLoading, refetch } = useAdminProducts();

    // Server Actions
    const { execute: approve, isPending: isApproving } = useAction(approveProductAction, {
        onSuccess: () => {
            notifications.show({
                title: t('common.success'),
                message: t('productManagement.approvedSuccess', { defaultValue: 'Đã duyệt sản phẩm thành công' }),
                color: 'green',
                icon: <Iconify icon="tabler:check" width={18} />,
            });
            refetch(); // Refresh list after action
        },
        onError: ({ error }) => {
            notifications.show({
                title: t('common.error'),
                message: error.serverError || 'Lỗi khi duyệt sản phẩm',
                color: 'red',
                icon: <Iconify icon="tabler:x" width={18} />,
            });
        }
    });

    const { execute: reject, isPending: isRejecting } = useAction(rejectProductAction, {
        onSuccess: () => {
            notifications.show({
                title: t('common.success'),
                message: t('productManagement.rejectedSuccess', { defaultValue: 'Đã từ chối sản phẩm' }),
                color: 'orange',
                icon: <Iconify icon="tabler:check" width={18} />,
            });
            setRejectingId(null);
            setRejectNote('');
            refetch(); // Refresh list after action
        },
        onError: ({ error }) => {
            notifications.show({
                title: t('common.error'),
                message: error.serverError || 'Lỗi khi từ chối sản phẩm',
                color: 'red',
                icon: <Iconify icon="tabler:x" width={18} />,
            });
        }
    });

    const { execute: createProduct, isPending: isCreating } = useAction(createProductAction, {
        onSuccess: () => {
            notifications.show({
                title: t('common.success'),
                message: t('productManagement.createSuccess', { defaultValue: 'Tạo sản phẩm thành công' }),
                color: 'green',
                icon: <Iconify icon="tabler:check" width={18} />,
            });
            closeTab(ManagementTabType.CREATE);
            refetch();
        },
        onError: ({ error }) => {
            notifications.show({
                title: t('common.error'),
                message: error.serverError || 'Lỗi khi tạo sản phẩm',
                color: 'red',
                icon: <Iconify icon="tabler:x" width={18} />,
            });
        }
    });

    const { activeTab, setActiveTab, openTabs, handleAction, closeTab } =
        useManagementTabs<Product>('Product');

    const [rejectingId, setRejectingId] = useState<string | null>(null);
    const [rejectNote, setRejectNote] = useState('');

    // ===== Component Logic =====
    const handleFormSubmit = useCallback((values: ProductFormValues) => {
        createProduct(values);
    }, [createProduct]);

    const renderTabContent = useCallback((tab: TabItem<Product>): ReactNode => {
        switch (tab.type) {
            case ManagementTabType.DETAIL:
                return tab.data ? <ProductDetail product={tab.data} /> : null;
            case ManagementTabType.CREATE:
                return (
                    <Box p="xl">
                        <ProductForm onSubmit={handleFormSubmit} isLoading={isCreating} />
                    </Box>
                );
            case ManagementTabType.UPDATE:
                return (
                    <Box p="xl">
                        <ProductForm
                            initialValues={tab.data}
                            onSubmit={() => {
                                // TODO: Implement updateProductAction
                                notifications.show({
                                    title: t('common.info'),
                                    message: 'Update product feature is coming soon',
                                    color: 'blue',
                                });
                            }}
                        />
                    </Box>
                );
            default:
                return null;
        }
    }, [handleFormSubmit, isCreating, t]);

    const handleApprove = useCallback(
        async (product: Product) => {
            approve({ id: product.id });
        },
        [approve],
    );

    const handleRejectClick = useCallback((product: Product) => {
        setRejectingId(product.id);
    }, [setRejectingId]);

    const handleConfirmReject = useCallback(async () => {
        if (!rejectingId) return;
        reject({ id: rejectingId, note: rejectNote });
    }, [rejectingId, rejectNote, reject]);

    const columnDefs = useMemo(
        () => [
            ...createProductColumns({ t }),
            createActionColumn<Product>(
                {
                    onDetail: product => handleAction('Detail', product),
                    onApprove: handleApprove,
                    onReject: handleRejectClick,
                },
                { t },
            ),
        ],
        [t, handleAction, handleApprove, handleRejectClick],
    );

    return (
        <>
            <ManagementPage<Product>
                entityName="Product"
                rowData={useMemo(() => response?.data || [], [response?.data])}
                columnDefs={columnDefs}
                isLoading={isLoading || isApproving}
                onRefresh={refetch}
                onAdd={() => handleAction('Create')}
                renderTabContent={renderTabContent}
                searchPlaceholder={t('productManagement.searchPlaceholder', { defaultValue: 'Tìm kiếm sản phẩm...' })}
                listIcon={<Iconify icon="tabler:package" width={16} />}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                openTabs={openTabs}
                closeTab={closeTab}
            />

            <Modal
                opened={!!rejectingId}
                onClose={() => setRejectingId(null)}
                title={t('productManagement.rejectReason', { defaultValue: 'Lý do từ chối sản phẩm' })}
                centered
            >
                <Stack gap="md">
                    <Textarea
                        label={t('common.note')}
                        placeholder={t('productManagement.rejectPlaceholder', { defaultValue: 'Vui lòng nhập lý do từ chối...' })}
                        minRows={4}
                        value={rejectNote}
                        onChange={e => setRejectNote(e.currentTarget.value)}
                    />
                    <Group justify="flex-end">
                        <Button variant="outline" onClick={() => setRejectingId(null)}>
                            {t('common.cancel')}
                        </Button>
                        <Button
                            color="red"
                            onClick={handleConfirmReject}
                            loading={isRejecting}
                            disabled={!rejectNote.trim()}
                        >
                            {t('common.confirmReject', { defaultValue: 'Xác nhận từ chối' })}
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </>
    );
}
