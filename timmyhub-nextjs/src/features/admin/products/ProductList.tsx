'use client';

import { useMemo, useState, useCallback, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Modal,
    Textarea,
    Button,
    Group,
    Stack,
} from '@mantine/core';
import { IconPackage } from '@tabler/icons-react';
import { useAdminProducts, useApproveProductMutation, useRejectProductMutation } from '@/hooks/useProducts';
import { Product } from '@/types/product';
import { ManagementPage } from '@/components/shared/ManagementPage';
import { useManagementTabs, TabItem } from '@/hooks/useManagementTabs';
import { ManagementTabType } from '@/types/enums';
import { createProductColumns, createActionColumn } from '@/constants/column';
import { ProductDetail } from './ProductDetail';

/**
 * Trang quản lý sản phẩm cho Admin (Sử dụng ManagementPage pattern)
 */
export function ProductList() {
    const { t } = useTranslation();
    const { data: response, isLoading, refetch } = useAdminProducts();
    const approveMutation = useApproveProductMutation();
    const rejectMutation = useRejectProductMutation();

    const { activeTab, setActiveTab, openTabs, handleAction, closeTab } =
        useManagementTabs<Product>('Product');

    const [rejectingId, setRejectingId] = useState<string | null>(null);
    const [rejectNote, setRejectNote] = useState('');

    // ===== Component Logic =====
    const renderTabContent = (tab: TabItem<Product>): ReactNode => {
        switch (tab.type) {
            case ManagementTabType.DETAIL:
                return tab.data ? <ProductDetail product={tab.data} /> : null;
            case ManagementTabType.CREATE:
            case ManagementTabType.UPDATE:
                return (
                    <Group p="xl">
                        {t('common.featureDeveloping')}
                    </Group>
                );
            default:
                return null;
        }
    };

    const handleApprove = useCallback(
        async (product: Product) => {
            await approveMutation.mutateAsync(product.id);
        },
        [approveMutation],
    );

    const handleRejectClick = useCallback((product: Product) => {
        setRejectingId(product.id);
    }, []);

    const handleConfirmReject = useCallback(async () => {
        if (!rejectingId) return;
        await rejectMutation.mutateAsync({ id: rejectingId, note: rejectNote });
        setRejectingId(null);
        setRejectNote('');
    }, [rejectingId, rejectNote, rejectMutation]);

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
                rowData={response?.data || []}
                columnDefs={columnDefs}
                isLoading={isLoading}
                onRefresh={refetch}
                onAdd={() => handleAction('Create')}
                renderTabContent={renderTabContent}
                searchPlaceholder={t('productManagement.searchPlaceholder', { defaultValue: 'Tìm kiếm sản phẩm...' })}
                listIcon={<IconPackage size={16} />}
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
                            loading={rejectMutation.isPending}
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
