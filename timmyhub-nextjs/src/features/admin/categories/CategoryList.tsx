'use client';

import { ReactNode, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAction } from 'next-safe-action/hooks';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconX, IconCategory } from '@tabler/icons-react';
import { Box } from '@mantine/core';

import { ManagementPage } from '@/components/shared/ManagementPage';
import { useManagementTabs, TabItem } from '@/hooks/useManagementTabs';
import { ManagementTabType } from '@/types/enums';
import { createCategoryColumns, getActionColumn } from '@/constants/column';
import { useCategories } from '@/hooks/useCategories';
import { Category } from '@/types/category';
import { CategoryForm, CategoryFormValues } from './CategoryForm';
import {
    createCategoryAction,
    updateCategoryAction,
    deleteCategoryAction,
} from '@/actions/category.actions';

export default function CategoryList() {
    const { t } = useTranslation();
    const { data: response, isLoading, refetch } = useCategories(true);
    const rowData = useMemo(() => response?.data || [], [response?.data]);

    const { activeTab, setActiveTab, openTabs, handleAction, closeTab } =
        useManagementTabs<Category>('Category');

    // ===== Server Actions =====
    const { execute: createCategory, isPending: isCreating } = useAction(createCategoryAction, {
        onSuccess: () => {
            notifications.show({
                title: t('common.success'),
                message: 'Tạo danh mục thành công',
                color: 'green',
                icon: <IconCheck size={18} />,
            });
            closeTab(ManagementTabType.CREATE);
            refetch();
        },
        onError: ({ error }) => {
            notifications.show({
                title: t('common.error'),
                message: error.serverError || 'Lỗi khi tạo danh mục',
                color: 'red',
                icon: <IconX size={18} />,
            });
        },
    });

    const { execute: updateCategory, isPending: isUpdating } = useAction(updateCategoryAction, {
        onSuccess: () => {
            notifications.show({
                title: t('common.success'),
                message: 'Cập nhật danh mục thành công',
                color: 'green',
                icon: <IconCheck size={18} />,
            });
            openTabs.forEach(tab => {
                if (tab.type === ManagementTabType.UPDATE) {
                    closeTab(tab.id);
                }
            });
            refetch();
        },
        onError: ({ error }) => {
            notifications.show({
                title: t('common.error'),
                message: error.serverError || 'Lỗi khi cập nhật danh mục',
                color: 'red',
                icon: <IconX size={18} />,
            });
        },
    });

    const { execute: deleteCategory, isPending: isDeleting } = useAction(deleteCategoryAction, {
        onSuccess: () => {
            notifications.show({
                title: t('common.success'),
                message: 'Đã xóa danh mục',
                color: 'green',
                icon: <IconCheck size={18} />,
            });
            refetch();
        },
        onError: ({ error }) => {
            notifications.show({
                title: t('common.error'),
                message: error.serverError || 'Lỗi khi xóa danh mục',
                color: 'red',
                icon: <IconX size={18} />,
            });
        },
    });

    // ===== Event Handlers =====
    const handleCreate = useCallback((values: CategoryFormValues) => {
        createCategory(values);
    }, [createCategory]);

    const handleUpdate = useCallback((id: string, values: CategoryFormValues) => {
        updateCategory({ id, data: values });
    }, [updateCategory]);

    const handleDelete = useCallback((category: Category) => {
        if (window.confirm(`Bạn có chắc muốn xóa danh mục "${category.name}"?`)) {
            deleteCategory({ id: category.id });
        }
    }, [deleteCategory]);

    // ===== Table Columns =====
    const columnDefs = useMemo(() => {
        const baseCols = createCategoryColumns({ t });
        const actionCol = getActionColumn<Category>({
            onUpdate: (data) => handleAction('Update', data),
            onDelete: handleDelete,
        });
        return [...baseCols, actionCol];
    }, [t, handleAction, handleDelete]);

    const renderTabContent = useCallback((tab: TabItem<Category>): ReactNode => {
        switch (tab.type) {
            case ManagementTabType.CREATE:
                return (
                    <Box p="xl">
                        <CategoryForm onSubmit={handleCreate} isLoading={isCreating} />
                    </Box>
                );
            case ManagementTabType.UPDATE:
                return (
                    <Box p="xl">
                        <CategoryForm 
                            initialValues={tab.data} 
                            onSubmit={(values) => handleUpdate(tab.data!.id, values)} 
                            isLoading={isUpdating}
                        />
                    </Box>
                );
            default:
                return null;
        }
    }, [handleCreate, handleUpdate, isCreating, isUpdating]);

    return (
        <ManagementPage<Category>
            entityName="Category"
            rowData={rowData}
            columnDefs={columnDefs}
            isLoading={isLoading || isDeleting}
            onRefresh={refetch}
            onAdd={() => handleAction('Create')}
            renderTabContent={renderTabContent}
            searchPlaceholder="Tìm danh mục..."
            listIcon={<IconCategory size={16} />}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            openTabs={openTabs}
            closeTab={closeTab}
        />
    );
}
