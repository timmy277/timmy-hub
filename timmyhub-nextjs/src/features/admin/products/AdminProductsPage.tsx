'use client';

import { useMemo, useState, useCallback } from 'react';
import {
    Container,
    Text,
    Stack,
    Group,
    Badge,
    ActionIcon,
    Tooltip,
    Modal,
    Textarea,
    Button,
    Paper,
} from '@mantine/core';
import { useAdminProducts, useApproveProductMutation, useRejectProductMutation } from '@/hooks/useProducts';
import { IconCheck, IconX, IconEye, IconRefresh } from '@tabler/icons-react';
import { BaseDataTable } from '@/components/tables/BaseDataTable';
import { Product, ResourceStatus } from '@/types/product';
import { ColDef, ICellRendererParams } from 'ag-grid-community';
import dayjs from 'dayjs';

/**
 * Trang quản lý sản phẩm cho Admin (Duyệt/Từ chối)
 * @author TimmyHub AI
 */
export function AdminProductsPage() {
    const { data: response, isLoading, refetch } = useAdminProducts();
    const approveMutation = useApproveProductMutation();
    const rejectMutation = useRejectProductMutation();

    const [rejectingId, setRejectingId] = useState<string | null>(null);
    const [rejectNote, setRejectNote] = useState('');

    const handleApprove = useCallback(
        async (id: string) => {
            await approveMutation.mutateAsync(id);
        },
        [approveMutation],
    );

    const handleReject = useCallback(async () => {
        if (!rejectingId) return;
        await rejectMutation.mutateAsync({ id: rejectingId, note: rejectNote });
        setRejectingId(null);
        setRejectNote('');
    }, [rejectingId, rejectNote, rejectMutation]);

    const columnDefs = useMemo<ColDef<Product>[]>(
        () => [
            {
                headerName: 'Sản phẩm',
                field: 'name',
                minWidth: 200,
                cellRenderer: (params: ICellRendererParams<Product>) => (
                    <Stack gap={0} py={4}>
                        <Text size="sm" fw={500}>
                            {params.data?.name}
                        </Text>
                        <Text size="xs" c="dimmed">
                            {params.data?.sku || 'No SKU'}
                        </Text>
                    </Stack>
                ),
            },
            {
                headerName: 'Danh mục',
                valueGetter: params => params.data?.category?.name || 'Chưa phân loại',
            },
            {
                headerName: 'Người bán',
                valueGetter: params => {
                    const profile = params.data?.seller?.profile;
                    if (profile) return `${profile.firstName} ${profile.lastName}`;
                    return params.data?.seller?.email;
                },
            },
            {
                headerName: 'Giá',
                field: 'price',
                valueFormatter: params => `${Number(params.value).toLocaleString()} ₫`,
            },
            {
                headerName: 'Trạng thái',
                field: 'status',
                cellRenderer: (params: ICellRendererParams<Product>) => {
                    const status = params.value as ResourceStatus;
                    const config = {
                        [ResourceStatus.PENDING]: { color: 'yellow', label: 'Chờ duyệt' },
                        [ResourceStatus.APPROVED]: { color: 'green', label: 'Đã duyệt' },
                        [ResourceStatus.REJECTED]: { color: 'red', label: 'Từ chối' },
                        [ResourceStatus.DELETED]: { color: 'gray', label: 'Đã xóa' },
                    };
                    const { color, label } = config[status] || { color: 'gray', label: status };
                    return (
                        <Badge color={color} variant="light" mt={8}>
                            {label}
                        </Badge>
                    );
                },
            },
            {
                headerName: 'Ngày tạo',
                field: 'createdAt',
                valueFormatter: params => dayjs(params.value).format('DD/MM/YYYY HH:mm'),
            },
            {
                headerName: 'Thao tác',
                pinned: 'right',
                width: 150,
                sortable: false,
                filter: false,
                cellRenderer: (params: ICellRendererParams<Product>) => {
                    if (!params.data) return null;
                    const { id, status } = params.data;
                    return (
                        <Group gap="xs" mt={4}>
                            <Tooltip label="Xem chi tiết">
                                <ActionIcon variant="light" color="blue">
                                    <IconEye size={16} />
                                </ActionIcon>
                            </Tooltip>

                            {status === ResourceStatus.PENDING && (
                                <>
                                    <Tooltip label="Duyệt sản phẩm">
                                        <ActionIcon
                                            variant="light"
                                            color="green"
                                            loading={approveMutation.isPending}
                                            onClick={() => handleApprove(id)}
                                        >
                                            <IconCheck size={16} />
                                        </ActionIcon>
                                    </Tooltip>
                                    <Tooltip label="Từ chối">
                                        <ActionIcon
                                            variant="light"
                                            color="red"
                                            onClick={() => setRejectingId(id)}
                                        >
                                            <IconX size={16} />
                                        </ActionIcon>
                                    </Tooltip>
                                </>
                            )}
                        </Group>
                    );
                },
            },
        ],
        [approveMutation.isPending, handleApprove],
    );

    return (
        <Container size="xl" py="md">
            <Stack gap="lg">
                <Group justify="flex-end">
                    <Button
                        leftSection={<IconRefresh size={16} />}
                        variant="subtle"
                        onClick={() => refetch()}
                        loading={isLoading}
                    >
                        Làm mới
                    </Button>
                </Group>

                <Paper withBorder shadow="sm" radius="md">
                    <BaseDataTable
                        rowData={response?.data || []}
                        columnDefs={columnDefs}
                        isLoading={isLoading}
                        height={600}
                    />
                </Paper>
            </Stack>

            <Modal
                opened={!!rejectingId}
                onClose={() => setRejectingId(null)}
                title="Lý do từ chối sản phẩm"
                centered
            >
                <Stack gap="md">
                    <Textarea
                        label="Ghi chú"
                        placeholder="Vui lòng nhập lý do từ chối..."
                        minRows={4}
                        value={rejectNote}
                        onChange={e => setRejectNote(e.currentTarget.value)}
                    />
                    <Group justify="flex-end">
                        <Button variant="outline" onClick={() => setRejectingId(null)}>
                            Hủy
                        </Button>
                        <Button
                            color="red"
                            onClick={handleReject}
                            loading={rejectMutation.isPending}
                            disabled={!rejectNote.trim()}
                        >
                            Xác nhận từ chối
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </Container>
    );
}
