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
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconRefresh, IconCheck, IconX } from '@tabler/icons-react';
import { DashboardShell } from '@/components/layout';
import { sellerService } from '@/services/seller.service';

export default function AdminSellerApplicationsPage() {
    const queryClient = useQueryClient();
    const { data: res, isLoading, refetch } = useQuery({
        queryKey: ['admin-seller-applications'],
        queryFn: () => sellerService.listPendingApplications(),
    });

    const approveMutation = useMutation({
        mutationFn: (profileId: string) => sellerService.approveApplication(profileId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-seller-applications'] });
            notifications.show({
                title: 'Đã duyệt',
                message: 'Seller đã được duyệt và có thể đăng nhập gian hàng.',
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
        mutationFn: (profileId: string) => sellerService.rejectApplication(profileId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-seller-applications'] });
            notifications.show({
                title: 'Đã từ chối',
                message: 'Đơn đăng ký seller đã được từ chối.',
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

    const list = (res?.data ?? []) as Array<{
        id: string;
        shopName: string;
        shopSlug: string;
        description?: string | null;
        createdAt: string;
        user: { email: string; profile?: { firstName?: string; lastName?: string } };
    }>;

    return (
        <DashboardShell withFooter={false}>
            <Container fluid px="1rem" py="md">
                <Paper shadow="md" radius="md" withBorder p="md">
                    <Stack gap="lg">
                        <Group justify="space-between">
                            <div>
                                <Title order={3}>Quản lý seller</Title>
                                <Text size="sm" c="dimmed" mt={4}>
                                    Duyệt hoặc từ chối đơn đăng ký gian hàng. Duyệt xong user sẽ trở thành seller.
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
                            <Alert color="gray">Không có đơn nào chờ duyệt.</Alert>
                        ) : (
                            <Table striped highlightOnHover>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>Gian hàng</Table.Th>
                                        <Table.Th>Slug</Table.Th>
                                        <Table.Th>Email</Table.Th>
                                        <Table.Th>Ngày đăng ký</Table.Th>
                                        <Table.Th>Thao tác</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {list.map(row => (
                                        <Table.Tr key={row.id}>
                                            <Table.Td>
                                                <Text fw={500}>{row.shopName}</Text>
                                                {row.description && (
                                                    <Text size="xs" c="dimmed" lineClamp={1}>
                                                        {row.description}
                                                    </Text>
                                                )}
                                            </Table.Td>
                                            <Table.Td>{row.shopSlug}</Table.Td>
                                            <Table.Td>{row.user?.email ?? '-'}</Table.Td>
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
                                                        onClick={() => rejectMutation.mutate(row.id)}
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
