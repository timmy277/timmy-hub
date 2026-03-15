import { useState } from 'react';
import {
    Stack,
    Group,
    Text,
    Title,
    Paper,
    Badge,
    Divider,
    SimpleGrid,
    Box,
    ThemeIcon,
    Table,
    ActionIcon,
    Tooltip,
    NumberInput,
    Loader,
    Center,
} from '@mantine/core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Campaign, campaignService, CampaignProduct } from '@/services/campaign.service';
import { voucherService } from '@/services/voucher.service';
import { notifications } from '@mantine/notifications';
import dayjs from 'dayjs';
import Iconify from '@/components/iconify/Iconify';

interface CampaignDetailProps {
    campaign: Campaign;
}

export function CampaignDetail({ campaign }: CampaignDetailProps) {
    const queryClient = useQueryClient();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValues, setEditValues] = useState<{
        campaignPrice?: number;
        discountPercent?: number;
        maxQuantity?: number;
    }>({});

    // Fetch vouchers
    const { data: vouchersRes, isLoading: isLoadingVouchers } = useQuery({
        queryKey: ['vouchers-by-campaign', campaign.id],
        queryFn: () => voucherService.getVouchersByCampaign(campaign.id),
        enabled: !!campaign.id,
    });

    // Fetch campaign products
    const { data: productsRes, isLoading: isLoadingProducts } = useQuery({
        queryKey: ['campaign-products', campaign.id],
        queryFn: () => campaignService.getCampaignProducts(campaign.id),
        enabled: !!campaign.id,
    });

    const vouchers = vouchersRes?.data || [];
    const campaignProducts = productsRes?.data || [];

    // Update product price mutation
    const updateMutation = useMutation({
        mutationFn: ({ productId, data }: {
            productId: string; data: {
                campaignPrice?: number;
                discountPercent?: number;
                maxQuantity?: number;
            }
        }) =>
            campaignService.updateProductPrice(campaign.id, productId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['campaign-products', campaign.id] });
            notifications.show({
                title: 'Thành công',
                message: 'Đã cập nhật giá sản phẩm',
                color: 'green',
            });
            setEditingId(null);
            setEditValues({});
        },
        onError: () => {
            notifications.show({
                title: 'Lỗi',
                message: 'Không thể cập nhật giá sản phẩm',
                color: 'red',
            });
        },
    });

    // Remove products mutation
    const removeMutation = useMutation({
        mutationFn: (productIds: string[]) =>
            campaignService.removeProducts(campaign.id, productIds),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['campaign-products', campaign.id] });
            notifications.show({
                title: 'Thành công',
                message: 'Đã xóa sản phẩm khỏi chiến dịch',
                color: 'green',
            });
        },
    });

    const handleEditStart = (product: CampaignProduct) => {
        setEditingId(product.id);
        setEditValues({
            campaignPrice: product.campaignPrice,
            discountPercent: product.discountPercent,
            maxQuantity: product.maxQuantity,
        });
    };

    const handleEditSave = (productId: string) => {
        updateMutation.mutate({ productId, data: editValues });
    };

    const handleEditCancel = () => {
        setEditingId(null);
        setEditValues({});
    };

    const handleRemove = (productId: string) => {
        removeMutation.mutate([productId]);
    };

    return (
        <Box mt="md" maw={800}>
            <Stack gap="lg">
                <Group justify="space-between">
                    <Stack gap={0}>
                        <Group>
                            <Iconify icon="solar:megaphone-bold-duotone" width={28} color="var(--mantine-color-blue-6)" />
                            <Title order={3}>{campaign.name}</Title>
                            <Badge color={campaign.isActive ? 'green' : 'gray'}>
                                {campaign.isActive ? 'Đang hoạt động' : 'Đã tắt'}
                            </Badge>
                        </Group>
                        <Text color="dimmed" size="sm" mt={4}>
                            {campaign.description || 'Không có mô tả'}
                        </Text>
                    </Stack>
                </Group>

                <Paper withBorder p="md" radius="md">
                    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                        <Stack gap="xs">
                            <Group gap="xs">
                                <Iconify icon="solar:info-circle-bold" width={18} color="var(--mantine-color-indigo-6)" />
                                <Text fw={500}>Thông tin chung</Text>
                            </Group>
                            <Box ml={26}>
                                <Text size="sm"><Text component="span" fw={500}>Loại:</Text> {campaign.type}</Text>
                                <Text size="sm"><Text component="span" fw={500}>Trạng thái:</Text> {campaign.isActive ? 'Đang hoạt động' : 'Tạm dừng/Đã tắt'}</Text>
                            </Box>
                        </Stack>

                        <Stack gap="xs">
                            <Group gap="xs">
                                <Iconify icon="solar:settings-bold" width={18} color="var(--mantine-color-orange-6)" />
                                <Text fw={500}>Cài đặt</Text>
                            </Group>
                            <Box ml={26}>
                                <Text size="sm"><Text component="span" fw={500}>Tự động kích hoạt:</Text> {campaign.isActive ? 'Có' : 'Không'}</Text>
                            </Box>
                        </Stack>
                    </SimpleGrid>
                </Paper>

                <Divider />

                <Stack gap="xs">
                    <Group gap="xs">
                        <Iconify icon="solar:calendar-mark-bold" width={18} color="var(--mantine-color-teal-6)" />
                        <Text fw={500}>Thời gian áp dụng</Text>
                    </Group>
                    <Group ml={26}>
                        <Stack gap={0}>
                            <Text size="sm" color="dimmed">Ngày bắt đầu:</Text>
                            <Text size="sm" fw={500}>{dayjs(campaign.startDate).format('DD/MM/YYYY HH:mm')}</Text>
                        </Stack>
                        <Divider orientation="vertical" />
                        <Stack gap={0}>
                            <Text size="sm" color="dimmed">Ngày kết thúc:</Text>
                            <Text size="sm" fw={500}>{dayjs(campaign.endDate).format('DD/MM/YYYY HH:mm')}</Text>
                        </Stack>
                    </Group>
                </Stack>

                <Divider />

                {/* Products in Campaign */}
                <Stack gap="md">
                    <Group gap="xs">
                        <ThemeIcon size={24} radius="xl" color="red" variant="light">
                            <Iconify icon="solar:tag-bold" width={14} />
                        </ThemeIcon>
                        <Text fw={500}>Sản phẩm giảm giá</Text>
                        <Badge size="sm" variant="outline">{campaignProducts.length}</Badge>
                    </Group>

                    {isLoadingProducts ? (
                        <Center py="md">
                            <Loader size="sm" />
                        </Center>
                    ) : campaignProducts.length > 0 ? (
                        <Table striped highlightOnHover withTableBorder>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Sản phẩm</Table.Th>
                                    <Table.Th>Giá gốc</Table.Th>
                                    <Table.Th>Giá KM</Table.Th>
                                    <Table.Th>% Giảm</Table.Th>
                                    <Table.Th>Max/User</Table.Th>
                                    <Table.Th>Đã bán</Table.Th>
                                    <Table.Th>Thao tác</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {campaignProducts.map((cp) => {
                                    const isEditing = editingId === cp.id;
                                    return (
                                        <Table.Tr key={cp.id}>
                                            <Table.Td>
                                                <Text size="sm" fw={500} lineClamp={1}>
                                                    {cp.product.name}
                                                </Text>
                                            </Table.Td>
                                            <Table.Td>
                                                <Text size="sm">
                                                    {Number(cp.product.price).toLocaleString('vi-VN')}đ
                                                </Text>
                                            </Table.Td>
                                            <Table.Td>
                                                {isEditing ? (
                                                    <NumberInput
                                                        value={editValues.campaignPrice}
                                                        onChange={(v) => setEditValues(prev => ({ ...prev, campaignPrice: v as number }))}
                                                        min={0}
                                                        size="xs"
                                                        style={{ width: 100 }}
                                                    />
                                                ) : (
                                                    <Text size="sm" fw={500} c="red">
                                                        {cp.campaignPrice
                                                            ? Number(cp.campaignPrice).toLocaleString('vi-VN') + 'đ'
                                                            : '-'}
                                                    </Text>
                                                )}
                                            </Table.Td>
                                            <Table.Td>
                                                {isEditing ? (
                                                    <NumberInput
                                                        value={editValues.discountPercent}
                                                        onChange={(v) => setEditValues(prev => ({ ...prev, discountPercent: v as number }))}
                                                        min={0}
                                                        max={100}
                                                        size="xs"
                                                        style={{ width: 70 }}
                                                    />
                                                ) : (
                                                    <Badge color="red" variant="light" size="sm">
                                                        {cp.discountPercent ? `-${cp.discountPercent}%` : '-'}
                                                    </Badge>
                                                )}
                                            </Table.Td>
                                            <Table.Td>
                                                {isEditing ? (
                                                    <NumberInput
                                                        value={editValues.maxQuantity}
                                                        onChange={(v) => setEditValues(prev => ({ ...prev, maxQuantity: v as number }))}
                                                        min={1}
                                                        size="xs"
                                                        style={{ width: 70 }}
                                                    />
                                                ) : (
                                                    <Badge color="blue" variant="light" size="sm">
                                                        {cp.maxQuantity || '-'}
                                                    </Badge>
                                                )}
                                            </Table.Td>
                                            <Table.Td>
                                                <Text size="sm">{cp.soldQuantity}</Text>
                                            </Table.Td>
                                            <Table.Td>
                                                {isEditing ? (
                                                    <Group gap={4}>
                                                        <Tooltip label="Lưu">
                                                            <ActionIcon
                                                                color="green"
                                                                variant="light"
                                                                size="sm"
                                                                onClick={() => handleEditSave(cp.id)}
                                                                loading={updateMutation.isPending}
                                                            >
                                                                <Iconify icon="tabler:plus" width={14} />
                                                            </ActionIcon>
                                                        </Tooltip>
                                                        <Tooltip label="Hủy">
                                                            <ActionIcon
                                                                color="gray"
                                                                variant="light"
                                                                size="sm"
                                                                onClick={handleEditCancel}
                                                            >
                                                                <Iconify icon="tabler:trash" width={14} />
                                                            </ActionIcon>
                                                        </Tooltip>
                                                    </Group>
                                                ) : (
                                                    <Group gap={4}>
                                                        <Tooltip label="Chỉnh sửa">
                                                            <ActionIcon
                                                                variant="subtle"
                                                                size="sm"
                                                                onClick={() => handleEditStart(cp)}
                                                            >
                                                                <Iconify icon="tabler:edit" width={14} />
                                                            </ActionIcon>
                                                        </Tooltip>
                                                        <Tooltip label="Xóa">
                                                            <ActionIcon
                                                                color="red"
                                                                variant="subtle"
                                                                size="sm"
                                                                onClick={() => handleRemove(cp.id)}
                                                                loading={removeMutation.isPending}
                                                            >
                                                                <Iconify icon="tabler:trash" width={14} />
                                                            </ActionIcon>
                                                        </Tooltip>
                                                    </Group>
                                                )}
                                            </Table.Td>
                                        </Table.Tr>
                                    );
                                })}
                            </Table.Tbody>
                        </Table>
                    ) : (
                        <Paper p="md" withBorder radius="md" bg="gray.0">
                            <Text size="sm" c="dimmed" ta="center">
                                Chưa có sản phẩm nào trong chương trình này
                            </Text>
                        </Paper>
                    )}
                </Stack>

                <Divider />

                <Stack gap="xs">
                    <Group gap="xs">
                        <ThemeIcon size={24} radius="xl" color="teal" variant="light">
                            <Iconify icon="solar:ticket-bold" width={14} />
                        </ThemeIcon>
                        <Text fw={500}>Vouchers trong chương trình</Text>
                        <Badge size="sm" variant="outline">{vouchers.length}</Badge>
                    </Group>

                    {isLoadingVouchers ? (
                        <Center py="md">
                            <Loader size="sm" />
                        </Center>
                    ) : vouchers.length > 0 ? (
                        <Table striped highlightOnHover withTableBorder withColumnBorders>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Mã</Table.Th>
                                    <Table.Th>Loại</Table.Th>
                                    <Table.Th>Giá trị</Table.Th>
                                    <Table.Th>Đã dùng</Table.Th>
                                    <Table.Th>Hạn sử dụng</Table.Th>
                                    <Table.Th>Trạng thái</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {vouchers.map((voucher) => (
                                    <Table.Tr key={voucher.id}>
                                        <Table.Td>
                                            <Text fw={600} size="sm">{voucher.code}</Text>
                                        </Table.Td>
                                        <Table.Td>
                                            <Text size="sm">
                                                {voucher.type === 'PERCENTAGE' ? 'Giảm %' :
                                                    voucher.type === 'FREE_SHIPPING' ? 'Freeship' : 'Giảm tiền'}
                                            </Text>
                                        </Table.Td>
                                        <Table.Td>
                                            <Text size="sm">
                                                {voucher.type === 'PERCENTAGE'
                                                    ? `${voucher.value}%`
                                                    : voucher.type === 'FREE_SHIPPING'
                                                        ? 'Miễn phí ship'
                                                        : `${voucher.value.toLocaleString()}đ`}
                                            </Text>
                                        </Table.Td>
                                        <Table.Td>
                                            <Text size="sm">
                                                {voucher.usedCount} {voucher.usageLimit ? `/ ${voucher.usageLimit}` : ''}
                                            </Text>
                                        </Table.Td>
                                        <Table.Td>
                                            <Text size="sm">{dayjs(voucher.endDate).format('DD/MM/YYYY')}</Text>
                                        </Table.Td>
                                        <Table.Td>
                                            <Badge size="sm" color={voucher.isActive ? 'green' : 'gray'}>
                                                {voucher.isActive ? 'Hoạt động' : 'Tắt'}
                                            </Badge>
                                        </Table.Td>
                                    </Table.Tr>
                                ))}
                            </Table.Tbody>
                        </Table>
                    ) : (
                        <Paper p="md" withBorder radius="md" bg="gray.0">
                            <Text size="sm" c="dimmed" ta="center">
                                Chưa có voucher nào trong chương trình này
                            </Text>
                        </Paper>
                    )}
                </Stack>
            </Stack>
        </Box>
    );
}
