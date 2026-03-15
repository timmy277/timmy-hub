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
} from '@mantine/core';
import Iconify from '@/components/iconify/Iconify';
import { Voucher } from '@/services/voucher.service';
import dayjs from 'dayjs';

interface VoucherDetailProps {
    voucher: Voucher;
}

export function VoucherDetail({ voucher }: VoucherDetailProps) {
    return (
        <Box mt="md" maw={800}>
            <Stack gap="lg">
                <Group justify="space-between">
                    <Stack gap={0}>
                        <Group>
                            <Iconify icon="solar:ticket-bold" width={28} color="var(--mantine-color-blue-6)" />
                            <Title order={3}>{voucher.code}</Title>
                            <Badge color={voucher.isActive ? 'green' : 'gray'}>
                                {voucher.isActive ? 'Đang hoạt động' : 'Đã tắt'}
                            </Badge>
                        </Group>
                        <Text color="dimmed" size="sm" mt={4}>
                            {voucher.description || 'Không có mô tả'}
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
                                <Text size="sm"><Text component="span" fw={500}>Loại:</Text> {voucher.type === 'PERCENTAGE' ? 'Phần trăm' : voucher.type === 'FIXED_AMOUNT' ? 'Cố định' : 'Giao hàng miễn phí'}</Text>
                                <Text size="sm"><Text component="span" fw={500}>Giá trị:</Text> {voucher.value}</Text>
                                {voucher.minOrderValue && <Text size="sm"><Text component="span" fw={500}>Đơn tối thiểu:</Text> {voucher.minOrderValue}</Text>}
                                {voucher.maxDiscount && <Text size="sm"><Text component="span" fw={500}>Giảm tối đa:</Text> {voucher.maxDiscount}</Text>}
                                {voucher.campaign && (
                                    <Group gap={6} mt={2}>
                                        <Text size="sm" component="span" fw={500}>Chương trình:</Text>
                                        <Badge variant="light" color="blue" size="sm" style={{ textTransform: 'none' }}>{voucher.campaign.name}</Badge>
                                    </Group>
                                )}
                            </Box>
                        </Stack>

                        <Stack gap="xs">
                            <Group gap="xs">
                                <Iconify icon="solar:settings-bold" width={18} color="var(--mantine-color-orange-6)" />
                                <Text fw={500}>Cài đặt giới hạn</Text>
                            </Group>
                            <Box ml={26}>
                                <Text size="sm"><Text component="span" fw={500}>Giới hạn sử dụng (Tổng):</Text> {voucher.usageLimit || 'Không giới hạn'}</Text>
                                <Text size="sm"><Text component="span" fw={500}>Số lần đã dùng:</Text> {voucher.usedCount || 0}</Text>
                                <Text size="sm"><Text component="span" fw={500}>Giới hạn mỗi user:</Text> {voucher.perUserLimit || 1}</Text>
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
                            <Text size="sm" fw={500}>{dayjs(voucher.startDate).format('DD/MM/YYYY HH:mm')}</Text>
                        </Stack>
                        <Divider orientation="vertical" />
                        <Stack gap={0}>
                            <Text size="sm" color="dimmed">Ngày kết thúc:</Text>
                            <Text size="sm" fw={500}>{dayjs(voucher.endDate).format('DD/MM/YYYY HH:mm')}</Text>
                        </Stack>
                    </Group>
                </Stack>
            </Stack>
        </Box>
    );
}
