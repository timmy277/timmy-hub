'use client';

import { useState } from 'react';
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
    Modal,
    TextInput,
    NumberInput,
    Textarea,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconRefresh, IconPackage } from '@tabler/icons-react';
import { productService } from '@/services/product.service';
import type { Product } from '@/types/product';

const STATUS_LABEL: Record<string, string> = {
    PENDING: 'Chờ duyệt',
    APPROVED: 'Đã duyệt',
    REJECTED: 'Từ chối',
    DELETED: 'Đã xóa',
};

const STATUS_COLOR: Record<string, string> = {
    PENDING: 'yellow',
    APPROVED: 'green',
    REJECTED: 'red',
    DELETED: 'gray',
};

export default function SellerProductsPage() {
    const queryClient = useQueryClient();
    const [modalOpen, setModalOpen] = useState(false);

    const { data: res, isLoading, refetch } = useQuery({
        queryKey: ['seller-products'],
        queryFn: () => productService.getSellerProducts(),
    });

    const form = useForm({
        initialValues: {
            name: '',
            slug: '',
            description: '',
            price: 0,
            stock: 0,
            sku: '',
        },
        validate: {
            name: v => (!v ? 'Nhập tên sản phẩm' : null),
            slug: v => (!v ? 'Nhập slug' : null),
            price: v => (v < 0 ? 'Giá không hợp lệ' : null),
            stock: v => (v < 0 ? 'Tồn kho không hợp lệ' : null),
        },
    });

    const createMutation = useMutation({
        mutationFn: (data: Parameters<typeof productService.createProduct>[0]) =>
            productService.createProduct(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['seller-products'] });
            setModalOpen(false);
            form.reset();
            notifications.show({
                title: 'Đã đăng',
                message: 'Sản phẩm đã được gửi, chờ admin duyệt.',
                color: 'green',
            });
        },
        onError: (err: unknown) => {
            const ax = err && typeof err === 'object' && 'response' in err ? (err as { response?: { data?: { message?: string } } }).response : undefined;
            const msg = ax?.data?.message ?? (err instanceof Error ? err.message : 'Có lỗi xảy ra');
            notifications.show({ title: 'Lỗi', message: String(msg), color: 'red' });
        },
    });

    const list = (res?.data ?? []) as Product[];

    const handleCreate = form.onSubmit(values => {
        createMutation.mutate({
            name: values.name,
            slug: values.slug.trim().toLowerCase().replace(/\s+/g, '-'),
            description: values.description || undefined,
            price: Number(values.price),
            stock: Number(values.stock),
            sku: values.sku || undefined,
        });
    });

    return (
        <>
            <Container fluid px="1rem" py="md">
                <Paper shadow="md" radius="md" withBorder p="md">
                    <Stack gap="lg">
                        <Group justify="space-between">
                            <div>
                                <Title order={3}>Sản phẩm của tôi</Title>
                                <Text size="sm" c="dimmed" mt={4}>
                                    Đăng sản phẩm mới sẽ ở trạng thái chờ admin duyệt. Chỉ sản phẩm đã duyệt mới hiển thị trên sàn.
                                </Text>
                            </div>
                            <Group>
                                <Button
                                    variant="outline"
                                    leftSection={<IconRefresh size={16} />}
                                    onClick={() => refetch()}
                                    loading={isLoading}
                                >
                                    Làm mới
                                </Button>
                                <Button
                                    leftSection={<IconPlus size={16} />}
                                    onClick={() => setModalOpen(true)}
                                >
                                    Đăng sản phẩm
                                </Button>
                            </Group>
                        </Group>

                        {isLoading ? (
                            <Group justify="center" py="xl">
                                <Loader />
                            </Group>
                        ) : list.length === 0 ? (
                            <Alert color="gray" icon={<IconPackage size={20} />}>
                                Bạn chưa có sản phẩm nào. Nhấn &quot;Đăng sản phẩm&quot; để tạo mới.
                            </Alert>
                        ) : (
                            <Table striped highlightOnHover>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>Sản phẩm</Table.Th>
                                        <Table.Th>Slug</Table.Th>
                                        <Table.Th>Trạng thái</Table.Th>
                                        <Table.Th>Giá</Table.Th>
                                        <Table.Th>Tồn kho</Table.Th>
                                        <Table.Th>Ngày đăng</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {list.map(row => (
                                        <Table.Tr key={row.id}>
                                            <Table.Td>
                                                <Text fw={500}>{row.name}</Text>
                                            </Table.Td>
                                            <Table.Td>
                                                <Text size="sm" c="dimmed">
                                                    {row.slug}
                                                </Text>
                                            </Table.Td>
                                            <Table.Td>
                                                <Badge
                                                    size="sm"
                                                    color={STATUS_COLOR[row.status] ?? 'gray'}
                                                    variant="light"
                                                >
                                                    {STATUS_LABEL[row.status] ?? row.status}
                                                </Badge>
                                            </Table.Td>
                                            <Table.Td>
                                                <Text fw={600}>
                                                    {Number(row.price).toLocaleString('vi-VN')}đ
                                                </Text>
                                            </Table.Td>
                                            <Table.Td>{row.stock}</Table.Td>
                                            <Table.Td>
                                                <Text size="sm">
                                                    {new Date(row.createdAt).toLocaleDateString('vi-VN')}
                                                </Text>
                                            </Table.Td>
                                        </Table.Tr>
                                    ))}
                                </Table.Tbody>
                            </Table>
                        )}
                    </Stack>
                </Paper>
            </Container>

            <Modal
                opened={modalOpen}
                onClose={() => !createMutation.isPending && setModalOpen(false)}
                title="Đăng sản phẩm mới"
                size="md"
            >
                <form onSubmit={handleCreate}>
                    <Stack gap="md">
                        <TextInput
                            label="Tên sản phẩm"
                            placeholder="VD: iPhone 15 Pro Max"
                            required
                            {...form.getInputProps('name')}
                        />
                        <TextInput
                            label="Slug (URL)"
                            placeholder="vd-iphone-15-pro-max"
                            description="Dùng chữ thường, không dấu, cách nhau bằng dấu -"
                            required
                            {...form.getInputProps('slug')}
                        />
                        <Textarea
                            label="Mô tả"
                            placeholder="Mô tả ngắn về sản phẩm"
                            rows={3}
                            {...form.getInputProps('description')}
                        />
                        <NumberInput
                            label="Giá (VNĐ)"
                            min={0}
                            required
                            {...form.getInputProps('price')}
                        />
                        <NumberInput
                            label="Số lượng tồn kho"
                            min={0}
                            required
                            {...form.getInputProps('stock')}
                        />
                        <TextInput
                            label="Mã SKU (tùy chọn)"
                            placeholder="VD: IP15PM-256"
                            {...form.getInputProps('sku')}
                        />
                        <Group justify="flex-end" mt="md">
                            <Button
                                variant="subtle"
                                onClick={() => setModalOpen(false)}
                                disabled={createMutation.isPending}
                            >
                                Hủy
                            </Button>
                            <Button type="submit" loading={createMutation.isPending}>
                                Gửi duyệt
                            </Button>
                        </Group>
                    </Stack>
                </form>
            </Modal>
        </>
    );
}
