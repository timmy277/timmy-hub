'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Container,
    Title,
    Text,
    Paper,
    Group,
    Button,
    Loader,
    Table,
    Stack,
    Alert,
    Badge,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconRefresh, IconCheck, IconX } from '@tabler/icons-react';
import { DashboardShell } from '@/components/layout';
import { productService } from '@/services/product.service';
import type { Product } from '@/types/product';

export default function AdminProductApplicationsPage() {
    const queryClient = useQueryClient();
    const { data: res, isLoading, refetch } = useQuery({
        queryKey: ['admin-product-applications'],
        queryFn: () => productService.getPendingProducts(),
    });

    const approveMutation = useMutation({
        mutationFn: (id: string) => productService.approveProduct(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-product-applications'] });
            notifications.show({
                title: 'Đã duyệt',
                message: 'Sản phẩm đã được duyệt và hiển thị trên sàn.',
                color: 'green',
                icon: <IconCheck size={18} />,
            });
        },
        onError: (err: unknown) => {
            const ax = err && typeof err === 'object' && 'response' in err ? (err as { response?: { data?: { message?: string } } }).response : undefined;
            const msg = ax?.data?.message ?? (err instanceof Error ? err.message : 'Có lỗi xảy ra');
            notifications.show({ title: 'Lỗi', message: String(msg), color: 'red' });
        },
    });
    const rejectMutation = useMutation({
        mutationFn: ({ id, note }: { id: string; note: string }) =>
            productService.rejectProduct(id, note),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-product-applications'] });
            notifications.show({
                title: 'Đã từ chối',
                message: 'Sản phẩm đã được từ chối.',
                color: 'orange',
                icon: <IconX size={18} />,
            });
        },
        onError: (err: unknown) => {
            const ax = err && typeof err === 'object' && 'response' in err ? (err as { response?: { data?: { message?: string } } }).response : undefined;
            const msg = ax?.data?.message ?? (err instanceof Error ? err.message : 'Có lỗi xảy ra');
            notifications.show({ title: 'Lỗi', message: String(msg), color: 'red' });
        },
    });

    const list = (res?.data ?? []) as (Product & {
        seller?: { id: string; email: string; profile?: { firstName?: string; lastName?: string } };
        category?: { id: string; name: string };
    })[];

    return (
        <DashboardShell withFooter={false}>
            <Container fluid px="1rem" py="md">
                <Paper shadow="md" radius="md" withBorder p="md">
                    <Stack gap="lg">
                        <Group justify="space-between">
                            <div>
                                <Title order={3}>Duyệt sản phẩm</Title>
                                <Text size="sm" c="dimmed" mt={4}>
                                    Duyệt hoặc từ chối sản phẩm seller đăng. Chỉ sản phẩm đã duyệt mới hiển thị trên sàn.
                                </Text>
                            </div>
                            <Button
                                variant="outline"
                                leftSection={<IconRefresh size={16} />}
                                onClick={() => refetch()}
                                loading={isLoading}
                            >
                                Làm mới
                            </Button>
                        </Group>

                        {isLoading ? (
                            <Group justify="center" py="xl">
                                <Loader />
                            </Group>
                        ) : list.length === 0 ? (
                            <Alert color="gray">Không có sản phẩm nào chờ duyệt.</Alert>
                        ) : (
                            <Table striped highlightOnHover>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>Sản phẩm</Table.Th>
                                        <Table.Th>Slug</Table.Th>
                                        <Table.Th>Seller</Table.Th>
                                        <Table.Th>Giá</Table.Th>
                                        <Table.Th>Ngày đăng</Table.Th>
                                        <Table.Th>Thao tác</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {list.map(row => (
                                        <Table.Tr key={row.id}>
                                            <Table.Td>
                                                <Text fw={500}>{row.name}</Text>
                                                {row.category && (
                                                    <Badge size="xs" variant="light" mt={4}>
                                                        {row.category.name}
                                                    </Badge>
                                                )}
                                            </Table.Td>
                                            <Table.Td>
                                                <Text size="sm" c="dimmed">
                                                    {row.slug}
                                                </Text>
                                            </Table.Td>
                                            <Table.Td>{row.seller?.email ?? '-'}</Table.Td>
                                            <Table.Td>
                                                <Text fw={600}>
                                                    {Number(row.price).toLocaleString('vi-VN')}đ
                                                </Text>
                                            </Table.Td>
                                            <Table.Td>
                                                <Text size="sm">
                                                    {new Date(row.createdAt).toLocaleDateString('vi-VN')}
                                                </Text>
                                            </Table.Td>
                                            <Table.Td>
                                                <Group gap="xs">
                                                    <Button
                                                        size="xs"
                                                        color="green"
                                                        leftSection={<IconCheck size={14} />}
                                                        loading={approveMutation.isPending}
                                                        onClick={() => approveMutation.mutate(row.id)}
                                                    >
                                                        Duyệt
                                                    </Button>
                                                    <Button
                                                        size="xs"
                                                        color="red"
                                                        variant="light"
                                                        leftSection={<IconX size={14} />}
                                                        loading={rejectMutation.isPending}
                                                        onClick={() =>
                                                            rejectMutation.mutate({
                                                                id: row.id,
                                                                note: 'Không đạt yêu cầu',
                                                            })
                                                        }
                                                    >
                                                        Từ chối
                                                    </Button>
                                                </Group>
                                            </Table.Td>
                                        </Table.Tr>
                                    ))}
                                </Table.Tbody>
                            </Table>
                        )}
                    </Stack>
                </Paper>
            </Container>
        </DashboardShell>
    );
}
