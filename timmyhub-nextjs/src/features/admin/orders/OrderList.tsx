'use client';

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ColDef } from 'ag-grid-community';
import { IconCalendarStats } from '@tabler/icons-react';
import { ManagementPage } from '@/components/shared/ManagementPage';
import { useManagementTabs, TabItem } from '@/hooks/useManagementTabs';
import { ManagementTabType } from '@/types/enums';
import { createOrderColumns, createActionColumn } from '@/constants/column';
import { useQuery } from '@tanstack/react-query';
import { orderService } from '@/services/order.service';
import type { Order } from '@/types/order';
import { OrderDetail } from './OrderDetail';

export function OrderList() {
    const { t } = useTranslation();
    const { data: response, isLoading, refetch } = useQuery({
        queryKey: ['admin-orders'],
        queryFn: () => orderService.getAdminOrders(),
    });

    const { activeTab, setActiveTab, openTabs, handleAction, closeTab } = useManagementTabs<Order>('Order');

    const renderTabContent = (tab: TabItem<Order>) => {
        switch (tab.type) {
            case ManagementTabType.DETAIL:
                return tab.data ? <OrderDetail key={tab.id} order={tab.data} /> : null;
            default:
                return null;
        }
    };

    const columnDefs = useMemo<ColDef<Order>[]>(
        () => [
            ...createOrderColumns({ t }),
            createActionColumn<Order>({ onDetail: order => handleAction('Detail', order) }, { t }),
        ],
        [t, handleAction],
    );

    const rowData = useMemo(() => (response?.data ?? []) as Order[], [response?.data]);

    return (
        <ManagementPage<Order>
            entityName="Order"
            rowData={rowData}
            columnDefs={columnDefs}
            isLoading={isLoading}
            onRefresh={refetch}
            renderTabContent={renderTabContent}
            searchPlaceholder="Tìm đơn hàng..."
            listIcon={<IconCalendarStats size={16} />}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            openTabs={openTabs}
            closeTab={closeTab}
        />
    );
}
